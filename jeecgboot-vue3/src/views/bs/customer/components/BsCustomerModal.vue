<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="isUpdate ? '编辑客户' : '新增客户'"
    @ok="handleSubmit"
    width="1000px"
  >
    <BasicForm @register="registerForm">
      <template #customerType="{ model, field }">
        <a-form-item-rest>
          <JDictSelectTag v-model:value="model[field]" dictCode="customer_type" @change="handleTypeChange" />
        </a-form-item-rest>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from '../BsCustomer.data';
import { saveOrUpdate } from '../BsCustomer.api';

const emit = defineEmits(['success', 'register']);

const isUpdate = ref(false);

const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
  labelWidth: 120,
  schemas: formSchema,
  showActionButtonGroup: false,
});

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  resetFields();
  setModalProps({ confirmLoading: false, showCancelBtn: data?.showFooter, showOkBtn: data?.showFooter });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate) && data.record) {
    setFieldsValue({ ...data.record });
  }
  // 根据当前客户类型显示/隐藏专用字段
  handleTypeChange(data?.record?.customerType || '');
});

// 客户类型切换 → 联动显示/隐藏专用字段
const typeFieldMap: Record<string, string[]> = {
  '1': ['processingFeeRate', 'settlementMethod', 'paymentDays'],
  '2': ['dealerLevel', 'creditLimit', 'cooperationDate', 'dealerRegion'],
  '3': ['commissionRate', 'commissionMethod', 'agencyRegion', 'agencyProducts'],
};

const allTypeFields = Object.values(typeFieldMap).flat();

function handleTypeChange(typeVal: string) {
  const allSchemas = [...formSchema];
  allTypeFields.forEach((fieldName) => {
    updateSchema([{ field: fieldName, show: false }]);
  });
  const visibleFields = typeFieldMap[typeVal] || [];
  visibleFields.forEach((fieldName) => {
    updateSchema([{ field: fieldName, show: true }]);
  });
}

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    await saveOrUpdate(values, unref(isUpdate));
    closeModal();
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
