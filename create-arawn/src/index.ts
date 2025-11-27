#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { existsSync } from 'fs';
import fs from 'fs-extra';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const { ensureDir } = fs;

import { copyTemplate, getTemplateConfig } from './copy.js';
import { getUserInput } from './prompts.js';
import { createVariables, replaceVariablesInProject } from './replace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Support both development (template in parent) and production (template in dist/../template)
function getTemplateDir(): string {
  const inPackageTemplate = resolve(__dirname, '..', 'template');
  const templateConfigPath = resolve(inPackageTemplate, '.template.json');

  // Check if .template.json exists in the package template directory
  if (existsSync(templateConfigPath)) {
    return inPackageTemplate;
  }

  // Fallback for development: look for template in the monorepo root
  // __dirname is create-arawn/dist, so we need to go up 2 levels
  const monorepoRoot = resolve(__dirname, '..', '..');
  return resolve(monorepoRoot);
}

interface CLIOptions {
  skip?: boolean;
}

async function createProject(
  suggestedPath?: string,
  options: CLIOptions = {}
): Promise<void> {
  try {
    const TEMPLATE_DIR = getTemplateDir();

    // Validate template directory exists
    if (!existsSync(TEMPLATE_DIR)) {
      throw new Error(
        `Template directory not found at ${TEMPLATE_DIR}. Make sure create-arawn is properly installed.`
      );
    }

    console.log(
      `\n${chalk.cyan.bold('┌─────────────────────────────────────────┐')}`
    );
    console.log(
      `${chalk.cyan.bold('│')}${chalk.bold('  Creating Arawn Project'.padEnd(41))}${chalk.cyan.bold('│')}`
    );
    console.log(
      `${chalk.cyan.bold('└─────────────────────────────────────────┘')}\n`
    );

    // Step 1: Get user input
    console.log(chalk.blue('Step 1: Project Details'));
    const userInput = await getUserInput(suggestedPath);
    console.log(chalk.green('✓') + ' Project details captured\n');

    // Step 2: Validate target directory
    console.log(chalk.blue('Step 2: Setting up project directory'));
    const targetDir = resolve(userInput.projectSlug);

    if (existsSync(targetDir)) {
      throw new Error(`Directory ${targetDir} already exists`);
    }

    await ensureDir(targetDir);
    console.log(
      chalk.green('✓') + ` Created directory: ${chalk.dim(targetDir)}\n`
    );

    // Step 3: Copy template
    console.log(chalk.blue('Step 3: Copying template files'));
    const templateConfig = await getTemplateConfig(TEMPLATE_DIR);
    await copyTemplate(TEMPLATE_DIR, targetDir, templateConfig);
    console.log(chalk.green('✓') + ' Template files copied\n');

    // Step 4: Replace variables
    console.log(chalk.blue('Step 4: Customizing project'));
    const variables = createVariables({
      projectName: userInput.projectName,
      projectSlug: userInput.projectSlug,
      description: userInput.description,
    });

    await replaceVariablesInProject(
      targetDir,
      variables,
      templateConfig.replaceable
    );
    console.log(chalk.green('✓') + ' Variables replaced\n');

    // Step 5: Install dependencies
    if (!options.skip) {
      console.log(chalk.blue('Step 5: Installing dependencies'));
      console.log(chalk.dim('This may take a few minutes...\n'));

      try {
        // Detect package manager
        const hasYarn = existsSync(join(process.cwd(), 'yarn.lock'));
        const hasPnpm = existsSync(join(process.cwd(), 'pnpm-lock.yaml'));

        let installCmd = 'npm install';
        if (hasPnpm) {
          installCmd = 'pnpm install';
        } else if (hasYarn) {
          installCmd = 'yarn install';
        }

        execSync(installCmd, { cwd: targetDir, stdio: 'inherit' });
        console.log('\n' + chalk.green('✓') + ' Dependencies installed\n');
      } catch (error) {
        console.log(
          chalk.yellow(
            '⚠ Failed to auto-install dependencies. Run manually:\n'
          )
        );
        console.log(chalk.dim(`  cd ${userInput.projectSlug}`));
        console.log(chalk.dim('  pnpm install\n'));
      }
    }

    // Success message
    console.log(
      `${chalk.green.bold('┌─────────────────────────────────────────┐')}`
    );
    console.log(
      `${chalk.green.bold('│')}${chalk.bold('  Project Created Successfully!'.padEnd(41))}${chalk.green.bold('│')}`
    );
    console.log(
      `${chalk.green.bold('└─────────────────────────────────────────┘')}\n`
    );

    console.log(chalk.bold('Next steps:\n'));
    console.log(chalk.cyan(`  1. cd ${userInput.projectSlug}`));
    console.log(chalk.cyan('  2. pnpm init:project'));
    console.log(chalk.cyan('  3. pnpm dev\n'));

    console.log(chalk.dim('For more information, see GETTING_STARTED.md\n'));
  } catch (error) {
    console.error(`\n${chalk.red.bold('✗ Error:')}`);
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}

// CLI Setup
const program = new Command();

program
  .name('create-arawn')
  .description('Create a production-ready full-stack TypeScript application')
  .version('0.1.0')
  .argument('[project-name]', 'Name of the project directory')
  .option('--skip-install', 'Skip automatic dependency installation')
  .action((projectName: string | undefined, options: CLIOptions) => {
    const targetPath = projectName || 'my-arawn-app';
    createProject(targetPath, { skip: options.skip }).catch((error) => {
      console.error(chalk.red('Fatal error:'), error);
      process.exit(1);
    });
  });

program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
