<template>
  <aside class="left-sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <span v-if="!collapsed" class="sidebar-title">{{ title }}</span>
      <el-button
        :icon="collapsed ? ArrowRight : ArrowLeft"
        text
        @click="toggleCollapse"
      />
    </div>

    <div class="sidebar-content">
      <div
        v-for="item in items"
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeItem === item.id }"
        @click="selectItem(item.id)"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span v-if="!collapsed" class="item-label">{{ item.label }}</span>
        <el-badge
          v-if="!collapsed && item.count !== undefined"
          :value="item.count"
          class="item-badge"
        />
      </div>
    </div>

    <div v-if="!collapsed && footer" class="sidebar-footer">
      <slot name="footer">
        {{ footer }}
      </slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

interface Props {
  title?: string
  items: Array<{
    id: string
    label: string
    icon?: any
    count?: number
  }>
  activeItem?: string
  footer?: string
  collapsed?: boolean
}

interface Emits {
  (e: 'update:activeItem', value: string): void
  (e: 'update:collapsed', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  activeItem: '',
  footer: '',
  collapsed: false
})

const emit = defineEmits<Emits>()

function selectItem(id: string) {
  emit('update:activeItem', id)
}

function toggleCollapse() {
  emit('update:collapsed', !props.collapsed)
}
</script>

<style scoped lang="scss">
.left-sidebar {
  width: $sidebar-width;
  height: calc(100vh - $navbar-height - $bottombar-height);
  background-color: $bg-primary;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: width $transition-base;

  &.collapsed {
    width: 60px;

    .sidebar-title,
    .item-label,
    .item-badge,
    .sidebar-footer {
      display: none;
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.sidebar-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-sm 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  margin: 0 $spacing-sm;
  border-radius: $border-radius-md;
  color: $text-secondary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background-color: $bg-secondary;
    color: $text-primary;
  }

  &.active {
    background-color: rgba($primary, 0.1);
    color: $primary;
  }

  .el-icon {
    font-size: $font-size-lg;
    flex-shrink: 0;
  }

  .item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-badge {
    flex-shrink: 0;
  }
}

.sidebar-footer {
  padding: $spacing-md;
  border-top: 1px solid $border-color;
  font-size: $font-size-xs;
  color: $text-disabled;
  text-align: center;
}
</style>
