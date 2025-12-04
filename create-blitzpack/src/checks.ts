import chalk from 'chalk';
import { execSync } from 'child_process';

interface CheckResult {
  passed: boolean;
  name: string;
  message?: string;
}

function checkNodeVersion(): CheckResult {
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);

    if (majorVersion >= 20) {
      return {
        passed: true,
        name: 'Node.js',
      };
    }

    return {
      passed: false,
      name: 'Node.js',
      message: `Node.js >= 20.0.0 required (found ${nodeVersion})`,
    };
  } catch {
    return {
      passed: false,
      name: 'Node.js',
      message: 'Failed to check Node.js version',
    };
  }
}

function checkPnpmInstalled(): CheckResult {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return {
      passed: true,
      name: 'pnpm',
    };
  } catch {
    return {
      passed: false,
      name: 'pnpm',
      message: 'pnpm not found. Install: npm install -g pnpm',
    };
  }
}

export async function runPreflightChecks(): Promise<boolean> {
  console.log();
  console.log(chalk.bold('  Checking requirements...'));
  console.log();

  const checks: CheckResult[] = [checkNodeVersion(), checkPnpmInstalled()];

  let hasErrors = false;

  for (const check of checks) {
    if (check.passed) {
      console.log(chalk.green('  ✔'), check.name);
    } else {
      hasErrors = true;
      console.log(chalk.red('  ✖'), check.name);
      if (check.message) {
        console.log(chalk.dim(`    ${check.message}`));
      }
    }
  }

  console.log();

  if (hasErrors) {
    console.log(
      chalk.red('  ✖'),
      'Requirements not met. Please fix the errors above.'
    );
    console.log();
    return false;
  }

  return true;
}
