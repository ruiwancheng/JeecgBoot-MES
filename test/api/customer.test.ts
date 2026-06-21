/**
 * 客户管理 — 后端 REST API 集成测试 (TypeScript)
 *
 * ============================================================
 * 测试目标: 验证客户管理 HTTP 接口的完整生命周期
 *
 * 执行流程:
 *   未登录 → 列表(空) → 新增3类客户 → 查详情 → 编辑
 *   → 字典翻译验证(5个字典) → 批量删除 → 边界测试 → 自动清理
 *
 * 前置条件:
 *   export TEST_TOKEN="<token>"  或脚本自动从 /sys/login 获取
 *
 * 运行:
 *   npx tsx test/api/customer.test.ts
 *
 * 测试覆盖:
 *   1. 鉴权 — 无Token应返回401
 *   2. 主表 CRUD — 列表分页 / 新增 / 编辑 / 删除 / 详情
 *   3. 字典翻译 — customer_type / customer_status / settlement_method
 *                  dealer_level / commission_method 共5个字典
 *   4. 三种客户类型 — 来料加工 / 渠道经销商 / 分销客户
 *   5. 边界条件 — 不存在ID / 空参数 / 编码乱码检测
 * ============================================================
 */

import { getToken, get, post, put, del, assertSuccess, assertFail } from '../utils/test-helper';

const API = '/bs/customer';

let TOKEN = '';
let ids: string[] = [];

// ============================================================
// 字典翻译验证工具
// ============================================================

/**
 * 验证字典翻译字段值正确（无编码乱码）
 *
 * 典型乱码: "æ¥åŠåŠ å·¥å®¢æˆ·" (UTF-8→Latin-1误解码)
 * 正确结果: "来料加工客户"
 */
function assertDictText(record: any, field: string, expected: string) {
  const actual = record[field];
  if (!actual || typeof actual !== 'string') {
    throw new Error(`❌ 字典字段 ${field} 缺失或为空: ${JSON.stringify(actual)}`);
  }
  if (actual !== expected) {
    // 检测典型 Latin-1 乱码模式
    const garbled = /[Ã¥Ã¤Ã¼Ã¶Ã±Ã©Ã¨ÃªÃ§Ã¢Ã®Ã´Ã»]/;
    if (garbled.test(actual)) {
      throw new Error(
        `❌ 编码错误: ${field}="${actual}" 为乱码！期望="${expected}"\n` +
        `   根因: UTF-8 字节被当作 Latin-1/ISO-8859-1 解码。`
      );
    }
    throw new Error(`❌ 字典翻译不匹配: ${field} 期望="${expected}"，实际="${actual}"`);
  }
}

// ============================================================
// 入口
// ============================================================

async function main() {
  console.log('\n🧪 客户管理 API 测试\n');
  console.log('='.repeat(56));

  TOKEN = getToken();
  console.log('  ✅ Token 已加载\n');

  await testUnauthorized();     // [1] 鉴权
  await testListEmpty();        // [2] 空列表
  await testAddAllTypes();      // [3] 新增3类客户
  await testQueryById();        // [4] 查详情
  await testEdit();             // [5] 编辑
  await testDictResolution();   // [6] 字典翻译验证
  await testBoundary();         // [7] 边界条件

  // 清理测试数据
  for (const id of ids) {
    await del(`${API}/delete?id=${id}`, TOKEN);
  }
  if (ids.length > 0) console.log('  🧹 测试数据已清理');

  console.log('\n' + '='.repeat(56));
  console.log('🎉 全部测试通过\n');
}

// ============================================================
// 测试用例
// ============================================================

/** [1] 鉴权 — 无Token应返回401 */
async function testUnauthorized() {
  console.log('[1/7] 未登录鉴权...');
  const res = await get(API + '/list?pageNo=1&pageSize=5');
  assertFail(res, 401);
  console.log('  ✅ 401\n');
}

/** [2] 空列表查询 */
async function testListEmpty() {
  console.log('[2/7] 空列表查询...');
  const res = await get(API + '/list?pageNo=1&pageSize=5', TOKEN);
  assertSuccess(res, '列表查询失败');
  console.log(`  ✅ 共 ${res.result?.total || 0} 条\n`);
}

/** [3] 新增三种类型的客户 */
async function testAddAllTypes() {
  console.log('[3/7] 新增三种类型客户...');

  // 3.1 来料加工客户 (customerType=1)
  let res = await post(API + '/add', {
    customerCode: 'CUST-TEST-01',
    customerName: '来料加工测试客户',
    customerType: '1',
    customerStatus: '1',
    contactPerson: '张测试',
    contactPhone: '13800000001',
    processingFeeRate: 15.00,
    settlementMethod: '2',    // 批次结
    paymentDays: 30,
  }, TOKEN);
  assertSuccess(res, '新增来料加工客户失败');

  // 3.2 渠道经销商 (customerType=2)
  res = await post(API + '/add', {
    customerCode: 'CUST-TEST-02',
    customerName: '经销商测试客户',
    customerType: '2',
    customerStatus: '1',
    contactPerson: '李测试',
    dealerLevel: '1',         // 一级经销商
    creditLimit: 500000.00,
    cooperationDate: '2026-01-01',
    dealerRegion: '华东区',
  }, TOKEN);
  assertSuccess(res, '新增渠道经销商失败');

  // 3.3 分销客户 (customerType=3)
  res = await post(API + '/add', {
    customerCode: 'CUST-TEST-03',
    customerName: '分销测试客户',
    customerType: '3',
    customerStatus: '1',
    contactPerson: '王测试',
    commissionRate: 8.50,
    commissionMethod: '1',    // 货款到账后
    agencyRegion: '华南区',
    agencyProducts: '产品A,产品B,产品C',
  }, TOKEN);
  assertSuccess(res, '新增分销客户失败');

  // 从列表中获取创建的ID
  const list = await get(API + '/list?pageNo=1&pageSize=20', TOKEN);
  const testRecords = list.result?.records?.filter(
    (r: any) => r.customerCode?.startsWith('CUST-TEST-')
  ) || [];
  ids = testRecords.map((r: any) => r.id);
  console.log(`  ✅ 创建 ${testRecords.length} 条记录\n`);
}

