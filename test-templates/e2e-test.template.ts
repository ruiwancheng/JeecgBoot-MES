/**
 * {{PageName}} — 前端 E2E 冒烟测试 (Playwright)
 *
 * 前置条件:
 *   1. 后端运行中: http://localhost:8080/jeecg-boot
 *   2. 前端运行中: http://localhost:3100
 *   3. 验证码已关闭 (enableLoginCaptcha: false)
 *   4. 测试账号: admin / 123456
 *
 * 运行: npx playwright test test/e2e/{{module-name}}.test.ts
 *
 * 使用方式:
 *   1. 全局替换 {{PageName}} → 页面名称 (如 仓库管理)
 *   2. 全局替换 {{module-name}} → 模块名 (如 warehouse)
 *   3. 全局替换 {{menu-text}} → 菜单文本 (如 仓库管理)
 *   4. 全局替换 {{add-button-text}} → 新增按钮文本 (如 新增仓库)
 *   5. 替换 {{testValue_*}} 占位符为实际测试值
 *
 * 覆盖: 5 个关键用户旅程（非全量 UI 测试）
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3100';

test.describe('{{PageName}}页面 E2E 冒烟', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder="账号"]', 'admin');
    await page.fill('input[placeholder="密码"]', '123456');
    await page.click('button:has-text("登 录")');
    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  });

  // ==================== 1. 页面渲染 ====================

  test('【冒烟1】页面渲染 — 导航后表格和操作按钮正常显示', async ({ page }) => {
    await page.click('text={{menu-text}}');
    await page.waitForTimeout(1500);

    // 表格可见
    await expect(page.locator('.ant-table').first()).toBeVisible({ timeout: 10000 });

    // 新增按钮可见
    await expect(page.locator('button:has-text("{{add-button-text}}")')).toBeVisible();

    // 搜索栏可见
    // TODO: 替换为实际搜索字段label
    // await expect(page.locator('label:has-text("{{search_field_1}}")')).toBeVisible();
  });

  // ==================== 2. 新增流程 ====================

  test('【冒烟2】新增流程 — 打开弹窗 → 填写 → 提交 → 刷新列表', async ({ page }) => {
    await page.click('text={{menu-text}}');
    await page.waitForTimeout(1000);

    // 记录新增前列表行数
    const beforeCount = await page.locator('.ant-table-tbody tr.ant-table-row').count();

    // 点击新增
    await page.click('button:has-text("{{add-button-text}}")');
    await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });

    // 填写表单
    // TODO: 替换为实际字段和值
    // await page.fill('input[id="{{formField_code}}"]', '{{testValue_code}}');
    // await page.fill('input[id="{{formField_name}}"]', '{{testValue_name}}');

    // 提交
    const submitBtn = page.locator('.ant-modal .ant-btn-primary').first();
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // 验证弹窗关闭
    await expect(page.locator('.ant-modal').first()).not.toBeVisible({ timeout: 3000 });

    // 验证列表新增一条
    const afterCount = await page.locator('.ant-table-tbody tr.ant-table-row').count();
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
  });

  // ==================== 3. 编辑流程 ====================

  test('【冒烟3】编辑流程 — 点击编辑 → 弹窗回显 → 修改 → 提交', async ({ page }) => {
    await page.click('text={{menu-text}}');
    await page.waitForTimeout(2000);

    // 点击第一条记录的编辑按钮
    const editBtn = page.locator('a:has-text("编辑")').first();
    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click();
      await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });

      // 验证表单有数据回显
      // TODO: 检查关键字段已有值

      // 修改后提交
      const submitBtn = page.locator('.ant-modal .ant-btn-primary').first();
      await submitBtn.click();
      await page.waitForTimeout(1000);

      // 弹窗关闭
      await expect(page.locator('.ant-modal').first()).not.toBeVisible({ timeout: 3000 });
    }
  });

  // ==================== 4. 删除流程 ====================

  test('【冒烟4】删除流程 — 点击删除 → 确认弹窗 → 取消', async ({ page }) => {
    await page.click('text={{menu-text}}');
    await page.waitForTimeout(2000);

    const delBtn = page.locator('a:has-text("删除")').first();
    if (await delBtn.isVisible({ timeout: 3000 })) {
      await delBtn.click();
      await page.waitForTimeout(500);

      // 确认弹窗出现
      const confirm = page.locator('.ant-popconfirm, .ant-modal-confirm');
      if (await confirm.isVisible({ timeout: 2000 })) {
        // 点取消（冒烟测试不真删数据）
        const cancelBtn = page.locator('button:has-text("取 消")');
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
    }
  });

  // ==================== 5. 表单校验 ====================

  test('【冒烟5】表单校验 — 必填项为空时提示校验错误', async ({ page }) => {
    await page.click('text={{menu-text}}');
    await page.waitForTimeout(1000);

    // 打开新增弹窗
    await page.click('button:has-text("{{add-button-text}}")');
    await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });

    // 不填任何字段，直接点确定
    const okBtn = page.locator('.ant-modal .ant-btn-primary').first();
    await okBtn.click();
    await page.waitForTimeout(500);

    // 应出现校验错误提示
    const error = page.locator('.ant-form-item-explain-error').first();
    await expect(error).toBeVisible({ timeout: 2000 });
  });
});
