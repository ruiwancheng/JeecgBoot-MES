<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="isUpdate ? '编辑库位' : '新增库位'" @ok="handleSubmit" width="550px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" name="warehouse-location-modal" setup>
  import { ref, unref, inject, computed, type Ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { warehouseLocationFormSchema } from '../warehouse.data';
  import { saveOrUpdateLocation } from '../warehouse.api';

  const isUpdate = ref(false);

  // 注入主表ID（来自 WarehouseList 的 provide）
  const mainId = inject<Ref<string>>('mainId', ref(''));

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    schemas: warehouseLocationFormSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    if (unref(isUpdate) && data.record) {
      setFieldsValue({ ...data.record });
    }
  });

  async function handleSubmit() {
    try {
      const values = await validate();
      // 自动关联主表ID
      if (unref(mainId)) {
        values.warehouseId = unref(mainId);
      }
      setModalProps({ confirmLoading: true });
      await saveOrUpdateLocation(values, isUpdate.value);
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  const emit = defineEmits(['success', 'register']);
</script>
