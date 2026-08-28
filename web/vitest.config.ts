import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: 'tests/cache',
  test: {
    globals: true,
    environment: 'node',
  },
});
