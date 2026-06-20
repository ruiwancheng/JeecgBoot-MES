#!/usr/bin/env npx tsx
/**
 * UI 测试生成器 — 从 Vue 页面生成测试骨架
 *
 * 用法:
 *   npx tsx test-generator/ui-gen.ts <页面.vue> [--data <data.ts>] [--api <api.ts>]
 *
 * 示例:
 *   npx tsx test-generator/ui-gen.ts src/views/warehouse/WarehouseList.vue \
 *     --data src/views/warehouse/warehouse.data.ts \
 *     --api src/views/warehouse/warehouse.api.ts
 *
 * 输出:
 *   1. {Component}.component.generated.test.ts  — Vitest 组件测试骨架
 *   2. {Page}.e2e.generated.test.ts             — Playwright E2E 测试骨架
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 类型定义
// ============================================================

interface DataSchemaInfo {
  moduleName: string;
  mainColumns: ColumnInfo[];
  searchSchemas: FormFieldInfo[];
  formSchemas: FormFieldInfo[];
  subColumns?: ColumnInfo[];
  subFormSchemas?: FormFieldInfo[];
}

interface ColumnInfo {
  title: string;
  dataIndex: string;
  align: string;
  width: number;
}

interface FormFieldInfo {
  label: string;
  field: string;
  component: string;
  required: boolean;
  componentProps?: string; // 如 dictCode
}

interface VuePageInfo {
  componentName: string;
  menuText: string;
  addButtonText: string;
  editButtonText: string;
  deleteButtonText: string;
  hasSubTable: boolean;
  subTableTitle: string;
  searchFields: string[];
}

// ============================================================
// data.ts 解析
// ============================================================

function parseDataFile(dataPath: string): DataSchemaInfo {
  const content = fs.readFileSync(dataPath, 'utf-8');
  const moduleName = path.basename(path.dirname(dataPath));

  // 提取列定义
  const mainColumns = extractArray(content, 'warehouseColumns', 'columns');
  const searchSchemas = extractFormSchemas(content, 'SearchFormSchema', 'searchFormSchema');
  const formSchemas = extractFormSchemas(content, 'FormSchema', 'formSchema');

  const subColumns = extractArray(content, 'warehouseLocationColumns', 'locationColumns');
  const subFormSchemas = extractFormSchemas(content, 'LocationFormSchema', 'locationFormSchema');

  return {
    moduleName,
    mainColumns,
    searchSchemas: searchSchemas.length > 0 ? searchSchemas : formSchemas.slice(0, 2),
    formSchemas,
    subColumns: subColumns.length > 0 ? subColumns : undefined,
    subFormSchemas: subFormSchemas.length > 0 ? subFormSchemas : undefined,
  };
}

/** 从 TypeScript 文件中提取数组定义 */
function extractArray(content: string, ...varNames: string[]): ColumnInfo[] {
  for (const varName of varNames) {
    const regex = new RegExp(`(?:const|export\\s+const)\\s+${varName}\\s*(?::\\s*\\w+\\[\\]\\s*)?=\\s*\\[([^\\]]*(?:\\[[^\\]]*\\][^\\]]*)*)\\]`, 's');
    const match = content.match(regex);
    if (!match) continue;

    const arrayStr = match[1];
    const columns: ColumnInfo[] = [];

    // 匹配每个对象
    const objRegex = /\{\s*([^}]*(?:\{[^}]*\}[^}]*)*)\s*\}/g;
    let objMatch;
    while ((objMatch = objRegex.exec(arrayStr)) !== null) {
      const obj = objMatch[1];
      const title = extractStr(obj, 'title');
      const dataIndex = extractStr(obj, 'dataIndex');
      const align = extractStr(obj, 'align') || 'center';
      const width = parseInt(extractStr(obj, 'width') || '0') || 120;

      if (title && dataIndex) {
        columns.push({ title, dataIndex, align, width });
      }
    }

    if (columns.length > 0) return columns;
  }
  return [];
}

