/**
 * Arawn Setup Script
 *
 * Automates the initial setup process for the monorepo.
 * Safe to run multiple times - will skip steps that are already complete.
 *
 * What it does:
 * 1. Checks prerequisites (Node.js, pnpm, Docker)
 * 2. Copies .env.local files (if they don't exist)
 * 3. Starts Docker Compose (PostgreSQL + pgAdmin)
 * 4. Waits for PostgreSQL to be healthy
 * 5. Runs database migrations
 * 6. Optionally seeds the database
 */

import { execSync, spawn } from 'child_process';
import { copyFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

// Configuration object for setup parameters
const SETUP_CONFIG = {
  maxWaitTime: 60,
  maxWaitAttempts: 30,
  retryDelay: 1000,
  maxRetries: 3,
  services: ['postgres', 'pgadmin'],
  envFiles: [
    {
      from: 'apps/frontend/.env.local.example',
      to: 'apps/frontend/.env.local',
    },
    { from: 'apps/backend/.env.local.example', to: 'apps/backend/.env.local' },
  ],
  requiredCommands: [
    { command: 'node', name: 'Node.js', versionFlag: '--version' },
    { command: 'pnpm', name: 'pnpm', versionFlag: '--version' },
    { command: 'docker', name: 'Docker', versionFlag: '--version' },
  ],
};

// Command line arguments parsing
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const shouldNotSeed = args.includes('--no-seed');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const { reset, bright, dim, green, yellow, blue, cyan, red } = colors;

// Helper functions
const log = {
  info: (msg) => {
    if (!isDryRun || isVerbose) console.log(`${blue}[INFO]${reset} ${msg}`);
  },
  success: (msg) => {
    if (!isDryRun) console.log(`${green}[DONE]${reset} ${msg}`);
  },
  warn: (msg) => console.log(`${yellow}[WARN]${reset} ${msg}`),
  error: (msg) => console.log(`${red}[ERROR]${reset} ${msg}`),
  step: (msg) =>
    console.log(`\n${bright}${cyan}[STEP]${reset} ${bright}${msg}${reset}`),
  dimmed: (msg) => {
    if (isVerbose) console.log(`${dim}       ${msg}${reset}`);
  },
  dryRun: (msg) => {
    if (isDryRun) console.log(`${dim}[DRY-RUN]${reset} ${msg}`);
  },
};

// Animated spinner for long operations
function createSpinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let interval = null;

  return {
    start: () => {
      if (isDryRun) {
        log.dryRun(`Would start: ${text}`);
        return;
      }
      process.stdout.write(`${blue}[....${reset} ${text}`);
      interval = setInterval(() => {
        process.stdout.write(`\r${blue}[${frames[i]}]${reset}   ${text}`);
        i = (i + 1) % frames.length;
      }, 80);
    },
    succeed: (message) => {
      if (interval) clearInterval(interval);
      if (!isDryRun) {
        process.stdout.write(`\r${green}[DONE]${reset} ${message || text}\n`);
      } else {
        log.dryRun(`Would complete: ${message || text}`);
      }
    },
    fail: (message) => {
      if (interval) clearInterval(interval);
      if (!isDryRun) {
        process.stdout.write(`\r${red}[ERROR]${reset} ${message || text}\n`);
      } else {
        log.dryRun(`Would fail: ${message || text}`);
      }
    },
    stop: () => {
      if (interval) clearInterval(interval);
      if (!isDryRun) {
        process.stdout.write('\r');
      }
    },
  };
}

