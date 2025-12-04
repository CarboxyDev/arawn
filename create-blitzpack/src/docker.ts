import { execSync } from 'child_process';

export function isDockerInstalled(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function isDockerRunning(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export function runDockerCompose(targetDir: string): boolean {
  try {
    execSync('docker compose up -d', {
      cwd: targetDir,
      stdio: 'inherit',
    });
    return true;
  } catch {
    return false;
  }
}

export function runDatabaseMigrations(targetDir: string): boolean {
  try {
    const isWindows = process.platform === 'win32';
    execSync(isWindows ? 'pnpm.cmd db:migrate' : 'pnpm db:migrate', {
      cwd: targetDir,
      stdio: 'inherit',
    });
    return true;
  } catch {
    return false;
  }
}
