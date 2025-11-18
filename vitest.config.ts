import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    // Exclude functions test scripts (these are standalone node scripts run against the emulator)
    exclude: ['functions/**'],
  },
});
