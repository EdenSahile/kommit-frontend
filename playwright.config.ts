import { defineConfig, devices } from '@playwright/test'

// HEADED=1 pnpm test:e2e:headed -> fenêtre visible, ralenti, séquentiel (pour REGARDER
// le parcours). Par défaut (pnpm test:e2e) : headless, plein régime, en parallèle.
const headed = process.env.HEADED === '1'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: !headed,
  workers: headed ? 1 : undefined,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    headless: !headed,
    trace: 'on-first-retry',
    launchOptions: {
      slowMo: headed ? Number(process.env.SLOWMO ?? 800) : 0,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
