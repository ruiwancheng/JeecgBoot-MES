import { defineConfig } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 *
 * 运行: npx playwright test test/e2e/
 * 指定文件: npx playwright test test/e2e/warehouse.test.ts
 *
 * 前置: 后端 (8080) + 前端 (3100) 均运行中，验证码已关闭
 */
export default defineConfig({
  testDir: './test/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3100',
    headless: true,
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    // 登录凭证
    storageState: undefined,
  },
  // 仅关键冒烟测试，降低并发
  workers: 1,
  retries: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test/e2e/report.json' }],
  ],
});
