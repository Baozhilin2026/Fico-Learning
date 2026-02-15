<template>
  <div class="script-card">
    <div class="card-header">
      <div class="meta-tags">
        <el-tag type="info" size="small">{{ object }}</el-tag>
        <el-tag type="success" size="small">{{ scenarioName }}</el-tag>
      </div>

      <div class="card-actions">
        <el-button
          :icon="isBookmarked ? StarFilled : Star"
          :type="isBookmarked ? 'warning' : 'default'"
          circle
          size="small"
          @click="$emit('bookmark', { object, phase, scenario })"
        />
      </div>
    </div>

    <div class="card-body">
      <div class="scene-info">
        <span class="scene-number">场景 {{ scenario.场景序号 }}</span>
        <span class="scene-name">{{ scenario.场景名称 }}</span>
      </div>

      <div class="english-sentence">
        {{ scenario.英文话术 }}
      </div>

      <div class="chinese-translation">
        {{ scenario.中文话术 }}
      </div>

      <el-collapse class="usage-collapse">
        <el-collapse-item name="usage">
          <template #title>
            <span class="usage-title">{{ t('communication.usageScene') }}</span>
          </template>
          <div class="usage-content">
            {{ scenario.使用场景 }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="card-footer">
      <el-button
        :icon="isPlaying ? VideoPause : VideoPlay"
        type="primary"
        @click="togglePlay"
      >
        {{ isPlaying ? '暂停' : '播放' }}
      </el-button>

      <el-button
        :icon="DocumentCopy"
        @click="copyText"
      >
        {{ t('communication.copyText') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Star, StarFilled, DocumentCopy } from '@element-plus/icons-vue'
import { useTTS } from '@/composables/useTTS'
import { useI18n } from '@/composables/useI18n'
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()

interface Props {
  object: string
  phase: string
  scenario: any
  isBookmarked?: boolean
}

interface Emits {
  (e: 'bookmark', data: { object: string; phase: string; scenario: any }): void
}

const props = withDefaults(defineProps<Props>(), {
  isBookmarked: false
})

defineEmits<Emits>()

const { t } = useI18n()
const { speak, isPlaying, stop } = useTTS()

const scenarioName = computed(() => {
  // Extract phase name from phase string
  const match = props.phase.match(/\(([^)]+)\)/)
  return match ? match[1] : props.phase
})

async function togglePlay() {
  if (isPlaying.value) {
    stop()
  } else {
    await speak(props.scenario.英文话术)

    // Add learning record when playing a statement
    progressStore.addRecord({
      type: 'communication',
      title: `${props.object} - ${scenarioName.value}: ${props.scenario.场景名称?.substring(0, 10)}${props.scenario.场景名称?.length > 10 ? '...' : ''}`
    })
  }
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(props.scenario.英文话术)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.script-card {
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  transition: all $transition-base;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.meta-tags {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.scene-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.scene-number {
  font-size: $font-size-xs;
  color: $text-disabled;
  padding: $spacing-xs $spacing-sm;
  background-color: $bg-secondary;
  border-radius: $border-radius-sm;
}

.scene-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.english-sentence {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.6;
}

.chinese-translation {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: 1.6;
}

.usage-collapse {
  border-top: 1px solid $divider;

  :deep(.el-collapse-item__header) {
    border-bottom: none;
    font-size: $font-size-sm;
    height: 40px;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }
}

.usage-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $primary;
}

.usage-content {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.6;
  padding: $spacing-sm 0;
}

.card-footer {
  display: flex;
  gap: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $divider;
}
</style>
