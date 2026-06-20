<template>
  <div class="p-4">
    <BasicTable @register="registerMainTable" :maxHeight="300">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreateMain">新增仓库</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getMainActions(record)" />
      </template>
    </BasicTable>

    <div style="margin-top: 16px">
      <a-card :bordered="false" size="small">
        <WarehouseLocationList />
      </a-card>
    </div>

    <WarehouseModal @register="registerMainModal" @success="handleMainSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, provide, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import WarehouseModal from './components/WarehouseModal.vue';
  import WarehouseLocationList from './WarehouseLocationList.vue';
  import { warehouseList, warehouseDelete, warehouseDeleteBatch } from './warehouse.api';
  import { warehouseColumns, warehouseSearchFormSchema } from './warehouse.data';

  // 追踪选中的仓库 ID（用 watch 方式：onSelectChange 回调更新）
  const selectedId = ref('');

  // 主表
  const [registerMainTable, { reload: reloadMain, getSelectRows }] = useTable({
    rowKey: 'id',
    api: warehouseList,
    columns: warehouseColumns,
    useSearchForm: true,
    formConfig: { schemas: warehouseSearchFormSchema },
    clickToRowSelect: false,
    rowSelection: {
      type: 'radio',
      onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
        // 单选模式，选中时更新 selectedId
        selectedId.value = selectedRowKeys.length > 0 ? selectedRowKeys[0] : '';
      },
    },
  });

  // 通过 provide 下发选中仓库 ID
  provide('mainId', selectedId);

  // 主表 Modal
  const [registerMainModal, { openModal: openMainModal }] = useModal();
  function handleCreateMain() {
    openMainModal(true, { isUpdate: false, showFooter: true });
  }
  function handleEditMain(record: Recordable) {
    openMainModal(true, { record, isUpdate: true, showFooter: true });
  }
  function handleMainSuccess() {
    reloadMain();
  }
  function handleDeleteMain(record: Recordable) {
    warehouseDelete({ id: record.id }, handleMainSuccess);
  }
  function getMainActions(record: Recordable) {
    return [
      { label: '编辑', onClick: handleEditMain.bind(null, record) },
      { label: '删除', popConfirm: { title: '是否确认删除', confirm: handleDeleteMain.bind(null, record) } },
    ];
  }
</script>
