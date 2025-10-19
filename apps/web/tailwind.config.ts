import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/@ghit/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: '#0b0b12',
            foreground: '#f8f8ff',
            primary: {
              DEFAULT: '#7c3aed',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#10b981',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT: '#f59e0b',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT: '#ef4444',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};

export default config;
