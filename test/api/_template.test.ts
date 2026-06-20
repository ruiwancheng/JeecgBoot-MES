/**
 * [模块名] — 后端接口测试
 *
 * 使用方式：
 *   1. 复制此文件到 test/api/ 目录
 *   2. 修改 TEST_CONFIG 中的路径和测试数据
 *   3. 运行: npx tsx test/api/[模块名].test.ts
 *
 * 测试覆盖：鉴权 / 分页 / 增删改查 / 边界
 */

import { login, get, post, put, del, assertSuccess, assertFail, cleanupAll } from '../utils/test-helper';

// ==================== 配置区（按需修改） ====================

const CONFIG = {
  modulePath: '/模块名/小写路径',     // 例: /warehouse/warehouse
  addBody: {                         // 新增请求体
    code: 'TEST-001',
    name: '测试数据',
  },
  editBody: {                        // 编辑请求体
    name: '测试数据-已修改',
  },
};

// ==================== 测试入口 ====================

async function main() {
  console.log(`\n🧪 ${CONFIG.modulePath} API 测试\n`);
  let token = await login();

  let createdId = '';

  try {
    // 1. 鉴权
    const unauth = await get(CONFIG.modulePath + '/list?pageNo=1&pageSize=5');
    assertFail(unauth, 401);
    console.log('  ✅ 鉴权通过');

    // 2. 列表查询
    const list = await get(CONFIG.modulePath + '/list?pageNo=1&pageSize=5', token);
    assertSuccess(list);
    console.log(`  ✅ 列表查询: ${list.result?.total || 0} 条`);

    // 3. 新增
    const add = await post(CONFIG.modulePath + '/add', CONFIG.addBody, token);
    assertSuccess(add);

    // 反查获取 ID
    const verify = await get(CONFIG.modulePath + '/list?pageNo=1&pageSize=100', token);
    const created = verify.result?.records?.find((r: any) => r.code === CONFIG.addBody.code);
    if (created) createdId = created.id;
    console.log(`  ✅ 新增成功: ${createdId}`);

    // 4. 编辑
    if (createdId) {
      const edit = await put(CONFIG.modulePath + '/edit', { id: createdId, ...CONFIG.addBody, ...CONFIG.editBody }, token);
      assertSuccess(edit);
      console.log('  ✅ 编辑成功');
    }

    // 5. 删除
    if (createdId) {
      const delRes = await del(CONFIG.modulePath + '/delete?id=' + createdId, token);
      assertSuccess(delRes);
      console.log('  ✅ 删除成功');
    }

    console.log('\n🎉 测试全部通过\n');
  } catch (err: any) {
    console.error('\n❌ 测试失败:', err.message);
    process.exit(1);
  } finally {
    await cleanupAll(token);
  }
}

main();