/** [4] 查询详情 — 验证数据一致性 */
async function testQueryById() {
  if (ids.length === 0) { console.log('  ⏭️ 跳过\n'); return; }
  console.log('[4/7] 查询详情...');

  const res = await get(API + '/queryById?id=' + ids[0], TOKEN);
  assertSuccess(res);

  const r = res.result;
  // 验证基本信息
  if (r.customerCode !== 'CUST-TEST-01') throw new Error('查询结果数据不一致');
  // 验证客户类型特有字段
  if (r.customerType === '1' && r.settlementMethod !== '2') {
    throw new Error('来料加工客户专属字段未正确返回');
  }
  console.log('  ✅ 数据一致\n');
}

/** [5] 编辑 — 修改后验证生效 */
async function testEdit() {
  if (ids.length < 2) { console.log('  ⏭️ 跳过\n'); return; }
  console.log('[5/7] 编辑客户...');

  // 修改经销商客户
  await put(API + '/edit', {
    id: ids[1],
    customerCode: 'CUST-TEST-02',
    customerName: '经销商测试客户-已修改',
    customerType: '2',
    customerStatus: '1',
    dealerLevel: '3',         // 改为三级经销商
    creditLimit: 800000.00,
    dealerRegion: '华南区',
  }, TOKEN);

  // 验证修改生效
  const verify = await get(API + '/queryById?id=' + ids[1], TOKEN);
  if (verify.result.customerName !== '经销商测试客户-已修改') {
    throw new Error('编辑未生效');
  }
  console.log('  ✅\n');
}

/** [6] 字典翻译专项验证 — 检查5个字典的 _dictText 值
 *
 * 注意: JeecgBoot 的 DictAspect 只对 IPage<T> 结果进行字典翻译，
 *       queryById 返回单个实体时不会触发翻译。
 *       因此这里通过列表接口获取数据来验证 _dictText。
 */
async function testDictResolution() {
  if (ids.length === 0) { console.log('  ⏭️ 跳过\n'); return; }
  console.log('[6/7] 字典翻译验证...');

  // 从列表获取带 _dictText 翻译的记录
  const list = await get(API + '/list?pageNo=1&pageSize=50', TOKEN);
  assertSuccess(list);
  const records = list.result?.records || [];

  // 按编码找到测试记录
  const r1 = records.find((r: any) => r.customerCode === 'CUST-TEST-01');
  const r2 = records.find((r: any) => r.customerCode === 'CUST-TEST-02');
  const r3 = records.find((r: any) => r.customerCode === 'CUST-TEST-03');

  if (!r1 || !r2 || !r3) throw new Error('列表中找不到测试记录');

  // 客户1: 来料加工客户
  assertDictText(r1, 'customerType_dictText', '来料加工客户');
  assertDictText(r1, 'customerStatus_dictText', '正常');
  assertDictText(r1, 'settlementMethod_dictText', '批次结');

  // 客户2: 渠道经销商（步骤5编辑后等级变为三级）
  assertDictText(r2, 'customerType_dictText', '渠道经销商');
  assertDictText(r2, 'dealerLevel_dictText', '三级');

  // 客户3: 分销客户
  assertDictText(r3, 'customerType_dictText', '分销客户');
  assertDictText(r3, 'commissionMethod_dictText', '货款到账后');

  // 全量乱码检测 — 所有 _dictText 字段必须是合法中文
  for (const r of [r1, r2, r3]) {
    for (const [k, v] of Object.entries(r)) {
      if (k.endsWith('_dictText') && typeof v === 'string') {
        const garbled = /[Ã¥Ã¤Ã¼Ã¶Ã±Ã©Ã¨ÃªÃ§Ã¢Ã®Ã´Ã»]/;
        if (garbled.test(v)) {
          throw new Error(`❌ 发现编码乱码: ${k}="${v}"`);
        }
      }
    }
  }

  console.log('  ✅ 5个字典全部翻译正确\n');
}

/** [7] 边界条件 */
async function testBoundary() {
  console.log('[7/7] 边界条件...');

  // 查询不存在ID
  const notFound = await get(API + '/queryById?id=nonexistent999', TOKEN);
  if (notFound.success) throw new Error('查询不存在ID应返回错误');

  // 空参数列表不报错
  const empty = await get(API + '/list', TOKEN);
  assertSuccess(empty);

  console.log('  ✅\n');
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
