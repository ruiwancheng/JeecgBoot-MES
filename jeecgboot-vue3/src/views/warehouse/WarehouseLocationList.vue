<template>
  <div>
    <BasicTable @register="registerSubTable">
      <template #tableTitle>
        <span style="font-weight: bold">📦 库位管理</span>
        <a-button type="primary" size="small" preIcon="ant-design:plus-outlined" @click="handleCreate" style="margin-left: 12px">新增库位</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <WarehouseLocationModal @register="registerSubModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, inject, watch, unref, type Ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { isEmpty } from '/@/utils/is';
  import WarehouseLocationModal from './components/WarehouseLocationModal.vue';
  import { warehouseLocationList, locationDelete, locationDeleteBatch } from './warehouse.api';
  import { warehouseLocationColumns } from './warehouse.data';

  const $message = useMessage();

  // 注入主表选中 ID
  const mainId = inject<Ref<string>>('mainId', ref(''));

  // 子表
  const [registerSubTable, { reload: reloadSub }] = useTable({
    rowKey: 'id',
    columns: warehouseLocationColumns,
    api: fetchSubList,
    useSearchForm: false,
    showTableSetting: false,
    showIndexColumn: false,
    maxHeight: 300,
  });

  async function fetchSubList(params: any) {
    const id = unref(mainId);
    if (isEmpty(id)) return { records: [], total: 0 };
    return await warehouseLocationList({ ...params, warehouseId: id });
  }

  // 主表选中变化 → 重新加载子表
  watch(mainId, () => {
    reloadSub();
  });

  // 子表 Modal
  const [registerSubModal, { openModal: openSubModal }] = useModal();

  function handleCreate() {
    if (isEmpty(unref(mainId))) {
      $message.createMessage.warning('请先选择一条仓库记录');
      return;
    }
    openSubModal(true, { isUpdate: false, showFooter: true });
  }
  function handleEdit(record: Recordable) {
    openSubModal(true, { record, isUpdate: true, showFooter: true });
  }
  function handleSuccess() {
    reloadSub();
  }
  function handleDelete(record: Recordable) {
    locationDelete({ id: record.id }, handleSuccess);
  }
  function getActions(record: Recordable) {
    return [
      { label: '编辑', onClick: handleEdit.bind(null, record) },
      { label: '删除', popConfirm: { title: '是否确认删除', confirm: handleDelete.bind(null, record) } },
    ];
  }
</script>
