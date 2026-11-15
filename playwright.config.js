import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 60000, workers: 2,
  use: { baseURL: 'http://127.0.0.1:4220', headless: true },
  webServer: { command: 'python3 -m http.server 4220 --directory site', url: 'http://127.0.0.1:4220', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
