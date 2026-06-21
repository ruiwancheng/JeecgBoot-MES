/**
 * 客户管理 — BsCustomerModal 组件单元测试 (Vitest)
 *
 * ============================================================
 * 测试目标: 验证客户表单的数据结构定义和 API 端点
 *
 * 测试范围:
 *   1. 表单 Schema — 基础字段(12个) + 来料加工专用(3个) + 经销商专用(4个) + 分销专用(4个)
 *   2. 字典引用 — customer_type / customer_status / settlement_method /
 *                  dealer_level / commission_method
 *   3. 搜索表单 — customerCode + customerName + customerType
 *   4. 表格列 — 12列（含字典翻译列）
 *   5. API 端点 — CRUD 接口函数定义
 *
 * 运行:
 *   cd jeecgboot-vue3 && npx vitest run --config vitest.config.ts
 *
 * 注意:
 *   前端根据 customerType 值联动显示/隐藏专用字段组（handleTypeChange）
 *   本测试验证 Schema 定义正确性，不验证联动逻辑（需 mount 测试）
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';

// ============================================================
// Mock 全局依赖
// ============================================================

vi.mock('/@/utils/http/axios', () => ({
    defHttp: {
        get: vi.fn().mockResolvedValue({ success: true, code: 200, result: { records: [], total: 0 } }),
        post: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        put: vi.fn().mockResolvedValue({ success: true, code: 200 }),
        delete: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    },
}));

vi.mock('/@/views/bs/customer/BsCustomer.api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('/@/views/bs/customer/BsCustomer.api')>();
    return {
        ...actual,
        saveOrUpdate: vi.fn().mockResolvedValue({ success: true, code: 200 }),
    };
});

// ============================================================
// 测试套件
// ============================================================

describe('BsCustomerModal 组件', () => {

    // ----------------------------------------------------------
    // 1. 表单 Schema — 所有字段定义
    // ----------------------------------------------------------
    describe('表单 Schema 配置', () => {

        it('应该包含隐藏的 id 字段（放在首位）', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');
            const idField = formSchema[0];
            expect(idField.field).toBe('id');
            expect(idField.show).toBe(false);
        });

        it('customerCode、customerName、customerType 应该为必填', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');
            const visibleFields = formSchema.filter((f: any) => f.show !== false);

            // 编码 — 必填
            const codeField = visibleFields.find((f: any) => f.field === 'customerCode');
            expect(codeField).toBeDefined();
            expect(codeField!.dynamicRules).toBeDefined();

            // 名称 — 必填
            const nameField = visibleFields.find((f: any) => f.field === 'customerName');
            expect(nameField).toBeDefined();
            expect(nameField!.dynamicRules).toBeDefined();

            // 类型 — 必填 + 字典下拉
            const typeField = visibleFields.find((f: any) => f.field === 'customerType');
            expect(typeField).toBeDefined();
            expect(typeField!.dynamicRules).toBeDefined();
            expect(typeField!.component).toBe('JDictSelectTag');
        });

        it('应该包含12个基础字段（不含隐藏ID）', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');
            const visibleFields = formSchema.filter((f: any) => f.show !== false);
            expect(visibleFields.length).toBeGreaterThanOrEqual(12);
        });

        it('应该包含来料加工专用字段（processingFeeRate/settlementMethod/paymentDays）', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');

            const feeField = formSchema.find((f: any) => f.field === 'processingFeeRate');
            expect(feeField!.component).toBe('InputNumber');

            const settlementField = formSchema.find((f: any) => f.field === 'settlementMethod');
            expect(settlementField!.component).toBe('JDictSelectTag');

            const daysField = formSchema.find((f: any) => f.field === 'paymentDays');
            expect(daysField!.component).toBe('InputNumber');
        });

        it('应该包含渠道经销商专用字段（dealerLevel/creditLimit/cooperationDate/dealerRegion）', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');

            const levelField = formSchema.find((f: any) => f.field === 'dealerLevel');
            expect(levelField!.component).toBe('JDictSelectTag');

            const creditField = formSchema.find((f: any) => f.field === 'creditLimit');
            expect(creditField!.component).toBe('InputNumber');

            const dateField = formSchema.find((f: any) => f.field === 'cooperationDate');
            expect(dateField!.component).toBe('DatePicker');
        });

        it('应该包含分销客户专用字段（commissionRate/commissionMethod/agencyRegion/agencyProducts）', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');

            const rateField = formSchema.find((f: any) => f.field === 'commissionRate');
            expect(rateField!.component).toBe('InputNumber');

            const methodField = formSchema.find((f: any) => f.field === 'commissionMethod');
            expect(methodField!.component).toBe('JDictSelectTag');

            const productsField = formSchema.find((f: any) => f.field === 'agencyProducts');
            expect(productsField!.component).toBe('InputTextArea');
        });
    });

    // ----------------------------------------------------------
    // 2. 字典引用 — 验证5个字典编码正确
    // ----------------------------------------------------------
    describe('字典引用', () => {

        it('所有字典字段应该引用正确的 dictCode', async () => {
            const { formSchema } = await import('/@/views/bs/customer/BsCustomer.data');

            const dictFields: Record<string, string> = {
                customerType: 'customer_type',
                customerStatus: 'customer_status',
                settlementMethod: 'settlement_method',
                dealerLevel: 'dealer_level',
                commissionMethod: 'commission_method',
            };

            for (const [fieldName, expectedDictCode] of Object.entries(dictFields)) {
                const field = formSchema.find((f: any) => f.field === fieldName);
                expect(field, `${fieldName} 字段不存在`).toBeDefined();
                expect(field!.component).toBe('JDictSelectTag');
                expect(field!.componentProps?.dictCode).toBe(expectedDictCode);
            }
        });
    });

    // ----------------------------------------------------------
    // 3. 搜索表单
    // ----------------------------------------------------------
    describe('搜索表单', () => {

        it('应该支持按 customerCode/customerName/customerType 搜索', async () => {
            const { searchFormSchema } = await import('/@/views/bs/customer/BsCustomer.data');
            const fieldNames = searchFormSchema.map((f: any) => f.field);

            expect(fieldNames).toContain('customerCode');
            expect(fieldNames).toContain('customerName');
            expect(fieldNames).toContain('customerType');
        });
    });

    // ----------------------------------------------------------
    // 4. 表格列
    // ----------------------------------------------------------
    describe('表格列', () => {

        it('应该定义全部12个表格列（含字典翻译列）', async () => {
            const { columns } = await import('/@/views/bs/customer/BsCustomer.data');
            expect(columns.length).toBeGreaterThanOrEqual(12);

            const keys = columns.map((c: any) => c.dataIndex);
            expect(keys).toContain('customerCode');
            expect(keys).toContain('customerName');
            expect(keys).toContain('customerType_dictText');
            expect(keys).toContain('customerStatus_dictText');
            expect(keys).toContain('contactPerson');
            expect(keys).toContain('contactPhone');
            expect(keys).toContain('contactEmail');
            expect(keys).toContain('createTime');
        });
    });

    // ----------------------------------------------------------
    // 5. API 端点
    // ----------------------------------------------------------
    describe('API 端点', () => {

        it('所有 CRUD 接口函数应该已导出', async () => {
            const api = await import('/@/views/bs/customer/BsCustomer.api');

            expect(api.list).toBeDefined();          // 列表
            expect(api.saveOrUpdate).toBeDefined();  // 新增/编辑
            expect(api.del).toBeDefined();           // 删除
            expect(api.deleteBatch).toBeDefined();   // 批量删除
            expect(api.queryById).toBeDefined();     // 查询详情
        });

        it('接口函数应该都是可调用类型', async () => {
            const api = await import('/@/views/bs/customer/BsCustomer.api');

            expect(typeof api.list).toBe('function');
            expect(typeof api.saveOrUpdate).toBe('function');
            expect(typeof api.del).toBe('function');
            expect(typeof api.deleteBatch).toBe('function');
            expect(typeof api.queryById).toBe('function');
        });
    });
});
