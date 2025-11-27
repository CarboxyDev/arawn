import fs from 'fs-extra';
import { join } from 'path';

const { readFile, readJSON, writeFile } = fs;

export interface Variables {
  PROJECT_NAME: string;
  PROJECT_SLUG: string;
  PROJECT_DESCRIPTION: string;
}

export function createVariables(config: {
  projectName: string;
  projectSlug: string;
  description: string;
}): Variables {
  return {
    PROJECT_NAME: config.projectName,
    PROJECT_SLUG: config.projectSlug,
    PROJECT_DESCRIPTION: config.description,
  };
}

export function replaceVariables(
  content: string,
  variables: Variables
): string {
  let result = content;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

export async function replaceVariablesInFile(
  filePath: string,
  variables: Variables
): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const replaced = replaceVariables(content, variables);
    await writeFile(filePath, replaced, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function replaceVariablesInProject(
  projectDir: string,
  variables: Variables,
  replaceableFiles: string[]
): Promise<void> {
  const promises = replaceableFiles.map((file) =>
    replaceVariablesInFile(join(projectDir, file), variables)
  );

  await Promise.all(promises);
}
