/**
 * WarehouseLocationModal & WarehouseLocationList 组件单元测试
 *
 * 运行: npx vitest run --config vitest.config.ts
 */

import { describe, it, expect, vi } from 'vitest';

// Mock defHttp (must be before API module import)
vi.mock('/@/utils/http/axios', () => ({
    defHttp: {
        get: vi.fn().mockResolvedValue({ success: true, code: 200, result: { records: [], total: 0 } }),
        post: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        put: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        delete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    },
}));

// Partial mock API — keep original exports
vi.mock('../warehouse.api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../warehouse.api')>();
    return {
        ...actual,
        saveOrUpdateLocation: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        locationDelete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    };
});

describe('WarehouseLocation 组件', () => {

    describe('子表表单 Schema 配置', () => {
        it('should define required fields for locationCode, locationName, category', async () => {
            const { warehouseLocationFormSchema } = await import('../warehouse.data');
            const visibleFields = warehouseLocationFormSchema.filter((f: any) => f.show !== false);

            const codeField = visibleFields.find((f: any) => f.field === 'locationCode');
            const nameField = visibleFields.find((f: any) => f.field === 'locationName');
            const categoryField = visibleFields.find((f: any) => f.field === 'category');

            expect(codeField).toBeDefined();
            expect(codeField!.required).toBe(true);

            expect(nameField).toBeDefined();
            expect(nameField!.required).toBe(true);

            expect(categoryField).toBeDefined();
            expect(categoryField!.required).toBe(true);
            expect(categoryField!.component).toBe('JDictSelectTag');
        });

        it('should use JDictSelectTag for category and capacityUnit', async () => {
            const { warehouseLocationFormSchema } = await import('../warehouse.data');

            const categoryField = warehouseLocationFormSchema.find((f: any) => f.field === 'category');
            const unitField = warehouseLocationFormSchema.find((f: any) => f.field === 'capacityUnit');

            expect(categoryField!.component).toBe('JDictSelectTag');
            expect(categoryField!.componentProps).toMatchObject({ dictCode: 'location_category' });

            expect(unitField!.component).toBe('JDictSelectTag');
            expect(unitField!.componentProps).toMatchObject({ dictCode: 'capacity_unit' });
        });

        it('should use InputNumber for capacity field', async () => {
            const { warehouseLocationFormSchema } = await import('../warehouse.data');

            const capacityField = warehouseLocationFormSchema.find((f: any) => f.field === 'capacity');
            expect(capacityField).toBeDefined();
            expect(capacityField!.component).toBe('InputNumber');
        });

        it('should hide id and warehouseId fields', async () => {
            const { warehouseLocationFormSchema } = await import('../warehouse.data');

            const idField = warehouseLocationFormSchema.find((f: any) => f.field === 'id');
            const whIdField = warehouseLocationFormSchema.find((f: any) => f.field === 'warehouseId');

            expect(idField!.show).toBe(false);
            expect(whIdField!.show).toBe(false);
        });
    });

    describe('子表列配置', () => {
        it('should define all 6 location table columns', async () => {
            const { warehouseLocationColumns } = await import('../warehouse.data');
            expect(warehouseLocationColumns.length).toBeGreaterThanOrEqual(6);

            const columnKeys = warehouseLocationColumns.map((c: any) => c.dataIndex);
            expect(columnKeys).toContain('locationCode');
            expect(columnKeys).toContain('locationName');
            expect(columnKeys).toContain('category_dictText');
            expect(columnKeys).toContain('productName');
            expect(columnKeys).toContain('capacity');
            expect(columnKeys).toContain('capacityUnit_dictText');
        });
    });

    describe('子表 API 端点定义', () => {
        it('should define all location CRUD API paths', async () => {
            const api = await import('../warehouse.api');

            expect(api.warehouseLocationList).toBeDefined();
            expect(api.saveOrUpdateLocation).toBeDefined();
            expect(api.locationDelete).toBeDefined();
            expect(api.warehouseLocationListUrl).toBeDefined();
        });

        it('should use listWarehouseLocationByMainId for fetching locations', async () => {
            const api = await import('../warehouse.api');
            expect(api.warehouseLocationListUrl).toContain('listWarehouseLocationByMainId');
        });

        it('should export saveOrUpdateLocation as a function', async () => {
            const api = await import('../warehouse.api');
            expect(typeof api.saveOrUpdateLocation).toBe('function');
        });
    });
});
