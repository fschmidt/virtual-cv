import { defineConfig } from 'orval';

export default defineConfig({
  virtualCv: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',
    },
    output: {
      target: 'src/api/generated.ts',
      client: 'fetch',
      mode: 'single',
      override: {
        mutator: {
          path: 'src/api/fetcher.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
