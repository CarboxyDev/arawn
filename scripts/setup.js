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
import { basename, dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const PROJECT_NAME = basename(ROOT_DIR); // Used for Docker container naming

// Configuration object for setup parameters
const SETUP_CONFIG = {
  maxWaitTime: 60,
  maxWaitAttempts: 30,
  retryDelay: 1000,
  maxRetries: 3,
  services: ['postgres'],
  ports: [
    { port: 5432, service: 'PostgreSQL' },
    { port: 3000, service: 'Frontend (Next.js)' },
    { port: 8080, service: 'Backend (NestJS)' },
  ],
  envFiles: [
    {
      from: 'apps/frontend/.env.local.example',
      to: 'apps/frontend/.env.local',
    },
    { from: 'apps/backend/.env.local.example', to: 'apps/backend/.env.local' },
  ],
  requiredCommands: [
    {
      command: 'node',
      name: 'Node.js',
      versionFlag: '--version',
      minVersion: '20.0.0',
    },
    {
      command: 'pnpm',
      name: 'pnpm',
      versionFlag: '--version',
      minVersion: '9.0.0',
    },
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

function compareVersions(current, required) {
  const parseCurrent = current.match(/(\d+)\.(\d+)\.(\d+)/);
  const parseRequired = required.match(/(\d+)\.(\d+)\.(\d+)/);

  if (!parseCurrent || !parseRequired) return true;

  const [, currMajor, currMinor, currPatch] = parseCurrent.map(Number);
  const [, reqMajor, reqMinor, reqPatch] = parseRequired.map(Number);

  if (currMajor !== reqMajor) return currMajor > reqMajor;
  if (currMinor !== reqMinor) return currMinor > reqMinor;
  return currPatch >= reqPatch;
}

function checkVersion({
  command,
  name,
  versionFlag = '--version',
  minVersion,
}) {
  if (!minVersion) return { valid: true };

  try {
    const output = execSync(`${command} ${versionFlag}`, {
      encoding: 'utf-8',
    }).trim();
    const version = output.match(/v?(\d+\.\d+\.\d+)/)?.[1];

    if (!version) return { valid: true, version: 'unknown' };

    const valid = compareVersions(version, minVersion);
    return { valid, version, minVersion };
  } catch {
    return { valid: false };
  }
}

function checkPortAvailable(port) {
  try {
    execSync(`lsof -i :${port} -sTCP:LISTEN`, { stdio: 'pipe' });
    return false;
  } catch {
    return true;
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

async function startDockerDesktop() {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      log.info('Starting Docker Desktop...');
      execSync('open -a Docker', { stdio: 'ignore' });
    } else if (platform === 'linux') {
      log.info('Starting Docker service...');
      execSync('sudo systemctl start docker', { stdio: 'ignore' });
    } else if (platform === 'win32') {
      log.info('Starting Docker Desktop...');
      execSync(
        'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
        {
          stdio: 'ignore',
          shell: true,
        }
      );
    }

    const spinner = createSpinner('Waiting for Docker to start (max 30s)');
    spinner.start();

    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      if (checkDockerRunning()) {
        spinner.succeed('Docker is now running');
        return true;
      }
    }

    spinner.fail('Docker did not start in time');
    return false;
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
  const setupState = {
    portsChecked: false,
    envFilesCopied: false,
    dockerStarted: false,
    migrationsRan: false,
    seeded: false,
  };

  // Cleanup handler for interruptions
  const cleanup = () => {
    log.warn('\nSetup interrupted by user');
    console.log(`
${yellow}Setup was interrupted. You can safely run the setup again:${reset}
  ${cyan}node scripts/setup.js${reset}

${dim}The script will skip any completed steps automatically.${reset}
`);
    process.exit(130); // Standard exit code for SIGINT
  };

  // Register cleanup handlers
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

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

  log.step('Step 1: Checking prerequisites');

  for (const { port, service } of SETUP_CONFIG.ports) {
    if (!checkPortAvailable(port)) {
      log.error(`Port ${port} is already in use (needed for ${service})`);
      console.log(`
${yellow}Troubleshooting:${reset}
  ${dim}•${reset} Find process: ${cyan}lsof -i :${port}${reset}
  ${dim}•${reset} Kill process: ${cyan}kill -9 $(lsof -t -i :${port})${reset}
`);
      process.exit(1);
    }
  }
  setupState.portsChecked = true;
  log.success('All required ports are available');

  for (const cmdConfig of SETUP_CONFIG.requiredCommands) {
    const { name, minVersion } = cmdConfig;

    if (!checkCommand(cmdConfig)) {
      log.error(`${name} is not installed`);
      console.log(`
${yellow}Installation required:${reset}
  ${dim}•${reset} Visit: ${cyan}https://nodejs.org${reset} (Node.js)
  ${dim}•${reset} Visit: ${cyan}https://pnpm.io/installation${reset} (pnpm)
`);
      process.exit(1);
    }

    const versionCheck = checkVersion(cmdConfig);
    if (!versionCheck.valid) {
      log.error(
        `${name} version ${versionCheck.version} is below required ${versionCheck.minVersion}`
      );
      process.exit(1);
    }

    if (minVersion && versionCheck.version) {
      log.success(`${name} ${versionCheck.version} (>= ${minVersion})`);
    } else {
      log.success(`${name} is installed`);
    }
  }

  if (!checkDockerRunning()) {
    log.warn('Docker is not running');
    const started = await startDockerDesktop();

    if (!started) {
      log.error('Failed to start Docker automatically');
      console.log(`
${yellow}Please start Docker manually:${reset}
  ${dim}•${reset} macOS: Open Docker Desktop from Applications
  ${dim}•${reset} Windows: Start Docker Desktop from Start Menu
  ${dim}•${reset} Linux: ${cyan}sudo systemctl start docker${reset}
`);
      process.exit(1);
    }
  } else {
    log.success('Docker is running');
  }

  const hasDockerCompose = checkDockerCompose();
  if (!hasDockerCompose) {
    log.error('docker-compose/docker compose is not available');
    process.exit(1);
  }
  log.success('Docker Compose is available');

  // Step 2: Copy environment files
  log.step('Step 2: Setting up environment files');

  let anyEnvCopied = false;
  for (const { from, to } of SETUP_CONFIG.envFiles) {
    const copied = copyEnvFile(from, to);
    if (copied) anyEnvCopied = true;
  }

  if (!anyEnvCopied) {
    log.info('Environment files already configured');
  } else {
    setupState.envFilesCopied = true;
  }

  log.step('Step 3: Starting Docker services');

  const isComposeRunning = checkDockerCompose();

  if (isComposeRunning && isPostgresHealthy()) {
    log.info('Docker services are already running');
  } else {
    log.info('Starting PostgreSQL...');
    runDockerCompose('up -d', ROOT_DIR, { quiet: true });
    log.success('PostgreSQL started');
    setupState.dockerStarted = true;

    const isHealthy = await waitForPostgres();

    if (!isHealthy) {
      log.error('PostgreSQL did not become healthy in time');
      console.log(`
${yellow}Troubleshooting:${reset}
  ${dim}•${reset} Check logs: ${cyan}docker compose logs postgres${reset}
  ${dim}•${reset} Verify Docker: ${cyan}docker ps${reset}
  ${dim}•${reset} Restart: ${cyan}docker compose restart postgres${reset}
  ${dim}•${reset} Reset: ${cyan}docker compose down -v && node scripts/setup.js${reset}
`);
      process.exit(1);
    }
  }

  log.step('Step 4: Running database migrations');

  try {
    const migrateStatus = execSync(
      'pnpm --filter @repo/backend dotenv -e .env.local -- prisma migrate status',
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: 'pipe' }
    );

    if (migrateStatus.includes('Database schema is up to date')) {
      log.info('Database migrations already up-to-date');
    } else {
      await runCommandWithRetry('pnpm --filter @repo/backend db:migrate', {
        maxRetries: SETUP_CONFIG.maxRetries,
        delay: SETUP_CONFIG.retryDelay,
      });
      log.success('Database migrations completed');
      setupState.migrationsRan = true;
    }
  } catch (error) {
    log.error('Failed to run migrations');
    console.log(`
${yellow}Troubleshooting:${reset}
  ${dim}•${reset} Check DATABASE_URL: ${cyan}cat apps/backend/.env.local${reset}
  ${dim}•${reset} Verify PostgreSQL: ${cyan}docker compose ps postgres${reset}
  ${dim}•${reset} Check connection: ${cyan}docker exec -it ${PROJECT_NAME}-postgres-1 psql -U postgres -d app_dev -c "\\dt"${reset}
  ${dim}•${reset} Reset database: ${cyan}docker compose down -v && node scripts/setup.js${reset}
`);
    process.exit(1);
  }

  log.step('Step 5: Database seeding (optional)');

  if (shouldNotSeed) {
    log.info('Skipping database seeding (--no-seed flag)');
    log.dimmed(
      'Tip: Run "pnpm --filter @repo/backend db:seed" manually if needed'
    );
  } else {
    try {
      await runCommandWithRetry('pnpm --filter @repo/backend db:seed', {
        maxRetries: SETUP_CONFIG.maxRetries,
        delay: SETUP_CONFIG.retryDelay,
      });
      log.success('Database seeded successfully');
      setupState.seeded = true;
    } catch (error) {
      log.warn('Failed to seed database (non-critical)');
      log.dimmed(error.message);
    }
  }

  console.log(`
${green}${bright}┌─────────────────────────────────────────┐
│                                         │
│           Setup Complete                │
│                                         │
└─────────────────────────────────────────┘${reset}

${bright}Setup Summary:${reset}
  ${setupState.portsChecked ? green + '✓' : dim + '○'}${reset} Ports available (5432, 3000, 8080)
  ${setupState.envFilesCopied ? green + '✓' : dim + '○'}${reset} Environment files ${setupState.envFilesCopied ? 'created' : 'already configured'}
  ${setupState.dockerStarted ? green + '✓' : dim + '○'}${reset} PostgreSQL ${setupState.dockerStarted ? 'started' : 'already running'}
  ${setupState.migrationsRan ? green + '✓' : dim + '○'}${reset} Database migrations ${setupState.migrationsRan ? 'applied' : 'up-to-date'}
  ${setupState.seeded ? green + '✓' : dim + '○'}${reset} Database ${setupState.seeded ? 'seeded' : shouldNotSeed ? 'not seeded (--no-seed)' : 'seeding skipped'}

${bright}Next steps:${reset}

  1. Start development servers:
     ${cyan}pnpm dev${reset}

  2. Open your browser:
     ${dim}Frontend:${reset}      http://localhost:3000
     ${dim}Backend:${reset}       http://localhost:8080
     ${dim}API Docs:${reset}      http://localhost:8080/docs

${bright}Database tools:${reset}
  ${cyan}pnpm db:studio${reset}                        Open Prisma Studio (recommended)
  ${cyan}docker compose --profile tools up -d${reset}  Start pgAdmin (optional)

${dim}Tip: You can run this setup script again anytime - it's safe!${reset}
`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    log.error('Setup failed');
    console.error(error);
    process.exit(1);
  }
})();
