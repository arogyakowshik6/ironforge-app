import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // server/ is a separate npm workspace with its own vitest.config.ts —
    // don't sweep its tests (including the DB integration suite, which
    // needs a generated Prisma client) into the frontend test run.
    exclude: ['**/node_modules/**', 'server/**'],
  },
})
