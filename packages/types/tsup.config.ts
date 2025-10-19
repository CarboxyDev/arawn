import { join } from 'path';
import { defineConfig } from 'tsup';

import { generateEntries } from '../../config/generate-exports';
import { createSharedPackageConfig } from '../../config/tsup.shared';

export default defineConfig(
  createSharedPackageConfig({
    entry: generateEntries(join(__dirname, 'src')),
  })
);
