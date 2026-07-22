import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests need a live Postgres + generated Prisma client;
    // excluded from the default `npm test` run. See test/integration.test.ts.
    exclude: ['**/node_modules/**', '**/test/integration.test.ts'],
  },
})
