import { Command } from 'commander';

import { create } from './commands/create.js';

const program = new Command();

program
  .name('create-blitzpack')
  .description('Create a new Blitzpack project')
  .version('0.1.0')
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
