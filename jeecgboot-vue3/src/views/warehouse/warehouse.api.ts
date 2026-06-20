import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  // 主表
  warehouseList = '/warehouse/warehouse/list',
  warehouseAdd = '/warehouse/warehouse/addMain',
  warehouseEdit = '/warehouse/warehouse/editMain',
  warehouseDelete = '/warehouse/warehouse/delete',
  warehouseDeleteBatch = '/warehouse/warehouse/deleteBatch',
  // 库位子表（独立CRUD）
  locationList = '/warehouse/warehouse/listWarehouseLocationByMainId',
  locationAdd = '/warehouse/warehouse/addWarehouseLocation',
  locationEdit = '/warehouse/warehouse/editWarehouseLocation',
  locationDelete = '/warehouse/warehouse/deleteWarehouseLocation',
  locationDeleteBatch = '/warehouse/warehouse/deleteBatchWarehouseLocation',
}

// ====== 主表 ======

export const warehouseList = (params) => defHttp.get({ url: Api.warehouseList, params });

export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.warehouseEdit : Api.warehouseAdd;
  return defHttp.post({ url, params });
};

export const warehouseDelete = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.warehouseDelete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const warehouseDeleteBatch = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.warehouseDeleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

// ====== 库位子表 ======

/** 导出 URL 字符串（用于 Modal 内直接请求） */
export const warehouseLocationListUrl = Api.locationList;

/** 导出函数（用于 BasicTable :api 绑定，支持分页） */
export const warehouseLocationList = (params) => defHttp.get({ url: Api.locationList, params });

export const saveOrUpdateLocation = (params, isUpdate) => {
  let url = isUpdate ? Api.locationEdit : Api.locationAdd;
  return defHttp.post({ url, params });
};

export const locationDelete = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.locationDelete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const locationDeleteBatch = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.locationDeleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
