import { join } from 'path';
import { defineConfig } from 'tsup';

import { generateEntries } from '../../turbo/generate-exports';
import { createSharedPackageConfig } from '../../turbo/shared-package.config';

export default defineConfig(
  createSharedPackageConfig({
    entry: generateEntries(join(__dirname, 'src')),
  })
);
