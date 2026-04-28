import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.json',
  output: {
    postProcess: ['eslint', 'prettier'],
    path: './src/lib/api',
  },
  plugins: [
    '@hey-api/schemas',
    '@tanstack/react-query',
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    {
      name: '@hey-api/transformers',
      dates: true,
    },
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
    {
      name: '@hey-api/sdk',
      operations: { strategy: 'byTags' },
      transformer: true,
    },
  ],
});
