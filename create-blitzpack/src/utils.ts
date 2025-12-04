import chalk from 'chalk';
import path from 'path';
import validatePackageName from 'validate-npm-package-name';

export function getCurrentDirName(): string {
  return path.basename(process.cwd());
}

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
  if (name === '.') {
    return { valid: true };
  }
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

export function printSuccess(
  projectName: string,
  targetDir: string,
  ranAutomaticSetup: boolean = false
): void {
  console.log();
  console.log(chalk.green('✔'), chalk.bold(`Created ${projectName}`));
  console.log();

  if (ranAutomaticSetup) {
    console.log(
      chalk.green('✔'),
      chalk.dim('Database setup complete! Ready to start developing.')
    );
    console.log();
    console.log(chalk.bold('  Next steps:'));
    console.log();

    let stepNumber = 1;
    if (targetDir !== '.') {
      console.log(
        chalk.cyan(`  ${stepNumber}.`),
        chalk.bold(`cd ${targetDir}`)
      );
      stepNumber++;
    }

    console.log(chalk.cyan(`  ${stepNumber}.`), chalk.bold('pnpm dev'));
    console.log(chalk.dim('      Start development servers (web + api)'));

    console.log();
    console.log(chalk.dim('  Optional commands:'));
    console.log(
      chalk.dim(
        '    • pnpm db:seed       Add test data (admin accounts, users)'
      )
    );
    console.log(
      chalk.dim('    • pnpm db:studio     Open Prisma Studio to view data')
    );
  } else {
    console.log(
      chalk.dim('  Setup complete! Follow these steps to start developing:')
    );
    console.log();

    let stepNumber = 1;
    if (targetDir !== '.') {
      console.log(
        chalk.cyan(`  ${stepNumber}.`),
        chalk.bold(`cd ${targetDir}`)
      );
      stepNumber++;
    }

    console.log(
      chalk.cyan(`  ${stepNumber}.`),
      chalk.bold('docker compose up -d')
    );
    console.log(chalk.dim('      Start PostgreSQL database (requires Docker)'));
    console.log();
    stepNumber++;

    console.log(chalk.cyan(`  ${stepNumber}.`), chalk.bold('pnpm db:migrate'));
    console.log(chalk.dim('      Run database migrations and setup schema'));
    console.log();
    stepNumber++;

    console.log(chalk.cyan(`  ${stepNumber}.`), chalk.bold('pnpm dev'));
    console.log(chalk.dim('      Start development servers (web + api)'));

    console.log();
    console.log(chalk.dim('  Optional commands:'));
    console.log(
      chalk.dim(
        '    • pnpm db:seed       Add test data (admin accounts, users)'
      )
    );
    console.log(
      chalk.dim('    • pnpm db:studio     Open Prisma Studio to view data')
    );
  }

  console.log();
  console.log(chalk.bold('  Your app will be running at:'));
  console.log(
    chalk.dim('    • Web:      ') + chalk.cyan('http://localhost:3000')
  );
  console.log(
    chalk.dim('    • API:      ') + chalk.cyan('http://localhost:8080/api')
  );
  console.log(
    chalk.dim('    • API Docs: ') + chalk.cyan('http://localhost:8080/docs')
  );
  console.log();
}

export function printError(message: string): void {
  console.log();
  console.log(chalk.red('✖'), message);
  console.log();
}