/** 提取表单 schema */
function extractFormSchemas(content: string, ...typeNames: string[]): FormFieldInfo[] {
  // 查找 formSchema 相关变量
  for (const typeName of typeNames) {
    // 匹配 const xxxFormSchema: FormSchema[] = [...]
    const regex = /(?:const|export\s+const)\s+(\w*[Ff]ormSchema)\s*(?::\s*\w+\[\]\s*)?=\s*\[([\s\S]*?)\];/;
    const match = content.match(regex);
    if (!match) continue;

    // 只在第一次匹配时使用
    const arrayStr = match[2];
    const fields: FormFieldInfo[] = [];

    const objRegex = /\{\s*([^}]*(?:\{[^}]*\}[^}]*)*)\s*\}/g;
    let objMatch;
    while ((objMatch = objRegex.exec(arrayStr)) !== null) {
      const obj = objMatch[1];
      const label = extractStr(obj, 'label');
      const field = extractStr(obj, 'field');
      const component = extractStr(obj, 'component');
      const required = obj.includes('required: true');

      if (field && component) {
        // 提取 componentProps 中的 dictCode
        let componentProps: string | undefined;
        const dictMatch = obj.match(/dictCode\s*:\s*'([^']+)'/);
        if (dictMatch) componentProps = `dictCode=${dictMatch[1]}`;

        const show = obj.match(/show\s*:\s*false/);
        if (show) continue; // 跳过隐藏字段

        fields.push({
          label: label || field,
          field,
          component,
          required,
          componentProps,
        });
      }
    }

    if (fields.length > 0) return fields;
  }
  return [];
}

/** 从 TypeScript 对象中提取字符串值 */
function extractStr(obj: string, key: string): string {
  const regex = new RegExp(`${key}\\s*:\\s*'([^']+)'|${key}\\s*:\\s*"([^"]+)"`);
  const match = obj.match(regex);
  return match?.[1] || match?.[2] || '';
}

// ============================================================
// .vue 页面解析
// ============================================================

