<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})
</script>

<style>
/* Element Plus custom theme */
:root {
  --el-color-primary: #008FD3;
  --el-color-primary-light-3: #4FC3F7;
  --el-color-primary-light-5: #81D4FA;
  --el-color-primary-light-7: #B3E5FC;
  --el-color-primary-light-8: #E1F5FE;
  --el-color-primary-light-9: #F0F9FF;
  --el-color-primary-dark-2: #005A87;
}

/* Element Plus component overrides */
.el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);

  &:hover,
  &:focus {
    background-color: var(--el-color-primary-light-3);
    border-color: var(--el-color-primary-light-3);
  }
}

.el-tag--primary {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

/* Custom scrollbar for Element Plus components */
.el-scrollbar__wrap {
  scrollbar-width: thin;
}

.el-select-dropdown,
.el-autocomplete-dropdown {
  border-radius: var(--el-border-radius-base);
}

/* Radio button group custom styling */
.el-radio-group {
  flex-wrap: wrap;
}

.el-radio-button {
  --el-radio-button-checked-bg-color: var(--el-color-primary);
  --el-radio-button-checked-text-color: white;
  --el-radio-button-checked-border-color: var(--el-color-primary);
}

/* Progress bar styling */
.el-progress__text {
  font-size: 14px !important;
}

/* Collapse styling */
.el-collapse {
  border: none;
}

.el-collapse-item__header {
  height: auto;
  line-height: 1.5;
  padding: 12px 16px;
}

/* Pagination styling */
.el-pagination {
  justify-content: center;
}

/* Input styling */
.el-input__wrapper,
.el-textarea__inner {
  border-radius: var(--el-border-radius-base);
}

/* Alert styling */
.el-alert {
  border-radius: var(--el-border-radius-base);
}

/* Result styling */
.el-result {
  padding: 40px 20px;
}

/* Timeline styling */
.el-timeline-item__wrapper {
  padding-left: 28px;
}

/* Segmented styling */
.el-segmented {
  background-color: var(--el-fill-color-light);
}
</style>
