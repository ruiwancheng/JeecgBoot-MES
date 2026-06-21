/**
 * 仓库管理 — WarehouseLocation 组件单元测试 (Vitest)
 *
 * ============================================================
 * 测试目标: 验证库位子表的数据结构定义和 API 端点
 *
 * 测试范围:
 *   1. 子表表单 Schema — 必填字段、字典控件(JDictSelectTag)、隐藏外键
 *   2. 子表列配置 — 列表展示列 + 字典翻译列(_dictText)
 *   3. 子表 API 端点 — 独立 CRUD 接口
 *   4. 字典引用检查 — category(库位分类) + capacityUnit(容量单位)
 *
 * 运行:
 *   npx vitest run --config jeecgboot-vue3/vitest.config.ts
 *
 * 注意:
 *   当前版本验证 data.ts 和 api.ts 的数据结构正确性
 *   未 mount Vue 组件 (依赖 provide/inject 上下文)
 *   字典数据需要在后端 sys_dict_item 表中存在，否则前端下拉为空
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';

// ============================================================
// Mock 全局依赖
// ============================================================

// 模拟 HTTP 客户端
vi.mock('/@/utils/http/axios', () => ({
    defHttp: {
        get: vi.fn().mockResolvedValue({ success: true, code: 200, result: { records: [], total: 0 } }),
        post: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        put: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        delete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    },
}));

// 部分 Mock 库位 API
vi.mock('/@/views/warehouse/warehouse.api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('/@/views/warehouse/warehouse.api')>();
    return {
        ...actual,
        saveOrUpdateLocation: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        locationDelete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    };
});

// ============================================================
// 测试套件: WarehouseLocation 组件
// ============================================================

describe('WarehouseLocation 组件', () => {

    // ----------------------------------------------------------
    // 1. 子表表单 Schema — 字段定义与字典控件
    // ----------------------------------------------------------
    describe('子表表单 Schema 配置', () => {

        it('locationCode、locationName、category 应该为必填字段', async () => {
            const { warehouseLocationFormSchema } = await import('/@/views/warehouse/warehouse.data');
            const visibleFields = warehouseLocationFormSchema.filter((f: any) => f.show !== false);

            // 库位编码: 必填
            const codeField = visibleFields.find((f: any) => f.field === 'locationCode');
            expect(codeField).toBeDefined();
            expect(codeField!.required).toBe(true);

            // 库位名称: 必填
            const nameField = visibleFields.find((f: any) => f.field === 'locationName');
            expect(nameField).toBeDefined();
            expect(nameField!.required).toBe(true);

            // 库位分类: 必填 + 使用字典下拉控件
            const categoryField = visibleFields.find((f: any) => f.field === 'category');
            expect(categoryField).toBeDefined();
            expect(categoryField!.required).toBe(true);
            expect(categoryField!.component).toBe('JDictSelectTag');
        });

        it('category 和 capacityUnit 应该引用正确的字典编码', async () => {
            const { warehouseLocationFormSchema } = await import('/@/views/warehouse/warehouse.data');

            // 库位分类字典: dictCode = location_category
            // ⚠️ 若该字典在 sys_dict 中不存在或 item_text 为乱码，前端下拉将显示异常
            const categoryField = warehouseLocationFormSchema.find((f: any) => f.field === 'category');
            expect(categoryField!.component).toBe('JDictSelectTag');
            expect(categoryField!.componentProps).toMatchObject({ dictCode: 'location_category' });

            // 容量单位字典: dictCode = capacity_unit
            // ⚠️ 若该字典在 sys_dict 中不存在或 item_text 为乱码，前端下拉将显示异常
            const unitField = warehouseLocationFormSchema.find((f: any) => f.field === 'capacityUnit');
            expect(unitField!.component).toBe('JDictSelectTag');
            expect(unitField!.componentProps).toMatchObject({ dictCode: 'capacity_unit' });
        });

        it('capacity 字段应该使用 InputNumber 控件', async () => {
            const { warehouseLocationFormSchema } = await import('/@/views/warehouse/warehouse.data');

            // 容量使用数字输入控件
            const capacityField = warehouseLocationFormSchema.find((f: any) => f.field === 'capacity');
            expect(capacityField).toBeDefined();
            expect(capacityField!.component).toBe('InputNumber');
        });

        it('id 和 warehouseId 应该设置为隐藏字段', async () => {
            const { warehouseLocationFormSchema } = await import('/@/views/warehouse/warehouse.data');

            // id 隐藏 — 编辑时用于定位记录
            const idField = warehouseLocationFormSchema.find((f: any) => f.field === 'id');
            expect(idField!.show).toBe(false);

            // warehouseId 隐藏 — 新增时由 inject(mainId) 自动填充
            const whIdField = warehouseLocationFormSchema.find((f: any) => f.field === 'warehouseId');
            expect(whIdField!.show).toBe(false);
        });
    });

    // ----------------------------------------------------------
    // 2. 子表列配置 — 包含字典翻译列
    // ----------------------------------------------------------
    describe('子表列配置', () => {

        it('应该定义全部 6 个库位列（含字典翻译列）', async () => {
            const { warehouseLocationColumns } = await import('/@/views/warehouse/warehouse.data');
            expect(warehouseLocationColumns.length).toBeGreaterThanOrEqual(6);

            const columnKeys = warehouseLocationColumns.map((c: any) => c.dataIndex);
            // 基础列
            expect(columnKeys).toContain('locationCode');
            expect(columnKeys).toContain('locationName');
            // 字典翻译列 — 后端 @Dict 注解自动填充 _dictText 后缀字段
            expect(columnKeys).toContain('category_dictText');
            expect(columnKeys).toContain('capacityUnit_dictText');
            // 其他业务列
            expect(columnKeys).toContain('productName');
            expect(columnKeys).toContain('capacity');
        });
    });

    // ----------------------------------------------------------
    // 3. 子表 API 端点
    // ----------------------------------------------------------
    describe('子表 API 端点定义', () => {

        it('所有库位 CRUD 接口函数应该已导出', async () => {
            const api = await import('/@/views/warehouse/warehouse.api');

            // 库位列表查询
            expect(api.warehouseLocationList).toBeDefined();
            // 库位新增/编辑
            expect(api.saveOrUpdateLocation).toBeDefined();
            // 库位删除
            expect(api.locationDelete).toBeDefined();
            // 库位查询URL (供 Modal initFormData 使用)
            expect(api.warehouseLocationListUrl).toBeDefined();
        });

        it('库位列表 URL 应该包含 listWarehouseLocationByMainId', async () => {
            const api = await import('/@/views/warehouse/warehouse.api');
            // 验证 URL 指向正确的子表按主表ID查询接口
            expect(api.warehouseLocationListUrl).toContain('listWarehouseLocationByMainId');
        });

        it('saveOrUpdateLocation 应该是可调用的函数', async () => {
            const api = await import('/@/views/warehouse/warehouse.api');
            expect(typeof api.saveOrUpdateLocation).toBe('function');
        });
    });
});
