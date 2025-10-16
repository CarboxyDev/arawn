#!/usr/bin/env node

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

// ANSI color codes for terminal output
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
  info: (msg) => console.log(`${blue}[INFO]${reset} ${msg}`),
  success: (msg) => console.log(`${green}[DONE]${reset} ${msg}`),
  warn: (msg) => console.log(`${yellow}[WARN]${reset} ${msg}`),
  error: (msg) => console.log(`${red}[ERROR]${reset} ${msg}`),
  step: (msg) =>
    console.log(`\n${bright}${cyan}[STEP]${reset} ${bright}${msg}${reset}`),
  dimmed: (msg) => console.log(`${dim}       ${msg}${reset}`),
};

// Animated spinner for long operations
function createSpinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let interval = null;

  return {
    start: () => {
      process.stdout.write(`${blue}[....${reset} ${text}`);
      interval = setInterval(() => {
        process.stdout.write(`\r${blue}[${frames[i]}]${reset}   ${text}`);
        i = (i + 1) % frames.length;
      }, 80);
    },
    succeed: (message) => {
      if (interval) clearInterval(interval);
      process.stdout.write(`\r${green}[DONE]${reset} ${message || text}\n`);
    },
    fail: (message) => {
      if (interval) clearInterval(interval);
      process.stdout.write(`\r${red}[ERROR]${reset} ${message || text}\n`);
    },
    stop: () => {
      if (interval) clearInterval(interval);
      process.stdout.write('\r');
    },
  };
}

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, cwd = ROOT_DIR) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });

    proc.on('error', reject);
  });
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
    execSync('docker-compose ps', { cwd: ROOT_DIR, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isPostgresHealthy() {
  try {
    const output = execSync('docker-compose ps --format json postgres', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    });

    const container = JSON.parse(output);
    return container.Health === 'healthy' || container.State === 'running';
  } catch {
    return false;
  }
}

async function waitForPostgres(maxAttempts = 30) {
  const spinner = createSpinner(
    `Waiting for PostgreSQL to be ready (max ${maxAttempts}s)`
  );
  spinner.start();

  for (let i = 0; i < maxAttempts; i++) {
    if (isPostgresHealthy()) {
      spinner.succeed('PostgreSQL is ready');
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
  console.log(`
${bright}${cyan}┌─────────────────────────────────────────┐
│                                         │
│         Arawn Setup Script              │
│                                         │
└─────────────────────────────────────────┘${reset}
`);

  // Step 1: Check prerequisites
  log.step('Step 1: Checking prerequisites');

  const hasNode = checkCommand('node', 'Node.js');
  const hasPnpm = checkCommand('pnpm', 'pnpm');
  const hasDocker = checkCommand('docker', 'Docker');
  const hasDockerCompose = checkCommand('docker-compose', 'docker-compose');

  if (!hasNode) {
    log.error('Node.js is not installed. Please install Node.js >= 20.0.0');
    process.exit(1);
  }
  log.success('Node.js is installed');

  if (!hasPnpm) {
    log.error('pnpm is not installed. Install it with: npm install -g pnpm');
    process.exit(1);
  }
  log.success('pnpm is installed');

  if (!hasDocker) {
    log.error('Docker is not installed. Please install Docker Desktop');
    process.exit(1);
  }
  log.success('Docker is installed');

  if (!hasDockerCompose) {
    log.error('docker-compose is not installed. Please install Docker Compose');
    process.exit(1);
  }
  log.success('docker-compose is installed');

  if (!checkDockerRunning()) {
    log.error(
      'Docker is not running. Please start Docker Desktop and try again'
    );
    process.exit(1);
  }
  log.success('Docker is running');

  // Step 2: Copy environment files
  log.step('Step 2: Setting up environment files');

  const frontendEnvCopied = copyEnvFile(
    'apps/frontend/.env.local.example',
    'apps/frontend/.env.local'
  );

  const backendEnvCopied = copyEnvFile(
    'apps/backend/.env.local.example',
    'apps/backend/.env.local'
  );

  if (!frontendEnvCopied && !backendEnvCopied) {
    log.info('Environment files already configured');
  }

  // Step 3: Start Docker Compose
  log.step('Step 3: Starting Docker services');

  const isComposeRunning = checkDockerCompose();

  if (isComposeRunning && isPostgresHealthy()) {
    log.info('Docker services are already running');
  } else {
    log.info('Starting PostgreSQL and pgAdmin...');
    await runCommand('docker-compose up -d');
    log.success('Docker services started');

    // Wait for PostgreSQL to be ready
    const isHealthy = await waitForPostgres();

    if (!isHealthy) {
      log.error('PostgreSQL did not become healthy in time');
      log.info('Try running: docker-compose logs postgres');
      process.exit(1);
    }
  }

  // Step 4: Run database migrations
  log.step('Step 4: Running database migrations');

  try {
    await runCommand('pnpm --filter @repo/backend db:migrate', ROOT_DIR);
    log.success('Database migrations completed');
  } catch (error) {
    log.error('Failed to run migrations');
    log.dimmed(error.message);
    process.exit(1);
  }

  // Step 5: Optional database seeding
  log.step('Step 5: Database seeding (optional)');

  const shouldSeed = await promptUser(
    'Do you want to seed the database with example data? (y/N)'
  );

  if (shouldSeed === 'y' || shouldSeed === 'yes') {
    try {
      await runCommand('pnpm --filter @repo/backend db:seed', ROOT_DIR);
      log.success('Database seeded successfully');
    } catch (error) {
      log.warn('Failed to seed database (non-critical)');
      log.dimmed(error.message);
    }
  } else {
    log.info('Skipping database seeding');
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
