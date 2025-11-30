import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateProjectName(name: string): {
  valid: boolean;
  problems?: string[];
} {
  const result = validatePackageName(name);
  if (result.validForNewPackages) {
    return { valid: true };
  }
  const problems = [...(result.errors || []), ...(result.warnings || [])];
  return { valid: false, problems };
}

export function printHeader(): void {
  console.log();
  console.log(chalk.bold.cyan('  Create Blitzpack'));
  console.log(chalk.dim('  Full-stack TypeScript monorepo'));
  console.log();
}

export function printSuccess(projectName: string, targetDir: string): void {
  console.log();
  console.log(chalk.green('✔'), chalk.bold(`Created ${projectName}`));
  console.log();
  console.log(chalk.bold('  Next steps:'));
  console.log();
  console.log(chalk.cyan('  1.'), `cd ${targetDir}`);
  console.log(
    chalk.cyan('  2.'),
    'docker compose up -d',
    chalk.dim('  # Start PostgreSQL')
  );
  console.log(
    chalk.cyan('  3.'),
    'pnpm db:migrate',
    chalk.dim('       # Run database migrations')
  );
  console.log(
    chalk.cyan('  4.'),
    'pnpm dev',
    chalk.dim('              # Start dev servers')
  );
  console.log();
  console.log(
    chalk.dim('  Optional: pnpm db:seed to add test data like admin accounts')
  );
  console.log();
  console.log(
    chalk.dim('  Web: http://localhost:3000 | API: http://localhost:8080')
  );
  console.log();
}

export function printError(message: string): void {
  console.log();
  console.log(chalk.red('✖'), message);
  console.log();
}
