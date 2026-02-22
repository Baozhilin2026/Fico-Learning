<template>
  <div class="tts-settings">
    <el-dropdown trigger="click" @command="handleCommand">
      <el-button :icon="Setting" circle />

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled>
            <div class="dropdown-title">语音设置</div>
          </el-dropdown-item>

          <el-dropdown-item disabled divided>
            <span class="label">语速</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 0.7 }">
            <span :class="{ active: currentRate === 0.7 }">
              慢速 (0.7x)
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 1.0 }">
            <span :class="{ active: currentRate === 1.0 }">
              正常 (1.0x)
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 1.3 }">
            <span :class="{ active: currentRate === 1.3 }">
              快速 (1.3x)
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const currentRate = computed(() => settingsStore.ttsRate)

function handleCommand(command: { type: string; value: any }) {
  if (command.type === 'rate') {
    settingsStore.setTTSRate(command.value)
  }
}
</script>

<style scoped lang="scss">
.tts-settings {
  display: inline-block;
}

.dropdown-title {
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.label {
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.active {
  color: $primary;
  font-weight: $font-weight-medium;

  &::after {
    content: '✓';
    margin-left: $spacing-sm;
  }
}
</style>
