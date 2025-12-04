import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      animation: {
        'shine-sweep': 'shine-sweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'shine-sweep': {
          '0%': { transform: 'translateX(0)' },
          '30%': { transform: 'translateX(760px)' },
          '100%': { transform: 'translateX(760px)' },
        },
      },
    },
  },
};

export default config;
