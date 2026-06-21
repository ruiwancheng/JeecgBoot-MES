/**
 * 仓库管理 — 后端 REST API 集成测试 (TypeScript)
 *
 * ============================================================
 * 测试目标: 验证仓库/库位 HTTP 接口的完整生命周期
 *
 * 执行流程:
 *   未登录 → 列表(空) → 新增主表 → 查详情 → 编辑主表
 *   → 查子表(空) → 新增子表 → 字典验证 → 编辑子表 → 删除子表
 *   → 边界测试 → 自动清理
 *
 * 前置条件:
 *   export TEST_TOKEN="<从浏览器 F12→Network→X-Access-Token 复制>"
 *   或脚本自动从 /sys/login 获取
 *
 * 运行:
 *   npx tsx test/api/warehouse.test.ts
 *
 * 测试覆盖:
 *   1. 鉴权守卫 — 无 Token 请求应返回 401
 *   2. 主表 CRUD — 列表分页 / 新增 / 编辑 / 删除 / 详情
 *   3. 子表 CRUD — 库位新增 / 编辑 / 删除 / 按主表ID查列表
 *   4. 字典翻译 — assertDictText 验证 _dictText 值正确 (防编码乱码)
 *   5. 边界条件 — 不存在ID / 空参数 / 乱码检测
 *
 * 依赖:
 *   test/utils/test-helper.ts — HTTP 封装 + 断言辅助
 * ============================================================
 */

import { getToken, get, post, put, del, assertSuccess, assertFail } from '../utils/test-helper';

const MAIN_PATH = '/warehouse/warehouse';
const SUB_PATH  = '/warehouse/warehouse';

let TOKEN = '';
let mainId = '';
let subId = '';

// ==================== 入口 ====================

