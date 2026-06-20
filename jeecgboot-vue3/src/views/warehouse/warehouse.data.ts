import { BasicColumn, FormSchema } from '/@/components/Table';

// ====== 主表：仓库 ======

export const warehouseColumns: BasicColumn[] = [
  { title: '仓库编码', align: 'center', dataIndex: 'warehouseCode', width: 120 },
  { title: '仓库名称', align: 'center', dataIndex: 'warehouseName', width: 150 },
  { title: '仓库地址', align: 'center', dataIndex: 'address', width: 200 },
  { title: '负责人', align: 'center', dataIndex: 'manager_dictText', width: 100 },
  { title: '创建时间', align: 'center', dataIndex: 'createTime', width: 160 },
];

export const warehouseSearchFormSchema: FormSchema[] = [
  { label: '仓库编码', field: 'warehouseCode', component: 'Input', colProps: { span: 8 } },
  { label: '仓库名称', field: 'warehouseName', component: 'Input', colProps: { span: 8 } },
];

export const warehouseFormSchema: FormSchema[] = [
  { label: '', field: 'id', component: 'Input', show: false },
  { label: '仓库编码', field: 'warehouseCode', component: 'Input', required: true, colProps: { span: 24 } },
  { label: '仓库名称', field: 'warehouseName', component: 'Input', required: true, colProps: { span: 24 } },
  { label: '仓库地址', field: 'address', component: 'Input', colProps: { span: 24 } },
  { label: '负责人', field: 'manager', component: 'JSelectUser', colProps: { span: 24 } },
  { label: '备注', field: 'remark', component: 'InputTextArea', colProps: { span: 24 } },
];

// ====== 子表：库位 ======

export const warehouseLocationColumns: BasicColumn[] = [
  { title: '库位编码', align: 'center', dataIndex: 'locationCode', width: 150 },
  { title: '库位名称', align: 'center', dataIndex: 'locationName', width: 180 },
  { title: '库位分类', align: 'center', dataIndex: 'category_dictText', width: 100 },
  { title: '存放商品', align: 'center', dataIndex: 'productName', width: 200 },
  { title: '容量', align: 'center', dataIndex: 'capacity', width: 80 },
  { title: '容量单位', align: 'center', dataIndex: 'capacityUnit_dictText', width: 80 },
];

export const warehouseLocationFormSchema: FormSchema[] = [
  { label: '', field: 'id', component: 'Input', show: false },
  { label: '', field: 'warehouseId', component: 'Input', show: false },
  { label: '库位编码', field: 'locationCode', component: 'Input', required: true, colProps: { span: 24 } },
  { label: '库位名称', field: 'locationName', component: 'Input', required: true, colProps: { span: 24 } },
  { label: '库位分类', field: 'category', component: 'JDictSelectTag', componentProps: { dictCode: 'location_category' }, required: true, colProps: { span: 24 } },
  { label: '存放商品', field: 'productName', component: 'Input', colProps: { span: 24 } },
  { label: '容量', field: 'capacity', component: 'InputNumber', colProps: { span: 24 } },
  { label: '容量单位', field: 'capacityUnit', component: 'JDictSelectTag', componentProps: { dictCode: 'capacity_unit' }, colProps: { span: 24 } },
];
