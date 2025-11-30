import chalk from 'chalk';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';

import { initGit, isGitInstalled } from '../git.js';
import { getProjectOptions } from '../prompts.js';
import { downloadAndPrepareTemplate } from '../template.js';
import { transformFiles } from '../transform.js';
import { printError, printHeader, printSuccess } from '../utils.js';

const ENV_FILES = [
  { from: 'apps/web/.env.local.example', to: 'apps/web/.env.local' },
  { from: 'apps/api/.env.local.example', to: 'apps/api/.env.local' },
];

async function copyEnvFiles(targetDir: string): Promise<void> {
  for (const { from, to } of ENV_FILES) {
    const source = path.join(targetDir, from);
    const dest = path.join(targetDir, to);
    if (await fs.pathExists(source)) {
      await fs.copy(source, dest);
    }
  }
}

function runInstall(cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const child = spawn(isWindows ? 'pnpm.cmd' : 'pnpm', ['install'], {
      cwd,
      stdio: 'ignore',
    });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

interface CreateFlags {
  skipGit?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
}

function printDryRun(options: {
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  targetDir: string;
  skipGit: boolean;
  skipInstall: boolean;
}): void {
  console.log(chalk.yellow('  Dry run mode - no changes will be made'));
  console.log();
  console.log(chalk.bold('  Would create:'));
  console.log();
  console.log(`    ${chalk.cyan('Directory:')}    ${options.targetDir}`);
  console.log(`    ${chalk.cyan('Name:')}         ${options.projectName}`);
  console.log(`    ${chalk.cyan('Slug:')}         ${options.projectSlug}`);
  console.log(
    `    ${chalk.cyan('Description:')}  ${options.projectDescription}`
  );
  console.log();
  console.log(chalk.bold('  Would run:'));
  console.log();
  console.log(`    ${chalk.dim('•')} Download template from GitHub`);
  console.log(`    ${chalk.dim('•')} Transform package.json files`);
  console.log(`    ${chalk.dim('•')} Create .env.local files`);
  if (!options.skipGit) {
    console.log(`    ${chalk.dim('•')} Initialize git repository`);
  }
  if (!options.skipInstall) {
    console.log(`    ${chalk.dim('•')} Install dependencies (pnpm install)`);
  }
  console.log();
}

export async function create(
  projectName: string | undefined,
  flags: CreateFlags
): Promise<void> {
  printHeader();

  const options = await getProjectOptions(projectName, flags);
  if (!options) {
    return;
  }

  const targetDir = path.resolve(process.cwd(), options.projectName);

  if (flags.dryRun) {
    printDryRun({
      projectName: options.projectName,
      projectSlug: options.projectSlug,
      projectDescription: options.projectDescription,
      targetDir,
      skipGit: options.skipGit,
      skipInstall: options.skipInstall,
    });
    return;
  }

  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      printError(`Directory "${options.projectName}" is not empty`);
      return;
    }
  }

  const spinner = ora();

  try {
    spinner.start('Downloading template from GitHub...');
    await downloadAndPrepareTemplate(targetDir);
    spinner.succeed('Downloaded template');

    spinner.start('Configuring project...');
    await transformFiles(targetDir, {
      projectName: options.projectName,
      projectSlug: options.projectSlug,
      projectDescription: options.projectDescription,
    });
    await copyEnvFiles(targetDir);
    spinner.succeed('Configured project');

    if (!options.skipGit && isGitInstalled()) {
      spinner.start('Initializing git repository...');
      const gitSuccess = initGit(targetDir);
      if (gitSuccess) {
        spinner.succeed('Initialized git repository');
      } else {
        spinner.warn('Failed to initialize git repository');
      }
    }

    if (!options.skipInstall) {
      spinner.start('Installing dependencies...');
      const success = await runInstall(targetDir);
      if (success) {
        spinner.succeed('Installed dependencies');
      } else {
        spinner.warn(
          'Failed to install dependencies. Run "pnpm install" manually.'
        );
      }
    }

    printSuccess(options.projectName, options.projectName);
  } catch (error) {
    spinner.fail();
    printError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    process.exit(1);
  }
}