async function main() {
  console.log('\n🧪 仓库管理 API 测试\n');
  console.log('='.repeat(50));

  TOKEN = getToken();
  console.log('  ✅ Token 已加载\n');

  await testUnauthorized();
  await testListAll();
  await testAddMain();
  await testQueryById();
  await testEditMain();
  await testListSubByMainId();
  await testAddSub();
  await testDictResolution();  // 字典翻译专项验证
  await testEditSub();
  await testDeleteSub();
  await testBoundary();

  // 清理测试数据
  if (mainId) {
    await del(`${MAIN_PATH}/delete?id=${mainId}`, TOKEN);
    console.log('  🧹 测试数据已清理');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 全部测试通过\n');
}

// ==================== 测试工具 ====================

/**
 * 验证字典翻译字段值正确（无编码乱码）
 * @param record   查询返回的记录
 * @param field    字典翻译字段名，如 category_dictText
 * @param expected 期望的中文值，如 "存储区"
 */
function assertDictText(record: any, field: string, expected: string) {
  const actual = record[field];
  if (!actual || typeof actual !== 'string') {
    throw new Error(`字典字段 ${field} 缺失或为空: ${JSON.stringify(actual)}`);
  }
  if (actual !== expected) {
    // 检测典型乱码模式：Latin-1 错误解码 UTF-8 中文字符
    const garbled = /[Ã¥Ã¤Ã¼Ã¶Ã±Ã©Ã¨ÃªÃ§Ã¢ÃªÃ®Ã´Ã»Ã]/;
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

/** 测试 3: 新增仓库 */
async function testAddMain() {
  console.log('[3/10] 新增仓库...');
  const res = await post(MAIN_PATH + '/addMain', {
    warehouseCode: 'WH-TEST-001',
    warehouseName: '自动化测试仓库',
    address: '测试地址',
    remark: 'API测试创建',
  }, TOKEN);
  assertSuccess(res, '新增失败');

  const list = await get(MAIN_PATH + '/list?pageNo=1&pageSize=100', TOKEN);
  const created = list.result?.records?.find((r: any) => r.warehouseCode === 'WH-TEST-001');
  if (!created) throw new Error('新增后列表查询不到');
  mainId = created.id;
  console.log(`  ✅ 创建成功 ID=${mainId}\n`);
}

/** 测试 4: 查询详情 */
async function testQueryById() {
  console.log('[4/10] 查询详情...');
  const res = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);
  assertSuccess(res);
  if (res.result.warehouseCode !== 'WH-TEST-001') throw new Error('数据不一致');
  console.log('  ✅\n');
}

/** 测试 5: 编辑仓库 */
async function testEditMain() {
  console.log('[5/10] 编辑仓库...');
  await put(MAIN_PATH + '/editMain', {
    id: mainId, warehouseCode: 'WH-TEST-001',
    warehouseName: '自动化测试仓库-已修改',
  }, TOKEN);

  const verify = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);
  if (verify.result.warehouseName !== '自动化测试仓库-已修改') throw new Error('编辑未生效');
  console.log('  ✅\n');
}

/** 测试 6: 空库位列表 */
async function testListSubByMainId() {
  console.log('[6/10] 库位列表(空)...');
  const res = await get(
    `${SUB_PATH}/listWarehouseLocationByMainId?warehouseId=${mainId}&pageNo=1&pageSize=10`,
    TOKEN
  );
  assertSuccess(res);
  console.log(`  ✅ 当前 ${res.result?.records?.length || 0} 条\n`);
}

/** 测试 7: 新增库位 + 字典翻译验证 */
async function testAddSub() {
  console.log('[7/10] 新增库位...');
  await post(SUB_PATH + '/addWarehouseLocation', {
    warehouseId: mainId,
    locationCode: 'LOC-TEST-A01',
    locationName: '测试库位A区',
    category: '1',           // 存储区
    productName: '测试物料-X',
    capacity: 100,
    capacityUnit: '1',       // 件
  }, TOKEN);

  const list = await get(
    `${SUB_PATH}/listWarehouseLocationByMainId?warehouseId=${mainId}&pageNo=1&pageSize=10`,
    TOKEN
  );
  const loc = list.result?.records?.find((r: any) => r.locationCode === 'LOC-TEST-A01');
  if (!loc) throw new Error('库位创建后查询不到');
  subId = loc.id;

  // ✅ 字典翻译验证 —— 防止编码乱码导致下拉显示异常
  assertDictText(loc, 'category_dictText', '存储区');
  assertDictText(loc, 'capacityUnit_dictText', '件');
  console.log(`  ✅ 库位 ID=${subId}，字典翻译正确\n`);
}

/** 测试 8: 编辑库位 */
async function testEditSub() {
  console.log('[8/10] 编辑库位...');
  await put(SUB_PATH + '/editWarehouseLocation', {
    id: subId, warehouseId: mainId,
    locationCode: 'LOC-TEST-A01',
    locationName: '测试库位A区-已修改',
    category: '1', productName: '测试物料-X',
    capacity: 200, capacityUnit: '1',
  }, TOKEN);
  console.log('  ✅\n');
}

/** 测试 8.5: 字典翻译专项验证 — 防止编码乱码 */
async function testDictResolution() {
  if (!mainId || !subId) { console.log('  ⏭️ 跳过（无数据）\n'); return; }
  console.log('[8.5/11] 字典翻译验证...');

  // 查询库位列表，验证所有字典字段的 dictText 值
  const list = await get(
    `${SUB_PATH}/listWarehouseLocationByMainId?warehouseId=${mainId}&pageNo=1&pageSize=10`,
    TOKEN
  );
  const loc = list.result?.records?.find((r: any) => r.id === subId);
  if (!loc) throw new Error('找不到测试库位');

  // 验证库位分类字典: item_value → item_text 映射
  assertDictText(loc, 'category_dictText', '存储区');   // category=1

  // 验证容量单位字典
  assertDictText(loc, 'capacityUnit_dictText', '件');   // capacityUnit=1

  // 验证无乱码特征字符 (Latin-1 误解释的 UTF-8)
  const allValues = Object.values(loc).join(' ');
  const hasGarbled = /[Ã¥Ã¤Ã¼Ã¶Ã±Ã©Ã¨ÃªÃ§Ã¢Ã®Ã´Ã»ÃÀ-ÿ]{3,}/;
  if (hasGarbled.test(allValues)) {
    throw new Error(
      '❌ 响应数据包含编码乱码！检查 Jackson/Spring 的 UTF-8 编码配置。\n' +
      `  问题数据: ${JSON.stringify(loc, null, 2)}`
    );
  }

  console.log('  ✅ 字典翻译全部正确\n');
}

/** 测试 9: 删除库位 */
async function testDeleteSub() {
  console.log('[9/10] 删除库位...');
  const before = await get(
    `${SUB_PATH}/listWarehouseLocationByMainId?warehouseId=${mainId}&pageNo=1&pageSize=10`,
    TOKEN
  );
  const beforeCount = before.result?.total || 0;

  await del(SUB_PATH + '/deleteWarehouseLocation?id=' + subId, TOKEN);

  const after = await get(
    `${SUB_PATH}/listWarehouseLocationByMainId?warehouseId=${mainId}&pageNo=1&pageSize=10`,
    TOKEN
  );
  if ((after.result?.total || 0) !== beforeCount - 1) throw new Error('删除后数量未减');
  console.log('  ✅\n');
}

/** 测试 10: 边界条件 */
async function testBoundary() {
  console.log('[10/10] 边界条件...');

  // 查询不存在 ID
  const notFound = await get(MAIN_PATH + '/queryById?id=nonexistent999', TOKEN);
  if (notFound.success) throw new Error('查询不存在 ID 应返回错误');

  // 空参数列表不报错
  const empty = await get(MAIN_PATH + '/list?pageNo=1&pageSize=5', TOKEN);
  assertSuccess(empty);

  console.log('  ✅\n');
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
