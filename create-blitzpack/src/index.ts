import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { create } from './commands/create.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('create-blitzpack')
  .description('Create a new Blitzpack project')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip dependency installation')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(
    async (
      projectName: string | undefined,
      options: { skipGit?: boolean; skipInstall?: boolean; dryRun?: boolean }
    ) => {
      await create(projectName, options);
    }
  );

program.parse();
