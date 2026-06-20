import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';

// ====== 表格列 ======
export const columns: BasicColumn[] = [
  { title: '客户编码', align: 'center', dataIndex: 'customerCode', width: 120 },
  { title: '客户名称', align: 'center', dataIndex: 'customerName', width: 150 },
  { title: '客户类型', align: 'center', dataIndex: 'customerType_dictText', width: 120 },
  { title: '客户状态', align: 'center', dataIndex: 'customerStatus_dictText', width: 100 },
  { title: '联系人', align: 'center', dataIndex: 'contactPerson', width: 100 },
  { title: '联系电话', align: 'center', dataIndex: 'contactPhone', width: 120 },
  { title: '联系邮箱', align: 'center', dataIndex: 'contactEmail', width: 150 },
  { title: '省', align: 'center', dataIndex: 'province', width: 100 },
  { title: '市', align: 'center', dataIndex: 'city', width: 100 },
  { title: '区', align: 'center', dataIndex: 'area', width: 100 },
  { title: '详细地址', align: 'center', dataIndex: 'address', width: 200 },
  { title: '创建时间', align: 'center', dataIndex: 'createTime', width: 160 },
];

// ====== 搜索表单 ======
export const searchFormSchema: FormSchema[] = [
  { label: '客户编码', field: 'customerCode', component: 'Input', colProps: { span: 8 } },
  { label: '客户名称', field: 'customerName', component: 'Input', colProps: { span: 8 } },
  { label: '客户类型', field: 'customerType', component: 'JDictSelectTag',
    componentProps: { dictCode: 'customer_type' }, colProps: { span: 8 } },
];

// ====== 表单Schema ======
export const formSchema: FormSchema[] = [
  { label: '', field: 'id', component: 'Input', show: false },

  // 基本信息
  { label: '客户编码', field: 'customerCode', component: 'Input',
    dynamicRules: ({ model, schema }) => [{ required: true, message: '请输入客户编码!' }],
    colProps: { span: 12 } },
  { label: '客户名称', field: 'customerName', component: 'Input',
    dynamicRules: ({ model, schema }) => [{ required: true, message: '请输入客户名称!' }],
    colProps: { span: 12 } },
  { label: '客户类型', field: 'customerType', component: 'JDictSelectTag',
    componentProps: { dictCode: 'customer_type', getPopupContainer: () => document.body },
    dynamicRules: ({ model, schema }) => [{ required: true, message: '请选择客户类型!' }],
    colProps: { span: 12 } },
  { label: '客户状态', field: 'customerStatus', component: 'JDictSelectTag',
    componentProps: { dictCode: 'customer_status', getPopupContainer: () => document.body },
    defaultValue: '1', colProps: { span: 12 } },
  { label: '联系人', field: 'contactPerson', component: 'Input', colProps: { span: 12 } },
  { label: '联系电话', field: 'contactPhone', component: 'Input', colProps: { span: 12 } },
  { label: '联系邮箱', field: 'contactEmail', component: 'Input', colProps: { span: 12 } },
  { label: '省', field: 'province', component: 'Input', colProps: { span: 12 } },
  { label: '市', field: 'city', component: 'Input', colProps: { span: 12 } },
  { label: '区', field: 'area', component: 'Input', colProps: { span: 12 } },
  { label: '详细地址', field: 'address', component: 'Input', colProps: { span: 24 } },
  { label: '备注', field: 'remark', component: 'InputTextArea',
    componentProps: { rows: 3 }, colProps: { span: 24 } },

  // 来料加工客户专用
  { label: '加工费率(%)', field: 'processingFeeRate', component: 'InputNumber',
    componentProps: { min: 0, max: 100, style: 'width:100%' }, colProps: { span: 12 } },
  { label: '结算方式', field: 'settlementMethod', component: 'JDictSelectTag',
    componentProps: { dictCode: 'settlement_method', getPopupContainer: () => document.body },
    colProps: { span: 12 } },
  { label: '账期(天)', field: 'paymentDays', component: 'InputNumber',
    componentProps: { min: 0, style: 'width:100%' }, colProps: { span: 12 } },

  // 渠道经销商专用
  { label: '经销商等级', field: 'dealerLevel', component: 'JDictSelectTag',
    componentProps: { dictCode: 'dealer_level', getPopupContainer: () => document.body },
    colProps: { span: 12 } },
  { label: '信用额度(元)', field: 'creditLimit', component: 'InputNumber',
    componentProps: { min: 0, style: 'width:100%' }, colProps: { span: 12 } },
  { label: '合作开始日期', field: 'cooperationDate', component: 'DatePicker',
    componentProps: { valueFormat: 'YYYY-MM-DD', placeholder: '请选择日期', style: 'width:100%', getPopupContainer: () => document.body },
    colProps: { span: 12 } },
  { label: '经销区域', field: 'dealerRegion', component: 'Input', colProps: { span: 12 } },

  // 分销客户专用
  { label: '提成比例(%)', field: 'commissionRate', component: 'InputNumber',
    componentProps: { min: 0, max: 100, style: 'width:100%' }, colProps: { span: 12 } },
  { label: '提成结算方式', field: 'commissionMethod', component: 'JDictSelectTag',
    componentProps: { dictCode: 'commission_method', getPopupContainer: () => document.body },
    colProps: { span: 12 } },
  { label: '代理区域', field: 'agencyRegion', component: 'Input', colProps: { span: 12 } },
  { label: '代理产品范围', field: 'agencyProducts', component: 'InputTextArea',
    componentProps: { rows: 3 }, colProps: { span: 24 } },
];
