import fs from 'fs-extra';
import path from 'path';

import { REPLACEABLE_FILES, type TemplateVariables } from './constants.js';

function transformPackageJson(
  content: string,
  vars: TemplateVariables,
  filePath: string
): string {
  const pkg = JSON.parse(content);

  if (filePath === 'package.json') {
    pkg.name = vars.projectSlug;
    pkg.description = vars.projectDescription;
    delete pkg.repository;
    delete pkg.homepage;
    delete pkg.scripts?.['init:project'];
    pkg.version = '0.1.0';
  }

  return JSON.stringify(pkg, null, 2) + '\n';
}

function transformSiteConfig(content: string, vars: TemplateVariables): string {
  return content
    .replace(/name: ['"].*['"]/, `name: '${vars.projectName}'`)
    .replace(
      /description: ['"].*['"]/,
      `description: '${vars.projectDescription}'`
    )
    .replace(/github: ['"].*['"]/, `github: ''`);
}

function transformLayout(content: string, vars: TemplateVariables): string {
  return content
    .replace(/title: ['"].*['"]/, `title: '${vars.projectName}'`)
    .replace(
      /description: ['"].*['"]/,
      `description: '${vars.projectDescription}'`
    );
}

function transformSwagger(content: string, vars: TemplateVariables): string {
  return content
    .replace(/title: ['"].*['"]/, `title: '${vars.projectName} API'`)
    .replace(
      /description: ['"]Production-ready TypeScript API built with Fastify['"]/,
      `description: '${vars.projectDescription}'`
    );
}

function generateReadme(vars: TemplateVariables): string {
  return `# ${vars.projectName}

${vars.projectDescription}

## Quick Start

\`\`\`bash
pnpm install
pnpm init:project
pnpm dev
\`\`\`

## What's Running

- **Web:** http://localhost:3000
- **API:** http://localhost:8080
- **API Docs:** http://localhost:8080/docs

## Project Structure

\`\`\`
${vars.projectSlug}/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend
└── packages/
    ├── types/        # Shared Zod schemas
    ├── utils/        # Shared utilities
    └── ui/           # Shared UI components
\`\`\`

## Database

\`\`\`bash
pnpm db:studio        # Open Prisma Studio
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
\`\`\`

---

Built with [Blitzpack](https://github.com/CarboxyDev/blitzpack)
`;
}

export async function transformFiles(
  targetDir: string,
  vars: TemplateVariables
): Promise<void> {
  for (const relativePath of REPLACEABLE_FILES) {
    const filePath = path.join(targetDir, relativePath);

    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    let transformed: string;

    if (relativePath === 'README.md') {
      transformed = generateReadme(vars);
    } else if (relativePath.endsWith('package.json')) {
      transformed = transformPackageJson(content, vars, relativePath);
    } else if (relativePath.includes('site.ts')) {
      transformed = transformSiteConfig(content, vars);
    } else if (relativePath.includes('layout.tsx')) {
      transformed = transformLayout(content, vars);
    } else if (relativePath.includes('swagger.ts')) {
      transformed = transformSwagger(content, vars);
    } else {
      transformed = content;
    }

    await fs.writeFile(filePath, transformed, 'utf-8');
  }
}
