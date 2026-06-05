import next from 'eslint-config-next';

/**
 * Flat ESLint config (ESLint 9 / Next 16). `eslint-config-next` now ships a
 * flat-config array that bundles next/core-web-vitals and the TypeScript rules.
 */
const config = [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
];

export default config;
