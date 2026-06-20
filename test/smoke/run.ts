/**
 * 前端冒烟测试 — SPA 适配版
 *
 * 用 Playwright 轻量模式：只登录 + 访问页面 + 检查控制台 + 检查元素
 * 每页 ~5 秒，不测交互，只测"页面能不能正常渲染"
 *
 * 运行: npx tsx test/smoke/run.ts
 */

import { chromium } from 'playwright-core';
// 注：playwright-core 比 @playwright/test 轻量，只需 chromium 浏览器

const BASE = 'http://localhost:3100';
const USER = 'admin';
const PASS='***';

const PAGES = [
  { name: '仓库管理', path: '/warehouse/warehouseList', expectText: '新增仓库' },
];

async function smokeOne(browser: any, pageDef: any) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e: Error) => errors.push(e.message));

  try {
    // 登录
    await page.goto(BASE + '/login', { timeout: 10000 });
    await page.fill('input[placeholder="账号"]', USER);
    await page.fill('input[placeholder="密码"]', PASS);
    await page.click('button:has-text("登 录")');
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });

    // 访问页面
    await page.goto(BASE + pageDef.path, { timeout: 10000 });
    await page.waitForTimeout(3000);

    // 检查元素
    const hasTable = await page.$('.ant-table');
    const hasKeyword = await page.$(`text="${pageDef.expectText}"`);

    return {
      name: pageDef.name,
      table: !!hasTable,
      keyword: !!hasKeyword,
      jsErrors: errors,
      passed: !errors.length && !!hasTable && !!hasKeyword,
    };
  } catch (e: any) {
    return { name: pageDef.name, error: e.message, passed: false };
  } finally {
    await ctx.close();
  }
}

async function main() {
  console.log('🔥 前端冒烟测试\n');
  const browser = await chromium.launch({ headless: true });

  let pass = 0, fail = 0;
  for (const p of PAGES) {
    const r = await smokeOne(browser, p);
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
    if (r.table !== undefined) console.log(`   表格: ${r.table ? '✅' : '❌'}`);
    if (r.keyword !== undefined) console.log(`   关键词: ${r.keyword ? '✅' : '❌'}`);
    if (r.jsErrors?.length) console.log(`   JS 错误: ${r.jsErrors.length} 个`);
    if (r.error) console.log(`   异常: ${r.error}`);
    r.passed ? pass++ : fail++;
  }

  await browser.close();
  console.log(`\n通过 ${pass}/${pass + fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
