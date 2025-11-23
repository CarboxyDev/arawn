import type { Config } from 'tailwindcss';

import baseConfig from '../../packages/tailwind-config/tailwind.config.js';

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
