import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/bs/customer/list',
  add = '/bs/customer/add',
  edit = '/bs/customer/edit',
  delete = '/bs/customer/delete',
  deleteBatch = '/bs/customer/deleteBatch',
  queryById = '/bs/customer/queryById',
  exportXls = '/bs/customer/exportXls',
  importExcel = '/bs/customer/importExcel',
}

// 列表查询
export const list = (params) => defHttp.get({ url: Api.list, params });

// 新增/编辑
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.add;
  return defHttp.post({ url: url, params }, { successMessageMode: 'none' });
};

// 删除
export const del = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

// 批量删除
export const deleteBatch = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

// 查询详情
export const queryById = (params) => defHttp.get({ url: Api.queryById, params });
