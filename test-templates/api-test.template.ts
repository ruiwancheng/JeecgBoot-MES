/**
 * {{EntityName}}管理 — 后端接口测试 (TypeScript)
 *
 * 前置条件: export TEST_TOKEN=你的token（F12→Network→X-Access-Token复制）
 * 运行: npx tsx test/api/{{module-name}}.test.ts
 *
 * 使用方式:
 *   1. 全局替换 {{EntityName}} → 实体名 (如 Warehouse)
 *   2. 全局替换 {{module-name}} → 模块名 (如 warehouse)
 *   3. 全局替换 {{MAIN_PATH}} → API前缀 (如 /warehouse/warehouse)
 *   4. 全局替换 {{SUB_PATH}} → 子表API前缀（无子表则同 MAIN_PATH）
 *   5. 替换 {{testValue_*}} 占位符为实际测试值
 *
 * 测试覆盖：
 *   1. 未登录鉴权（401）
 *   2. 主表 CRUD（分页列表 / 新增 / 编辑 / 删除 / 详情查询）
 *   3. 子表 CRUD（新增 / 编辑 / 删除 / 分页列表）[如有子表]
 *   4. 边界条件（空参数 / 非法ID / 不存在的记录）
 *   5. 批量删除
 */

import { getToken, get, post, put, del, assertSuccess, assertFail } from '../utils/test-helper';

const MAIN_PATH = '{{MAIN_PATH}}';

// ==================== 字典翻译验证工具 ====================

/**
 * 验证字典翻译字段值正确（无编码乱码）
 * @param record   查询返回的记录
 * @param field    字典翻译字段名，如 type_dictText
 * @param expected 期望的中文值，如 "来料加工客户"
 */
function assertDictText(record: any, field: string, expected: string) {
  const actual = record[field];
  if (!actual || typeof actual !== 'string') {
    throw new Error(`字典字段 ${field} 缺失或为空: ${JSON.stringify(actual)}`);
  }
  if (actual !== expected) {
    const garbled = /[Ã¥Ã¤Ã¼Ã¶Ã±Ã©Ã¨ÃªÃ§Ã¢Ã®Ã´Ã»]/;
    if (garbled.test(actual)) {
      throw new Error(
        `❌ 编码错误: ${field}="${actual}" 为乱码！` +
        `期望="${expected}"。根因: UTF-8 被当作 Latin-1/ISO-8859-1 解码。`
      );
    }
    throw new Error(
      `字典翻译不匹配: ${field} 期望="${expected}"，实际="${actual}"`
    );
  }
}
const SUB_PATH  = '{{SUB_PATH}}';

let TOKEN = '';
let mainId = '';
let subId = '';

// ==================== 入口 ====================

async function main() {
  console.log('\n🧪 {{EntityName}}管理 API 测试\n');
  console.log('='.repeat(50));

  TOKEN = getToken();
  console.log('  ✅ Token 已加载\n');

  await testUnauthorized();
  await testListAll();
  await testAddMain();
  await testQueryById();
  await testEditMain();
  await testDictResolution(); // 字典翻译验证 (如有字典字段)
  // 如有子表，取消注释以下:
  // await testListSubByMainId();
  // await testAddSub();
  // await testEditSub();
  // await testDeleteSub();
  await testDeleteBatch();
  await testBoundary();

  // 清理测试数据
  if (mainId) {
    await del(`${MAIN_PATH}/delete?id=${mainId}`, TOKEN);
    console.log('  🧹 测试数据已清理');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 全部测试通过\n');
}

// ==================== 测试用例 ====================

/** 测试 1: 鉴权 — 无 token 返回 401 */
async function testUnauthorized() {
  console.log('[1/10] 未登录鉴权...');
  const res = await get(MAIN_PATH + '/list?pageNo=1&pageSize=5');
  assertFail(res, 401);
  console.log('  ✅ 401\n');
}

/** 测试 2: 分页列表 */
async function testListAll() {
  console.log('[2/10] 分页列表查询...');
  const res = await get(MAIN_PATH + '/list?pageNo=1&pageSize=5', TOKEN);
  assertSuccess(res, '列表查询失败');
  console.log(`  ✅ 共 ${res.result?.total || 0} 条\n`);
}

/** 测试 3: 新增主表 */
async function testAddMain() {
  console.log('[3/10] 新增主表...');
  const res = await post(MAIN_PATH + '/addMain', {
    // TODO: 替换为实际字段
    // code: '{{testValue_code}}',
    // name: '{{testValue_name}}',
  }, TOKEN);
  assertSuccess(res, '新增失败');

  const list = await get(MAIN_PATH + '/list?pageNo=1&pageSize=100', TOKEN);
  // TODO: 替换查找条件
  // const created = list.result?.records?.find((r: any) => r.code === '{{testValue_code}}');
  // if (!created) throw new Error('新增后列表查询不到');
  // mainId = created.id;
  console.log(`  ✅ 创建成功\n`);
}

/** 测试 4: 查询详情 */
async function testQueryById() {
  if (!mainId) { console.log('  ⏭️ 跳过（无已创建的记录）\n'); return; }
  console.log('[4/10] 查询详情...');
  const res = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);
  assertSuccess(res);
  console.log('  ✅\n');
}

