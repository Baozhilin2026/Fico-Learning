<template>
  <div class="question-card">
    <div class="card-header">
      <div class="meta-tags">
        <el-tag type="primary" size="small">{{ question.questionNo }}</el-tag>
        <el-tag type="info" size="small">{{ partName }}</el-tag>
      </div>

      <div class="card-actions">
        <el-button
          :icon="isBookmarked ? StarFilled : Star"
          :type="isBookmarked ? 'warning' : 'default'"
          circle
          size="small"
          @click="$emit('bookmark', { part, question })"
        />
      </div>
    </div>

    <div class="card-body">
      <!-- Question Section -->
      <div class="question-section">
        <div class="section-header">
          <span class="label">Question / 问题</span>
          <el-button
            :icon="VideoPlay"
            size="small"
            @click="playQuestion"
          >
            播放题目 / Play
          </el-button>
        </div>
        <p class="question-text">{{ question.questionContent }}</p>
        <p v-if="question.questionContentCN" class="question-text-cn">{{ question.questionContentCN }}</p>
      </div>

      <!-- English Answer Section -->
      <div class="answer-section answer-en">
        <div class="section-header">
          <span class="label">English Answer / 英文答案</span>
          <el-button
            :icon="VideoPlay"
            size="small"
            type="primary"
            @click="playEnglishAnswer"
          >
            播放英文答案 / Play English
          </el-button>
        </div>
        <div class="answer-text">{{ question.sampleAnswer }}</div>
      </div>

      <!-- Chinese Answer Section -->
      <div class="answer-section answer-cn">
        <div class="section-header">
          <span class="label">Chinese Answer / 中文答案</span>
          <span class="no-audio-hint">（不提供朗读 / No Audio）</span>
        </div>
        <div class="answer-text">{{ question.sampleAnswerCN }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay, Star, StarFilled } from '@element-plus/icons-vue'
import { useTTS } from '@/composables/useTTS'
import { useI18n } from '@/composables/useI18n'
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()

interface Props {
  question: any
  part: string
  partName: string
  isBookmarked?: boolean
}

interface Emits {
  (e: 'bookmark', data: { part: string; question: any }): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const { speak } = useTTS()

async function playQuestion() {
  await speak(props.question.questionContent)

  // Add learning record when playing interview question
  progressStore.addRecord({
    type: 'interview',
    title: `${props.partName} - 题目 #${props.question.questionNo}`
  })
}

async function playEnglishAnswer() {
  await speak(props.question.sampleAnswer)

  // Add learning record when playing English answer
  progressStore.addRecord({
    type: 'interview',
    title: `${props.partName} - 英文答案 #${props.question.questionNo}`
  })
}
</script>

<style scoped lang="scss">
.question-card {
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  transition: all $transition-base;
  border: 1px solid $border-color;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.meta-tags {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.card-actions {
  display: flex;
  gap: $spacing-sm;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.question-section,
.answer-section {
  padding: $spacing-md;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  border: 1px solid $divider;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $primary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Question text - adjusted for better readability
.question-text {
  font-size: 18px;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.6;
  margin: 0;
  padding: $spacing-sm;
  background-color: $bg-primary;
  border-radius: $border-radius-sm;
}

.question-text-cn {
  font-size: 16px;
  font-weight: $font-weight-normal;
  color: $text-secondary;
  line-height: 1.6;
  margin: $spacing-sm 0 0 0;
  padding: $spacing-sm;
  background-color: $bg-primary;
  border-radius: $border-radius-sm;
  border-left: 3px solid $primary;
}

// English answer section
.answer-en {
  background-color: #f0f9ff;
  border-color: #b3e5fc;
}

// Chinese answer section
.answer-cn {
  background-color: #fff8f0;
  border-color: #ffe0b2;
}

// Answer text - adjusted for better readability
.answer-text {
  font-size: 16px;
  color: $text-primary;
  line-height: 1.7;
  margin: 0;
  padding: $spacing-md;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: $border-radius-sm;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-audio-hint {
  font-size: $font-size-sm;
  color: $text-secondary;
  font-style: italic;
}

// Responsive design
@media (max-width: 768px) {
  .question-card {
    padding: $spacing-md;
  }

  .question-text {
    font-size: 16px;
  }

  .question-text-cn {
    font-size: 15px;
  }

  .answer-text {
    font-size: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

// High contrast mode support for accessibility
@media (prefers-contrast: high) {
  .question-card {
    border-width: 2px;
  }

  .question-text,
  .answer-text {
    border-width: 1px;
  }
}
</style>
