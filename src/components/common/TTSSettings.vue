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
            <span class="label">TTS 引擎</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'engine', value: 'web' }">
            <span :class="{ active: currentEngine === 'web' }">
              浏览器内置 (免费)
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'engine', value: 'google' }">
            <span :class="{ active: currentEngine === 'google' }">
              Google Cloud (高质量)
            </span>
          </el-dropdown-item>

          <el-dropdown-item disabled divided>
            <span class="label">{{ t('tts.accent') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'accent', value: 'indian' }">
            <span :class="{ active: currentAccent === 'indian' }">
              {{ t('mockInterview.indianAccent') }}
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'accent', value: 'singapore' }">
            <span :class="{ active: currentAccent === 'singapore' }">
              {{ t('mockInterview.singaporeAccent') }}
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'accent', value: 'western' }">
            <span :class="{ active: currentAccent === 'western' }">
              {{ t('mockInterview.westernAccent') }}
            </span>
          </el-dropdown-item>

          <el-dropdown-item disabled divided>
            <span class="label">{{ t('tts.gender') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'gender', value: 'male' }">
            <span :class="{ active: currentGender === 'male' }">
              {{ t('mockInterview.male') }}
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'gender', value: 'female' }">
            <span :class="{ active: currentGender === 'female' }">
              {{ t('mockInterview.female') }}
            </span>
          </el-dropdown-item>

          <el-dropdown-item disabled divided>
            <span class="label">{{ t('tts.speed') }}</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 0.6 }">
            <span :class="{ active: currentRate === 0.6 }">
              {{ t('tts.slow') }} (0.6x)
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 1.0 }">
            <span :class="{ active: currentRate === 1.0 }">
              {{ t('tts.normal') }} (1.0x)
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ type: 'rate', value: 1.6 }">
            <span :class="{ active: currentRate === 1.6 }">
              {{ t('tts.fast') }} (1.6x)
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
import { useI18n } from '@/composables/useI18n'
import { unifiedTTSService } from '@/services/unifiedTTSService'

const settingsStore = useSettingsStore()
const { t } = useI18n()

const currentEngine = computed(() => unifiedTTSService.getEngine())
const currentAccent = computed(() => settingsStore.ttsAccent)
const currentGender = computed(() => settingsStore.ttsGender)
const currentRate = computed(() => settingsStore.ttsRate)

function handleCommand(command: { type: string; value: any }) {
  switch (command.type) {
    case 'engine':
      unifiedTTSService.setEngine(command.value)
      break
    case 'accent':
      settingsStore.setTTSAccent(command.value)
      break
    case 'gender':
      settingsStore.setTTSGender(command.value)
      break
    case 'rate':
      settingsStore.setTTSRate(command.value)
      break
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