/** 测试 5: 编辑主表 */
async function testEditMain() {
  if (!mainId) { console.log('  ⏭️ 跳过（无已创建的记录）\n'); return; }
  console.log('[5/10] 编辑主表...');
  await put(MAIN_PATH + '/editMain', {
    id: mainId,
    // TODO: 保留必填字段 + 修改一个字段
    // code: '{{testValue_code}}',
    // name: '{{testValue_name_modified}}',
  }, TOKEN);

  const verify = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);
  // TODO: 验证修改生效
  // if (verify.result.name !== '{{testValue_name_modified}}') throw new Error('编辑未生效');
  console.log('  ✅\n');
}

/** 测试 6: 批量删除 */
async function testDeleteBatch() {
  console.log('[6/10] 批量删除...');
  // 先创建两条测试数据
  await post(MAIN_PATH + '/addMain', {
    // code: 'BATCH-TEST-001', name: '批量测试1',
  }, TOKEN);
  await post(MAIN_PATH + '/addMain', {
    // code: 'BATCH-TEST-002', name: '批量测试2',
  }, TOKEN);

  const list = await get(MAIN_PATH + '/list?pageNo=1&pageSize=100', TOKEN);
  // TODO: 查找批量测试记录，提取ids
  // const batchRecords = list.result?.records?.filter((r: any) => r.code?.startsWith('BATCH-TEST-'));
  // if (batchRecords && batchRecords.length >= 2) {
  //   const ids = batchRecords.map((r: any) => r.id).join(',');
  //   await del(MAIN_PATH + '/deleteBatch?ids=' + ids, TOKEN);
  // }
  console.log('  ✅\n');
}

/** 测试 X: 字典翻译验证 — 防止编码乱码 */
async function testDictResolution() {
  if (!mainId) { console.log('  ⏭️ 跳过（无数据）\n'); return; }
  console.log('[X/Y] 字典翻译验证...');

  const res = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);
  assertSuccess(res);
  const record = res.result;

  // TODO: 对每个字典字段添加断言
  // assertDictText(record, 'type_dictText', '预期中文值');
  // assertDictText(record, 'status_dictText', '预期中文值');

  console.log('  ✅ 字典翻译全部正确\n');
}

/** 测试 7: 边界条件 */
async function testBoundary() {
  console.log('[7/10] 边界条件...');

  // 查询不存在 ID
  const notFound = await get(MAIN_PATH + '/queryById?id=nonexistent999', TOKEN);
  if (notFound.success) throw new Error('查询不存在 ID 应返回错误');

  // 空参数列表不报错
  const empty = await get(MAIN_PATH + '/list', TOKEN);
  assertSuccess(empty);

  console.log('  ✅\n');
}

// ==================== 子表测试（如有子表则取消注释）====================

// /** 测试: 子表列表 */
// async function testListSubByMainId() {
//   if (!mainId) { console.log('  ⏭️ 跳过（无已创建的主记录）\n'); return; }
//   console.log('[X/10] 子表列表查询...');
//   const res = await get(
//     `${SUB_PATH}/list{{SubEntityName}}ByMainId?{{entityVar}}Id=${mainId}&pageNo=1&pageSize=10`,
//     TOKEN
//   );
//   assertSuccess(res);
//   console.log(`  ✅ 当前 ${res.result?.records?.length || 0} 条\n`);
// }

// /** 测试: 新增子表 */
// async function testAddSub() {
//   if (!mainId) return;
//   console.log('[X/10] 新增子表...');
//   await post(SUB_PATH + '/add{{SubEntityName}}', {
//     {{entityVar}}Id: mainId,
//     // TODO: 替换为实际子表字段
//   }, TOKEN);
//   console.log('  ✅\n');
// }

// /** 测试: 编辑子表 */
// async function testEditSub() {
//   if (!subId) return;
//   console.log('[X/10] 编辑子表...');
//   // TODO: 实现编辑逻辑
//   console.log('  ✅\n');
// }

// /** 测试: 删除子表 */
// async function testDeleteSub() {
//   if (!subId) return;
//   console.log('[X/10] 删除子表...');
//   // TODO: 实现删除 + 数量验证逻辑
//   console.log('  ✅\n');
// }

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
