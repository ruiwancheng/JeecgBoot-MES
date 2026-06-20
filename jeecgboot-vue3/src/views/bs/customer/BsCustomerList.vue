<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增客户</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <BsCustomerModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import BsCustomerModal from './components/BsCustomerModal.vue';
import { list, del, deleteBatch } from './BsCustomer.api';
import { columns, searchFormSchema } from './BsCustomer.data';

const [registerModal, { openModal }] = useModal();
const [registerTable, { reload }] = useTable({
  title: '客户管理',
  api: list,
  columns,
  formConfig: { schemas: searchFormSchema },
  useSearchForm: true,
  showTableSetting: true,
  showIndexColumn: false,
  actionColumn: {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
});

function handleCreate() {
  openModal(true, { isUpdate: false, showFooter: true });
}

function handleEdit(record) {
  openModal(true, { record, isUpdate: true, showFooter: true });
}

function handleDelete(record) {
  del({ id: record.id }, handleSuccess);
}

function handleSuccess() {
  reload();
}

function getTableAction(record) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    {
      label: '删除',
      popConfirm: {
        title: '确认删除?',
        confirm: handleDelete.bind(null, record),
      },
    },
  ];
}
</script>
