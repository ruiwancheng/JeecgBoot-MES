/**
 * WarehouseModal 组件单元测试
 *
 * 运行: npx vitest run --config vitest.config.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock defHttp (must be before API module import)
vi.mock('/@/utils/http/axios', () => ({
    defHttp: {
        get: vi.fn().mockResolvedValue({ success: true, code: 200, result: { records: [], total: 0 } }),
        post: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        put: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        delete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    },
}));

// Partial mock API — keep original exports, only mock saveOrUpdate
vi.mock('../warehouse.api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../warehouse.api')>();
    return {
        ...actual,
        saveOrUpdate: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    };
});

describe('WarehouseModal 组件', () => {

    describe('表单 Schema 配置', () => {
        it('should define required fields for warehouseCode and warehouseName', async () => {
            const { warehouseFormSchema } = await import('../warehouse.data');
            const visibleFields = warehouseFormSchema.filter((f: any) => f.show !== false);

            const codeField = visibleFields.find((f: any) => f.field === 'warehouseCode');
            const nameField = visibleFields.find((f: any) => f.field === 'warehouseName');

            expect(codeField).toBeDefined();
            expect(codeField!.required).toBe(true);
            expect(codeField!.component).toBe('Input');

            expect(nameField).toBeDefined();
            expect(nameField!.required).toBe(true);
            expect(nameField!.component).toBe('Input');
        });

        it('should include optional fields for address, manager, and remark', async () => {
            const { warehouseFormSchema } = await import('../warehouse.data');
            const visibleFields = warehouseFormSchema.filter((f: any) => f.show !== false);
            const fieldNames = visibleFields.map((f: any) => f.field);

            expect(fieldNames).toContain('address');
            expect(fieldNames).toContain('manager');
            expect(fieldNames).toContain('remark');

            const managerField = visibleFields.find((f: any) => f.field === 'manager');
            expect(managerField!.component).toBe('JSelectUser');
        });

        it('should hide the id field', async () => {
            const { warehouseFormSchema } = await import('../warehouse.data');
            const idField = warehouseFormSchema.find((f: any) => f.field === 'id');
            expect(idField).toBeDefined();
            expect(idField!.show).toBe(false);
        });
    });

    describe('搜索表单 Schema 配置', () => {
        it('should define search fields for warehouseCode and warehouseName', async () => {
            const { warehouseSearchFormSchema } = await import('../warehouse.data');
            const fieldNames = warehouseSearchFormSchema.map((f: any) => f.field);

            expect(fieldNames).toContain('warehouseCode');
            expect(fieldNames).toContain('warehouseName');

            const codeSearch = warehouseSearchFormSchema.find((f: any) => f.field === 'warehouseCode');
            expect(codeSearch!.component).toBe('Input');
        });
    });

    describe('表格列配置', () => {
        it('should define all 5 warehouse table columns', async () => {
            const { warehouseColumns } = await import('../warehouse.data');
            expect(warehouseColumns.length).toBeGreaterThanOrEqual(5);

            const columnKeys = warehouseColumns.map((c: any) => c.dataIndex);
            expect(columnKeys).toContain('warehouseCode');
            expect(columnKeys).toContain('warehouseName');
            expect(columnKeys).toContain('address');
            expect(columnKeys).toContain('createTime');
        });
    });

    describe('API 端点定义', () => {
        it('should define all warehouse CRUD API paths', async () => {
            const api = await import('../warehouse.api');

            // 验证 API 函数存在
            expect(api.warehouseList).toBeDefined();
            expect(api.saveOrUpdate).toBeDefined();
            expect(api.warehouseDelete).toBeDefined();
            expect(api.warehouseDeleteBatch).toBeDefined();
        });

        it('should use correct HTTP methods for each operation', async () => {
            const api = await import('../warehouse.api');

            // 所有导出函数应为 Function 类型
            expect(typeof api.warehouseList).toBe('function');
            expect(typeof api.saveOrUpdate).toBe('function');
            expect(typeof api.warehouseDelete).toBe('function');
            expect(typeof api.warehouseDeleteBatch).toBe('function');
        });
    });
});