function checkCommand({ command, name, versionFlag = '--version' }) {
  try {
    execSync(`${command} ${versionFlag}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Docker Compose v2 compatibility with fallback
function runDockerCompose(args, cwd = ROOT_DIR, options = {}) {
  const { quiet = false } = options;
  // Try modern docker compose first
  const modernCmd = `docker compose ${args}`;
  const legacyCmd = `docker-compose ${args}`;

  try {
    if (isDryRun) {
      log.dryRun(`Would run: ${modernCmd}`);
      return;
    }
    // Use 'pipe' for quiet mode to suppress verbose output, 'inherit' for normal mode
    const stdio = quiet ? 'pipe' : 'inherit';
    return execSync(modernCmd, { cwd, stdio });
  } catch (error) {
    // Fallback to legacy docker-compose
    try {
      if (isDryRun) {
        log.dryRun(`Would run (fallback): ${legacyCmd}`);
        return;
      }
      const stdio = quiet ? 'pipe' : 'inherit';
      return execSync(legacyCmd, { cwd, stdio });
    } catch (fallbackError) {
      throw new Error(
        `Both 'docker compose' and 'docker-compose' failed. Modern error: ${error.message}. Legacy error: ${fallbackError.message}`
      );
    }
  }
}

function runCommand(command, cwd = ROOT_DIR) {
  return new Promise((resolve, reject) => {
    if (isDryRun) {
      log.dryRun(`Would run: ${command}`);
      // Simulate successful execution in dry run mode
      setTimeout(resolve, 100);
      return;
    }

    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });

    proc.on('error', reject);
  });
}

// Utility function for delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry wrapper for commands
async function runCommandWithRetry(command, options = {}) {
  const {
    maxRetries = SETUP_CONFIG.maxRetries,
    delay = SETUP_CONFIG.retryDelay,
  } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await runCommand(command);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      log.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

function checkDockerRunning() {
  try {
    execSync('docker ps', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkDockerCompose() {
  try {
    runDockerCompose('ps', ROOT_DIR, { quiet: true });
    return true;
  } catch {
    return false;
  }
}

function isPostgresHealthy() {
  try {
    // Try multiple methods to check PostgreSQL health
    const modernCmd = 'docker compose ps --format json postgres';
    const legacyCmd = 'docker-compose ps --format json postgres';

    let output;
    try {
      output = execSync(modernCmd, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    } catch {
      output = execSync(legacyCmd, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    }

    const container = JSON.parse(output);
    return container.Health === 'healthy' || container.State === 'running';
  } catch {
    return false;
  }
}

async function waitForPostgres(maxAttempts = SETUP_CONFIG.maxWaitAttempts) {
  const spinner = createSpinner(
    `Waiting for PostgreSQL to be ready (max ${maxAttempts}s)`
  );
  spinner.start();

  for (let i = 0; i < maxAttempts; i++) {
    if (isPostgresHealthy()) {
      spinner.succeed('PostgreSQL is ready');
      return true;
    }
    await sleep(1000);
  }

  spinner.fail('PostgreSQL did not become healthy in time');
  return false;
}

function copyEnvFile(from, to) {
  const source = resolve(ROOT_DIR, from);
  const dest = resolve(ROOT_DIR, to);

  if (existsSync(dest)) {
    log.dimmed(`${to} already exists, skipping`);
    return false;
  }

  if (!existsSync(source)) {
    log.error(`Source file not found: ${from}`);
    return false;
  }

  if (isDryRun) {
    log.dryRun(`Would copy ${from} to ${to}`);
    return true;
  }

  copyFileSync(source, dest);
  log.success(`Created ${to}`);
  return true;
}

async function promptUser(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${yellow}[?]${reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function main() {
  if (isDryRun) {
    console.log(`
${bright}${cyan}┌─────────────────────────────────────────┐
│                                         │
│      Arawn Setup Script (DRY RUN)       │
│                                         │
└─────────────────────────────────────────┘${reset}
`);
  } else {
    console.log(`
${bright}${cyan}┌─────────────────────────────────────────┐
│                                         │
│         Arawn Setup Script              │
│                                         │
└─────────────────────────────────────────┘${reset}
`);
  }

  // Handle dry run early exit
  if (isDryRun) {
    log.info('DRY RUN MODE - No changes will be made');
    log.step('Step 1: Checking prerequisites (simulated)');

    SETUP_CONFIG.requiredCommands.forEach(({ command, name }) => {
      log.dryRun(`Would check ${name}`);
      log.dryRun(`${name} would be available`);
    });

    log.step('Step 2: Setting up environment files (simulated)');
    SETUP_CONFIG.envFiles.forEach(({ from, to }) => {
      log.dryRun(`Would copy ${from} to ${to}`);
    });

    log.step('Step 3: Starting Docker services (simulated)');
    log.dryRun('Would run: docker compose up -d');

    log.step('Step 4: Running database migrations (simulated)');
    log.dryRun('Would run: pnpm --filter @repo/backend db:migrate');

    log.step('Step 5: Database seeding (simulated)');
    if (!shouldNotSeed) {
      log.dryRun('Would run: pnpm --filter @repo/backend db:seed');
    } else {
      log.dryRun('Would skip database seeding');
    }

    console.log(`
${green}${bright}┌─────────────────────────────────────────┐
│                                         │
│        DRY RUN Complete                  │
│                                         │
└─────────────────────────────────────────┘${reset}

${bright}To run the actual setup:${reset}
  ${cyan}node scripts/setup.js${reset}
`);
    return;
  }

  // Step 1: Check prerequisites
  log.step('Step 1: Checking prerequisites');

  // Check all required commands using configuration
  for (const { command, name, versionFlag } of SETUP_CONFIG.requiredCommands) {
    const isAvailable = checkCommand({ command, name, versionFlag });
    if (!isAvailable) {
      log.error(`${name} is not installed. Please install ${name}`);
      process.exit(1);
    }
    log.success(`${name} is installed`);
  }

  // Check Docker Compose separately since it needs special handling
  const hasDockerCompose = checkDockerCompose();
  if (!hasDockerCompose) {
    log.error('docker-compose/docker compose is not available');
    process.exit(1);
  }
  log.success('Docker Compose is available');

  if (!checkDockerRunning()) {
    log.error(
      'Docker is not running. Please start Docker Desktop and try again'
    );
    process.exit(1);
  }
  log.success('Docker is running');

  // Step 2: Copy environment files
  log.step('Step 2: Setting up environment files');

  // Use configuration for environment files
  let anyEnvCopied = false;
  for (const { from, to } of SETUP_CONFIG.envFiles) {
    const copied = copyEnvFile(from, to);
    if (copied) anyEnvCopied = true;
  }

  if (!anyEnvCopied) {
    log.info('Environment files already configured');
  }

  // Step 3: Start Docker Compose
  log.step('Step 3: Starting Docker services');

  const isComposeRunning = checkDockerCompose();

  if (isComposeRunning && isPostgresHealthy()) {
    log.info('Docker services are already running');
  } else {
    log.info('Starting PostgreSQL and pgAdmin...');
    runDockerCompose('up -d', ROOT_DIR, { quiet: true });
    log.success('Docker services started');

    // Wait for PostgreSQL to be ready
    const isHealthy = await waitForPostgres();

    if (!isHealthy) {
      log.error('PostgreSQL did not become healthy in time');
      log.info('Try running: docker compose logs postgres');
      process.exit(1);
    }
  }

  // Step 4: Run database migrations
  log.step('Step 4: Running database migrations');

  try {
    await runCommandWithRetry('pnpm --filter @repo/backend db:migrate', {
      maxRetries: SETUP_CONFIG.maxRetries,
      delay: SETUP_CONFIG.retryDelay,
    });
    log.success('Database migrations completed');
  } catch (error) {
    log.error('Failed to run migrations');
    log.dimmed(error.message);
    process.exit(1);
  }

  // Step 5: Optional database seeding
  log.step('Step 5: Database seeding (optional)');

  // Handle seeding based on command line flags
  if (shouldNotSeed) {
    log.info('Skipping database seeding (use --seed flag to enable)');
    log.dimmed(
      'Tip: Run "pnpm --filter @repo/backend db:seed" manually if needed'
    );
  } else {
    if (isDryRun) {
      log.dryRun('Would run: pnpm --filter @repo/backend db:seed');
    } else {
      try {
        await runCommandWithRetry('pnpm --filter @repo/backend db:seed', {
          maxRetries: SETUP_CONFIG.maxRetries,
          delay: SETUP_CONFIG.retryDelay,
        });
        log.success('Database seeded successfully');
      } catch (error) {
        log.warn('Failed to seed database (non-critical)');
        log.dimmed(error.message);
      }
    }
  }

  // Done!
  console.log(`
${green}${bright}┌─────────────────────────────────────────┐
│                                         │
│           Setup Complete                │
│                                         │
└─────────────────────────────────────────┘${reset}

${bright}Next steps:${reset}

  1. Start development servers:
     ${cyan}pnpm dev${reset}

  2. Open your browser:
     ${dim}Frontend:${reset}  http://localhost:3000
     ${dim}Backend:${reset}   http://localhost:8080
     ${dim}API Docs:${reset}  http://localhost:8080/docs
     ${dim}pgAdmin:${reset}   http://localhost:5050

${bright}Setup options:${reset}
  ${cyan}node scripts/setup.js${reset}          Run setup with seeding (default)
  ${cyan}node scripts/setup.js --no-seed${reset} Setup without database seeding
  ${cyan}node scripts/setup.js --dry-run${reset} Preview what would be executed

${dim}Tip: You can run this setup script again anytime - it's safe!${reset}
`);
}

// Run the script
(async () => {
  try {
    await main();
  } catch (error) {
    log.error('Setup failed');
    console.error(error);
    process.exit(1);
  }
})();
