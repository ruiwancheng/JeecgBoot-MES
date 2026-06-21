/**
 * 仓库管理 — WarehouseModal 组件单元测试 (Vitest)
 *
 * ============================================================
 * 测试目标: 验证仓库表单的数据结构定义和 API 端点
 *
 * 测试范围:
 *   1. 表单 Schema — 字段定义、必填校验、控件类型、隐藏字段
 *   2. 搜索表单 — 查询条件字段配置
 *   3. 表格列 — 列表展示列定义
 *   4. API 端点 — CRUD 接口函数定义
 *
 * 运行:
 *   npx vitest run --config jeecgboot-vue3/vitest.config.ts
 *
 * 注意:
 *   当前版本验证 data.ts 和 api.ts 的数据结构正确性
 *   未 mount Vue 组件 (BasicForm/Modal 依赖 Jeecg 框架上下文)
 *   后续可扩展为真正的 SFC mount 测试
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';

// ============================================================
// Mock 全局依赖
// ============================================================

// 模拟 HTTP 客户端 — 所有 API 调用不发送真实请求
vi.mock('/@/utils/http/axios', () => ({
    defHttp: {
        get: vi.fn().mockResolvedValue({ success: true, code: 200, result: { records: [], total: 0 } }),
        post: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        put: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        delete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    },
}));

// 部分 Mock 仓库 API — 保留原始导出，仅覆盖 saveOrUpdate 避免真实 HTTP 调用
vi.mock('/@/views/warehouse/warehouse.api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('/@/views/warehouse/warehouse.api')>();
    return {
        ...actual,
        saveOrUpdate: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    };
});

// ============================================================
// 测试套件: WarehouseModal 组件
// ============================================================

describe('WarehouseModal 组件', () => {

    // ----------------------------------------------------------
    // 1. 表单 Schema 配置 — 字段定义与校验规则
    // ----------------------------------------------------------
    describe('表单 Schema 配置', () => {

        it('应该包含必填字段 warehouseCode 和 warehouseName，控件为 Input', async () => {
            const { warehouseFormSchema } = await import('/@/views/warehouse/warehouse.data');
            // 过滤隐藏字段，只检查可见字段
            const visibleFields = warehouseFormSchema.filter((f: any) => f.show !== false);

            const codeField = visibleFields.find((f: any) => f.field === 'warehouseCode');
            const nameField = visibleFields.find((f: any) => f.field === 'warehouseName');

            // 仓库编码: 必填 + Input 组件
            expect(codeField).toBeDefined();
            expect(codeField!.required).toBe(true);
            expect(codeField!.component).toBe('Input');

            // 仓库名称: 必填 + Input 组件
            expect(nameField).toBeDefined();
            expect(nameField!.required).toBe(true);
            expect(nameField!.component).toBe('Input');
        });

        it('应该包含可选字段 address、manager(用户选择器)、remark', async () => {
            const { warehouseFormSchema } = await import('/@/views/warehouse/warehouse.data');
            const visibleFields = warehouseFormSchema.filter((f: any) => f.show !== false);
            const fieldNames = visibleFields.map((f: any) => f.field);

            // 验证字段存在
            expect(fieldNames).toContain('address');
            expect(fieldNames).toContain('manager');
            expect(fieldNames).toContain('remark');

            // 负责人使用用户选择器控件（不是普通 Input）
            const managerField = visibleFields.find((f: any) => f.field === 'manager');
            expect(managerField!.component).toBe('JSelectUser');
        });

        it('id 字段应该设置为隐藏（show: false）', async () => {
            const { warehouseFormSchema } = await import('/@/views/warehouse/warehouse.data');
            const idField = warehouseFormSchema.find((f: any) => f.field === 'id');
            expect(idField).toBeDefined();
            expect(idField!.show).toBe(false);
        });
    });

    // ----------------------------------------------------------
    // 2. 搜索表单 Schema — 查询条件配置
    // ----------------------------------------------------------
    describe('搜索表单 Schema 配置', () => {

        it('应该支持按 warehouseCode 和 warehouseName 搜索', async () => {
            const { warehouseSearchFormSchema } = await import('/@/views/warehouse/warehouse.data');
            const fieldNames = warehouseSearchFormSchema.map((f: any) => f.field);

            expect(fieldNames).toContain('warehouseCode');
            expect(fieldNames).toContain('warehouseName');

            // 搜索条件使用 Input 组件
            const codeSearch = warehouseSearchFormSchema.find((f: any) => f.field === 'warehouseCode');
            expect(codeSearch!.component).toBe('Input');
        });
    });

    // ----------------------------------------------------------
    // 3. 表格列配置 — 列表展示
    // ----------------------------------------------------------
    describe('表格列配置', () => {

        it('应该定义全部 5 个仓库表格列', async () => {
            const { warehouseColumns } = await import('/@/views/warehouse/warehouse.data');
            expect(warehouseColumns.length).toBeGreaterThanOrEqual(5);

            const columnKeys = warehouseColumns.map((c: any) => c.dataIndex);
            // 基本信息列
            expect(columnKeys).toContain('warehouseCode');
            expect(columnKeys).toContain('warehouseName');
            expect(columnKeys).toContain('address');
            // 系统列
            expect(columnKeys).toContain('createTime');
        });
    });

    // ----------------------------------------------------------
    // 4. API 端点 — 后端接口函数定义
    // ----------------------------------------------------------
    describe('API 端点定义', () => {

        it('所有 CRUD 接口函数应该已导出', async () => {
            const api = await import('/@/views/warehouse/warehouse.api');

            // 验证每个接口函数存在
            expect(api.warehouseList).toBeDefined();       // 列表查询
            expect(api.saveOrUpdate).toBeDefined();        // 新增/编辑
            expect(api.warehouseDelete).toBeDefined();     // 单个删除
            expect(api.warehouseDeleteBatch).toBeDefined(); // 批量删除
        });

        it('接口函数应该都是 Function 类型', async () => {
            const api = await import('/@/views/warehouse/warehouse.api');

            // 确认导出的是可调用的函数（不是字符串或其他类型）
            expect(typeof api.warehouseList).toBe('function');
            expect(typeof api.saveOrUpdate).toBe('function');
            expect(typeof api.warehouseDelete).toBe('function');
            expect(typeof api.warehouseDeleteBatch).toBe('function');
        });
    });
});
