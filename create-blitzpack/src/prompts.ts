import prompts from 'prompts';

import { DEFAULT_DESCRIPTION } from './constants.js';
import { getCurrentDirName, toSlug, validateProjectName } from './utils.js';

export interface ProjectOptions {
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  skipGit: boolean;
  skipInstall: boolean;
  useCurrentDir: boolean;
}

export async function getProjectOptions(
  providedName?: string,
  flags: { skipGit?: boolean; skipInstall?: boolean } = {}
): Promise<ProjectOptions | null> {
  const questions: prompts.PromptObject[] = [];

  if (!providedName) {
    questions.push({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-app',
      validate: (value: string) => {
        const result = validateProjectName(value);
        if (!result.valid) {
          return result.problems?.[0] || 'Invalid project name';
        }
        return true;
      },
    });
  }

  questions.push({
    type: 'text',
    name: 'projectDescription',
    message: 'Project description:',
    initial: DEFAULT_DESCRIPTION,
  });

  let cancelled = false;
  const response = await prompts(questions, {
    onCancel: () => {
      cancelled = true;
    },
  });

  if (cancelled) {
    return null;
  }

  const projectName = providedName || response.projectName;
  const validation = validateProjectName(projectName);

  if (!validation.valid) {
    console.log(`Invalid project name: ${validation.problems?.[0]}`);
    return null;
  }

  const useCurrentDir = projectName === '.';
  const actualProjectName = useCurrentDir ? getCurrentDirName() : projectName;

  return {
    projectName: actualProjectName,
    projectSlug: toSlug(actualProjectName),
    projectDescription: response.projectDescription || DEFAULT_DESCRIPTION,
    skipGit: flags.skipGit || false,
    skipInstall: flags.skipInstall || false,
    useCurrentDir,
  };
}
