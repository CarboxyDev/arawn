import prompts from 'prompts';

export interface ProjectConfig {
  projectName: string;
  projectSlug: string;
  description: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getUserInput(
  suggestedName?: string
): Promise<ProjectConfig> {
  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name',
      initial: suggestedName || 'my-app',
      validate: (value) => {
        if (!value.trim()) return 'Project name is required';
        return true;
      },
    },
    {
      type: 'text',
      name: 'description',
      message: 'Project description (optional)',
      initial: '',
    },
  ]);

  if (!response.projectName) {
    throw new Error('Project creation cancelled');
  }

  return {
    projectName: response.projectName,
    projectSlug: slugify(response.projectName),
    description:
      response.description || 'A production-ready full-stack application',
  };
}