function parseVuePage(vuePath: string): VuePageInfo {
  const content = fs.readFileSync(vuePath, 'utf-8');
  const fileName = path.basename(vuePath, '.vue');

  // 提取菜单文本 (从模板中的 text= 或菜单跳转逻辑推断)
  const componentName = fileName.replace('.vue', '');

  // 从文件名推断中文名
  let menuText = '';
  const nameMap: Record<string, string> = {
    WarehouseList: '仓库管理',
    Warehouse: '仓库管理',
  };
  menuText = nameMap[componentName] || componentName;

  // 从模板提取按钮文本
  const addMatch = content.match(/(?:has-text|text)=["']([^"']*新增[^"']*)["']/);
  const addButtonText = addMatch?.[1] || `新增${menuText.replace('管理', '')}`;

  const editMatch = content.match(/(?:has-text|text)=["']([^"']*编辑[^"']*)["']/);
  const editButtonText = editMatch?.[1] || '编辑';

  const deleteMatch = content.match(/(?:has-text|text)=["']([^"']*删除[^"']*)["']/);
  const deleteButtonText = deleteMatch?.[1] || '删除';

  // 检查是否有子表
  const hasSubTable = content.includes('LocationList') || content.includes('子表');

  // 提取子表标题
  const subMatch = content.match(/📦\s*([^<]+)/);
  const subTableTitle = subMatch?.[1]?.trim() || '子表管理';

  // 从搜索栏提取字段
  const searchFields: string[] = [];
  const labelRegex = /label=["']([^"']+)["']/g;
  let labelMatch;
  while ((labelMatch = labelRegex.exec(content)) !== null) {
    if (!searchFields.includes(labelMatch[1])) {
      searchFields.push(labelMatch[1]);
    }
  }

  return {
    componentName,
    menuText,
    addButtonText,
    editButtonText,
    deleteButtonText,
    hasSubTable,
    subTableTitle,
    searchFields: searchFields.slice(0, 3),
  };
}

// ============================================================
// 测试代码生成
// ============================================================

function generateComponentTest(pageInfo: VuePageInfo, dataInfo: DataSchemaInfo): string {
  const { componentName, addButtonText, menuText } = pageInfo;
  const { formSchemas, moduleName } = dataInfo;

  const requiredFields = formSchemas.filter(f => f.required && f.component !== 'JSelectUser');
  const optionalFields = formSchemas.filter(f => !f.required && f.component !== 'JSelectUser');
  const selectFields = formSchemas.filter(f =>
    f.component === 'JSelectUser' || f.component === 'JDictSelectTag');

  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * ${menuText} — 组件单元测试 (自动生成骨架)`);
  lines.push(` *`);
  lines.push(` * 生成时间: ${new Date().toISOString().split('T')[0]}`);
  lines.push(` * 覆盖: 表单渲染 / 校验 / 提交流程 / 编辑回显`);
  lines.push(` *`);
  lines.push(` * 运行: npx vitest run --reporter=verbose`);
  lines.push(` */`);
  lines.push('');
  lines.push(`import { describe, it, expect, vi, beforeEach } from 'vitest';`);
  lines.push(`import { mount, flushPromises } from '@vue/test-utils';`);
  lines.push(`import ${componentName}Modal from '@/views/${moduleName}/components/${componentName}Modal.vue';`);
  lines.push('');
  lines.push(`// Mock API`);
  lines.push(`vi.mock('@/views/${moduleName}/${moduleName}.api', () => ({`);
  lines.push(`  saveOrUpdate: vi.fn().mockResolvedValue({ success: true, code: 200 }),`);
  lines.push('}));');
  lines.push('');
  lines.push(`describe('${componentName}Modal', () => {`);
  lines.push('');
  lines.push(`  // ======== 表单字段渲染 ========`);
  lines.push(`  describe('表单渲染', () => {`);
  lines.push('');
  lines.push(`    it('should render ${formSchemas.length} form fields', async () => {`);
  lines.push(`      const wrapper = mount(${componentName}Modal);`);
  lines.push(`      await flushPromises();`);
  lines.push(`      // TODO: 验证每个字段存在`);
  for (const f of formSchemas) {
    lines.push(`      // expect(wrapper.find('[data-field="${f.field}"]').exists()).toBe(true);  // ${f.label}`);
  }
  lines.push(`    });`);
  lines.push('');

  if (requiredFields.length > 0) {
    lines.push(`    it('should mark ${requiredFields.length} fields as required', async () => {`);
    lines.push(`      const wrapper = mount(${componentName}Modal);`);
    lines.push(`      await flushPromises();`);
    lines.push(`      // TODO: 验证必填标记`);
    lines.push(`      expect(wrapper.findAll('.ant-form-item-required').length).toBeGreaterThan(0);`);
    lines.push(`    });`);
  }
  lines.push(`  });`);

  // 表单校验
  lines.push('');
  lines.push(`  // ======== 表单校验 ========`);
  lines.push(`  describe('表单校验', () => {`);
  lines.push('');
  lines.push(`    it('should show validation errors for empty required fields', async () => {`);
  lines.push(`      const wrapper = mount(${componentName}Modal);`);
  lines.push(`      await flushPromises();`);
  lines.push(`      // 点击确认按钮`);
  lines.push(`      const submitBtn = wrapper.find('.ant-modal .ant-btn-primary');`);
  lines.push(`      if (submitBtn.exists()) await submitBtn.trigger('click');`);
  lines.push(`      await flushPromises();`);
  if (requiredFields.length > 0) {
    lines.push(`      // ${requiredFields.map(f => f.label).join(', ')} 应有校验错误`);
  }
  lines.push(`      // TODO: 验证校验错误提示`);
  lines.push(`    });`);
  lines.push('');

  if (requiredFields.length > 0) {
    const firstField = requiredFields[0];
    lines.push(`    it('should clear validation error when required field is filled', async () => {`);
    lines.push(`      const wrapper = mount(${componentName}Modal);`);
    lines.push(`      await flushPromises();`);
    lines.push(`      // TODO: 填入 "${firstField.label}" (${firstField.field})`);
    lines.push(`      // const input = wrapper.find('input[id="${firstField.field}"]');`);
    lines.push(`      // await input.setValue('测试值');`);
    lines.push(`      // 错误应消失`);
    lines.push(`    });`);
  }
  lines.push(`  });`);

  // 提交
  lines.push('');
  lines.push(`  // ======== 提交流程 ========`);
  lines.push(`  describe('提交流程', () => {`);
  lines.push(`    it('should call save API after successful validation', async () => {`);
  lines.push(`      const wrapper = mount(${componentName}Modal);`);
  lines.push(`      await flushPromises();`);
  lines.push(`      // TODO: 填入所有必填字段 → 点击确认 → 验证 saveOrUpdate 被调用`);
  lines.push(`    });`);
  lines.push(`  });`);

  // 编辑模式
  lines.push('');
  lines.push(`  // ======== 编辑回显 ========`);
  lines.push(`  describe('编辑回显', () => {`);
  lines.push(`    it('should pre-fill form when opened in edit mode', async () => {`);
  lines.push(`      const record = { id: 'test-id'`);
  for (const f of formSchemas.slice(0, 3)) {
    lines.push(`        , ${f.field}: '${f.label}测试值'`);
  }
  lines.push(`      };`);
  lines.push(`      const wrapper = mount(${componentName}Modal, {`);
  lines.push(`        // TODO: 传入 record 和 isUpdate=true`);
  lines.push(`      });`);
  lines.push(`      // TODO: 验证表单回显`);
  lines.push(`    });`);
  lines.push(`  });`);

  // 字典组件
  if (selectFields.length > 0) {
    lines.push('');
    lines.push(`  // ======== 字典/选择器 ========`);
    lines.push(`  describe('字典选择器', () => {`);
    for (const f of selectFields) {
      const dictInfo = f.componentProps || '';
      lines.push(`    it('should render ${f.component} for ${f.label} (${dictInfo})', async () => {`);
      lines.push(`      const wrapper = mount(${componentName}Modal);`);
      lines.push(`      await flushPromises();`);
      lines.push(`      // TODO: 验证 ${f.component} 组件存在`);
      lines.push(`    });`);
    }
    lines.push(`  });`);
  }

  lines.push(`});`);

  return lines.join('\n');
}

function generateE2ETest(pageInfo: VuePageInfo, dataInfo: DataSchemaInfo): string {
  const { menuText, addButtonText, editButtonText, hasSubTable, subTableTitle, searchFields } = pageInfo;
  const { formSchemas, moduleName } = dataInfo;
  const requiredFields = formSchemas.filter(f => f.required);

  const lines: string[] = [];
  lines.push(`import { test, expect } from '@playwright/test';`);
  lines.push('');
  lines.push(`const BASE_URL = 'http://localhost:3100';`);
  lines.push('');
  lines.push(`/**`);
  lines.push(` * ${menuText} — E2E 冒烟测试 (自动生成骨架)`);
  lines.push(` *`);
  lines.push(` * 生成时间: ${new Date().toISOString().split('T')[0]}`);
  lines.push(` * 覆盖: 页面渲染 / 新增流程 / 编辑流程 / 删除确认 / 表单校验`);
  lines.push(` */`);
  lines.push(`test.describe('${menuText}', () => {`);
  lines.push('');
  lines.push(`  test.beforeEach(async ({ page }) => {`);
  lines.push(`    await page.goto(BASE_URL + '/login');`);
  lines.push(`    await page.fill('input[placeholder="账号"]', 'admin');`);
  lines.push(`    await page.fill('input[placeholder="密码"]', '123456');`);
  lines.push(`    await page.click('button:has-text("登 录")');`);
  lines.push(`    await page.waitForURL('**/dashboard/**', { timeout: 15000 });`);
  lines.push(`  });`);
  lines.push('');

  // 1. 页面渲染
  lines.push(`  test('【冒烟1】页面渲染', async ({ page }) => {`);
  lines.push(`    await page.click('text=${menuText}');`);
  lines.push(`    await page.waitForTimeout(1500);`);
  lines.push(`    await expect(page.locator('.ant-table').first()).toBeVisible({ timeout: 10000 });`);
  lines.push(`    await expect(page.locator('button:has-text("${addButtonText}")')).toBeVisible();`);
  if (searchFields.length > 0) {
    for (const sf of searchFields) {
      lines.push(`    await expect(page.locator('label:has-text("${sf}")')).toBeVisible();`);
    }
  }
  if (hasSubTable) {
    lines.push(`    await expect(page.locator('text=${subTableTitle}')).toBeVisible();`);
  }
  lines.push(`  });`);
  lines.push('');

  // 2. 新增
  lines.push(`  test('【冒烟2】新增流程', async ({ page }) => {`);
  lines.push(`    await page.click('text=${menuText}');`);
  lines.push(`    await page.waitForTimeout(1000);`);
  lines.push(`    await page.click('button:has-text("${addButtonText}")');`);
  lines.push(`    await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });`);
  lines.push('');
  lines.push(`    // 填写必填字段`);
  for (const f of requiredFields) {
    lines.push(`    await page.fill('input[id="${f.field}"]', 'E2E-测试-${f.label}');`);
  }
  lines.push('');
  lines.push(`    const submitBtn = page.locator('.ant-modal .ant-btn-primary').first();`);
  lines.push(`    await submitBtn.click();`);
  lines.push(`    await page.waitForTimeout(1500);`);
  lines.push(`    await expect(page.locator('.ant-modal').first()).not.toBeVisible({ timeout: 3000 });`);
  lines.push(`  });`);

  // 3. 编辑
  lines.push('');
  lines.push(`  test('【冒烟3】编辑流程', async ({ page }) => {`);
  lines.push(`    await page.click('text=${menuText}');`);
  lines.push(`    await page.waitForTimeout(2000);`);
  lines.push(`    const editBtn = page.locator('a:has-text("${editButtonText}")').first();`);
  lines.push(`    if (await editBtn.isVisible({ timeout: 3000 })) {`);
  lines.push(`      await editBtn.click();`);
  lines.push(`      await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });`);
  lines.push(`      await page.locator('.ant-modal .ant-btn-primary').first().click();`);
  lines.push(`      await page.waitForTimeout(1000);`);
  lines.push(`    }`);
  lines.push(`  });`);

  // 4. 删除
  lines.push('');
  lines.push(`  test('【冒烟4】删除确认', async ({ page }) => {`);
  lines.push(`    await page.click('text=${menuText}');`);
  lines.push(`    await page.waitForTimeout(2000);`);
  lines.push(`    const delBtn = page.locator('a:has-text("删除")').first();`);
  lines.push(`    if (await delBtn.isVisible({ timeout: 3000 })) {`);
  lines.push(`      await delBtn.click();`);
  lines.push(`      await page.waitForTimeout(500);`);
  lines.push(`      const confirm = page.locator('.ant-popconfirm, .ant-modal-confirm');`);
  lines.push(`      if (await confirm.isVisible({ timeout: 2000 })) {`);
  lines.push(`        await page.click('button:has-text("取 消")');`);
  lines.push(`      }`);
  lines.push(`    }`);
  lines.push(`  });`);

  // 5. 校验
  lines.push('');
  lines.push(`  test('【冒烟5】表单校验', async ({ page }) => {`);
  lines.push(`    await page.click('text=${menuText}');`);
  lines.push(`    await page.waitForTimeout(1000);`);
  lines.push(`    await page.click('button:has-text("${addButtonText}")');`);
  lines.push(`    await expect(page.locator('.ant-modal').first()).toBeVisible({ timeout: 3000 });`);
  lines.push(`    await page.locator('.ant-modal .ant-btn-primary').first().click();`);
  lines.push(`    await page.waitForTimeout(500);`);
  if (requiredFields.length > 0) {
    lines.push(`    // 应有 ${requiredFields.length} 个必填字段的校验错误`);
  }
  lines.push(`    const error = page.locator('.ant-form-item-explain-error').first();`);
  lines.push(`    await expect(error).toBeVisible({ timeout: 2000 });`);
  lines.push(`  });`);

  lines.push(`});`);

  return lines.join('\n');
}

// ============================================================
// 主流程
// ============================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
UI 测试生成器 — 从 Vue 页面生成测试骨架

用法: npx tsx test-generator/ui-gen.ts <页面.vue> [选项]

选项:
  --data <path>  表单/表格定义文件路径 (如 warehouse.data.ts)
  --api <path>   API 定义文件路径 (如 warehouse.api.ts)
  --output <dir> 输出目录 (默认: 页面同级的 __tests__ 目录)
  --dry-run      仅输出而不写入文件

示例:
  npx tsx test-generator/ui-gen.ts src/views/warehouse/WarehouseList.vue \\
    --data src/views/warehouse/warehouse.data.ts \\
    --api src/views/warehouse/warehouse.api.ts
`);
    process.exit(0);
  }

  const vuePath = args[0];
  if (!fs.existsSync(vuePath)) {
    console.error(`❌ 文件不存在: ${vuePath}`);
    process.exit(1);
  }

  const dataFlagIdx = args.indexOf('--data');
  const dataPath = dataFlagIdx >= 0 ? args[dataFlagIdx + 1] : '';

  const dryRun = args.includes('--dry-run');

  console.log(`\n🔍 解析 Vue 页面: ${path.basename(vuePath)}\n`);

  const pageInfo = parseVuePage(vuePath);
  console.log(`  页面: ${pageInfo.menuText}`);
  console.log(`  按钮: ${pageInfo.addButtonText} / ${pageInfo.editButtonText} / ${pageInfo.deleteButtonText}`);
  console.log(`  子表: ${pageInfo.hasSubTable ? pageInfo.subTableTitle : '无'}`);
  console.log(`  搜索: ${pageInfo.searchFields.join(', ') || '无'}`);

  if (dataPath && fs.existsSync(dataPath)) {
    const dataInfo = parseDataFile(dataPath);
    console.log(`\n  表单字段 (${dataInfo.formSchemas.length} 个):`);
    for (const f of dataInfo.formSchemas) {
      const req = f.required ? ' *必填' : '';
      const dict = f.componentProps ? ` [${f.componentProps}]` : '';
      console.log(`    ${f.field} (${f.component}) — ${f.label}${req}${dict}`);
    }

    console.log(`\n  表格列 (${dataInfo.mainColumns.length} 个):`);
    for (const c of dataInfo.mainColumns) {
      console.log(`    ${c.dataIndex} — ${c.title}`);
    }

    if (dataInfo.subFormSchemas && dataInfo.subFormSchemas.length > 0) {
      console.log(`\n  子表字段 (${dataInfo.subFormSchemas.length} 个):`);
      for (const f of dataInfo.subFormSchemas) {
        console.log(`    ${f.field} — ${f.label}`);
      }
    }

    // 生成组件测试
    const compTest = generateComponentTest(pageInfo, dataInfo);
    const outputDir = args.includes('--output')
      ? args[args.indexOf('--output') + 1]
      : path.join(path.dirname(vuePath), '__tests__');

    if (dryRun) {
      console.log(`\n━━━ 组件测试预览 ━━━\n`);
      console.log(compTest);
    } else {
      fs.mkdirSync(outputDir, { recursive: true });
      const outPath = path.join(outputDir, `${pageInfo.componentName}.component.generated.test.ts`);
      fs.writeFileSync(outPath, compTest);
      console.log(`\n📄 已生成组件测试: ${outPath}`);
    }

    // 生成 E2E 测试
    const e2eTest = generateE2ETest(pageInfo, dataInfo);
    if (dryRun) {
      console.log(`\n━━━ E2E 测试预览 ━━━\n`);
      console.log(e2eTest);
    } else {
      const e2eOutputDir = args.includes('--output')
        ? args[args.indexOf('--output') + 1]
        : 'test/e2e';
      fs.mkdirSync(e2eOutputDir, { recursive: true });
      const e2ePath = path.join(e2eOutputDir, `${dataInfo.moduleName}.e2e.generated.test.ts`);
      fs.writeFileSync(e2ePath, e2eTest);
      console.log(`📄 已生成 E2E 测试: ${e2ePath}`);
    }
  } else {
    console.log('\n⚠️  未提供 --data 文件或文件不存在，仅解析页面结构');
    console.log('   请使用 --data 指定表单定义文件以生成完整测试');
  }

  console.log('\n⚠️  注意: 生成的代码包含 TODO 占位符，请验证后运行');
  console.log('');
}

main();
