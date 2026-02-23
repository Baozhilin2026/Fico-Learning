<template>
  <div class="dictation-practice">
    <div class="practice-header">
      <h3>听力默写练习</h3>
      <el-tag>{{ currentIndex + 1 }} / {{ totalQuestions }}</el-tag>
    </div>

    <!-- Countdown Overlay -->
    <div v-if="showCountdown" class="countdown-overlay">
      <div class="countdown-content">
        <div class="countdown-number">{{ countdown }}</div>
        <div class="countdown-text">秒后开始播放</div>
      </div>
    </div>

    <div v-else-if="!showResult && !showComplete" class="practice-content">
      <div class="audio-section">
        <el-button
          type="primary"
          :icon="isPlaying ? VideoPause : VideoPlay"
          circle
          :size="60"
          @click="togglePlay"
        />

        <div class="audio-controls">
          <el-button-group>
            <el-button :icon="RefreshLeft" @click="replay">
              重新播放
            </el-button>
            <el-button :icon="InfoFilled" @click="showHintDialog">
              提示
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div class="input-section">
        <el-input
          v-model="userAnswer"
          type="textarea"
          :rows="3"
          placeholder="请输入你听到的英文术语..."
          inputmode="text"
          class="handwriting-input"
          @keyup.ctrl.enter="submitAnswer"
        />

        <el-button
          type="primary"
          size="large"
          :disabled="!userAnswer.trim()"
          @click="submitAnswer"
        >
          提交答案 (Ctrl+Enter)
        </el-button>
      </div>
    </div>

    <!-- Complete Summary -->
    <div v-else-if="showComplete" class="complete-summary">
      <div class="summary-header">
        <div class="celebration-large">
          <div class="confetti-large">🎉</div>
          <h2>练习完成！</h2>
        </div>
        <div class="score-card">
          <div class="score-circle">
            <div class="score-percentage">{{ scorePercentage }}%</div>
            <div class="score-label">正确率</div>
          </div>
          <div class="score-details">
            <div class="score-item correct">
              <span class="score-number">{{ correctCount }}</span>
              <span class="score-text">答对</span>
            </div>
            <div class="score-item incorrect">
              <span class="score-number">{{ totalQuestions - correctCount }}</span>
              <span class="score-text">答错</span>
            </div>
            <div class="score-item total">
              <span class="score-number">{{ totalQuestions }}</span>
              <span class="score-text">总计</span>
            </div>
          </div>
        </div>
      </div>

      <div class="questions-review">
        <h3>答题详情</h3>
        <div class="review-list">
          <div
            v-for="(record, index) in answerRecords"
            :key="index"
            class="review-item"
            :class="{ correct: record.isCorrect, incorrect: !record.isCorrect }"
          >
            <div class="review-number">{{ index + 1 }}</div>
            <div class="review-content">
              <div class="review-english">{{ record.vocabulary.英文 }}</div>
              <div class="review-chinese">{{ record.vocabulary.中文翻译 }}</div>
              <div v-if="!record.isCorrect" class="review-wrong">
                你的答案：{{ record.userAnswer || '未作答' }}
              </div>
            </div>
            <div class="review-status">
              <el-icon v-if="record.isCorrect" class="status-icon correct">
                <CircleCheck />
              </el-icon>
              <el-icon v-else class="status-icon incorrect">
                <CircleClose />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-actions">
        <el-button size="large" @click="backToVocabulary">
          返回单词列表
        </el-button>
        <el-button type="primary" size="large" @click="restartPractice">
          再练一次
        </el-button>
      </div>
    </div>

    <div v-else class="result-content">
      <el-result
        :icon="isCorrect ? 'success' : 'error'"
        :title="isCorrect ? t('vocabulary.correct') : t('vocabulary.incorrect')"
      >
        <template #sub-title>
          <div class="answer-comparison" :class="{ 'correct-answer': isCorrect }">
            <div v-if="isCorrect" class="celebration">
              <div class="confetti">🎉</div>
              <div class="encouragement-text">太棒了！</div>
            </div>
            <p><strong>{{ t('vocabulary.correctAnswer') }}:</strong> {{ currentVocabulary.英文 }}</p>
            <p><strong>中文翻译:</strong> {{ currentVocabulary.中文翻译 }}</p>
            <p v-if="!isCorrect" class="your-answer"><strong>{{ t('vocabulary.yourAnswer') }}:</strong> {{ userAnswer }}</p>
          </div>
        </template>
        <template #extra>
          <el-space>
            <el-button v-if="!isCorrect" @click="retry">重试</el-button>
            <el-button v-if="!isCorrect" type="primary" @click="next">继续</el-button>
            <div v-if="isCorrect" class="auto-next-text">
              即将自动播放下一个...
            </div>
          </el-space>
        </template>
      </el-result>
    </div>

    <!-- Hint Dialog -->
    <el-dialog
      v-model="showHint"
      title="提示"
      width="500px"
      :close-on-click-modal="true"
      @close="closeHint"
    >
      <div class="hint-content">
        <div class="hint-item">
          <span class="hint-label">英文术语：</span>
          <span class="hint-value english">{{ currentVocabulary.英文 }}</span>
        </div>
        <div class="hint-item">
          <span class="hint-label">中文翻译：</span>
          <span class="hint-value chinese">{{ currentVocabulary.中文翻译 }}</span>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="closeHint">
          知道了，重新练习
        </el-button>
      </template>
    </el-dialog>

    <div class="practice-footer">
      <el-progress :percentage="progressPercentage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VideoPlay, VideoPause, RefreshLeft, InfoFilled, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { useTTS } from '@/composables/useTTS'
import { useI18n } from '@/composables/useI18n'
import type { VocabularyEntry } from '@/types'

interface Props {
  vocabularies: VocabularyEntry[]
}

interface Emits {
  (e: 'complete', result: { correct: number; total: number }): void
  (e: 'back'): void
}

interface AnswerRecord {
  vocabulary: VocabularyEntry
  userAnswer: string
  isCorrect: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { speak, isPlaying, stop } = useTTS()

const currentIndex = ref(0)
const userAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const correctCount = ref(0)
const questionOrder = ref<number[]>([])
const countdown = ref(3)
const showCountdown = ref(true)
const countdownInterval = ref<number | null>(null)
const showHint = ref(false)
const showComplete = ref(false)
const answerRecords = ref<AnswerRecord[]>([])

const scorePercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const totalQuestions = computed(() => Math.min(10, props.vocabularies.length))
const progressPercentage = computed(() => {
  // When showing complete summary, show 100%
  if (showComplete.value) return 100
  // Otherwise, progress based on answered questions
  const answeredCount = answerRecords.value.length
  return Math.round((answeredCount / totalQuestions.value) * 100)
})

const currentVocabulary = computed(() => {
  if (questionOrder.value.length === 0) return props.vocabularies[0]
  const index = questionOrder.value[currentIndex.value]
  return props.vocabularies[index]
})

// Start countdown and play audio when countdown ends
function startCountdown() {
  showCountdown.value = true
  countdown.value = 3

  countdownInterval.value = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
      showCountdown.value = false
      // Auto play audio after countdown - use default rate
      speak(currentVocabulary.value.英文, { rate: 1.0 })
    }
  }, 1000)
}

onMounted(() => {
  // Shuffle and select random vocabularies
  const indices = Array.from({ length: props.vocabularies.length }, (_, i) => i)
  shuffleArray(indices)
  questionOrder.value = indices.slice(0, totalQuestions.value)

  // Start countdown
  startCountdown()
})

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

async function togglePlay() {
  if (isPlaying.value) {
    stop()
  } else {
    // Use default browser voice with 1.0x speed
    await speak(currentVocabulary.value.英文, { rate: 1.0 })
  }
}

function replay() {
  stop()
  setTimeout(() => {
    speak(currentVocabulary.value.英文, { rate: 1.0 })
  }, 100)
}

function submitAnswer() {
  // Normalize answers: lowercase and remove all spaces for comparison
  const normalizeAnswer = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim()
  const correctAnswer = normalizeAnswer(currentVocabulary.value.英文)
  const userAnswerNormalized = normalizeAnswer(userAnswer.value)
  isCorrect.value = correctAnswer === userAnswerNormalized

  // Record the answer
  answerRecords.value.push({
    vocabulary: currentVocabulary.value,
    userAnswer: userAnswer.value,
    isCorrect: isCorrect.value
  })

  if (isCorrect.value) {
    correctCount.value++
    // Auto play next word after a short delay
    showResult.value = true
    setTimeout(() => {
      next()
    }, 1500)
  } else {
    showResult.value = true
  }
}

function retry() {
  userAnswer.value = ''
  showResult.value = false
  // Auto play audio immediately
  speak(currentVocabulary.value.英文, { rate: 1.0 })
}

function showHintDialog() {
  showHint.value = true
}

function closeHint() {
  showHint.value = false
  // Clear the answer and replay audio
  userAnswer.value = ''
  showResult.value = false
  setTimeout(() => {
    speak(currentVocabulary.value.英文, { rate: 1.0 })
  }, 300)
}

function next() {
  if (currentIndex.value >= totalQuestions.value - 1) {
    // Practice complete - show summary
    // Set showComplete first to avoid showing practice interface
    showComplete.value = true
    showResult.value = false
    userAnswer.value = ''
    emit('complete', {
      correct: correctCount.value,
      total: totalQuestions.value
    })
  } else {
    // Move to next question
    userAnswer.value = ''
    showResult.value = false
    currentIndex.value++
    // Auto play audio immediately
    speak(currentVocabulary.value.英文, { rate: 1.0 })
  }
}

function restartPractice() {
  // Reset all state
  currentIndex.value = 0
  userAnswer.value = ''
  showResult.value = false
  isCorrect.value = false
  correctCount.value = 0
  showComplete.value = false
  answerRecords.value = []

  // Reshuffle questions
  const indices = Array.from({ length: props.vocabularies.length }, (_, i) => i)
  shuffleArray(indices)
  questionOrder.value = indices.slice(0, totalQuestions.value)

  // Start countdown
  startCountdown()
}

function backToVocabulary() {
  emit('back')
}

// Cleanup
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped lang="scss">
.dictation-practice {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.countdown-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  background-color: rgba(0, 0, 0, 0.8);
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  z-index: 10;
}

.countdown-content {
  text-align: center;

  .countdown-number {
    font-size: 48px;
    font-weight: $font-weight-bold;
    color: $primary;
    animation: countdownPulse 1s ease-in-out infinite;
  }

  .countdown-text {
    font-size: $font-size-sm;
    color: white;
  }
}

@keyframes countdownPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;

  h3 {
    margin: 0;
    color: $primary;
  }
}

.practice-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.audio-section {
  text-align: center;
  padding: $spacing-2xl;
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;

  .hint {
    margin-top: $spacing-lg;
    color: $text-secondary;
  }

  .audio-controls {
    margin-top: $spacing-lg;
  }
}

.input-section {
  background-color: $bg-primary;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  // iPad and touch device optimizations
  :deep(.handwriting-input) {
    .el-textarea__inner {
      // Ensure good touch target size
      min-height: 80px;
      font-size: 16px; // Prevents iOS zoom on focus
      line-height: 1.5;

      // Enable handwriting input on iPad
      -webkit-overflow-scrolling: touch;

      // Improve touch experience
      touch-action: manipulation;

      // Better focus state for touch
      &:focus {
        outline: 2px solid $primary;
        outline-offset: -2px;
      }
    }
  }
}

.result-content {
  background-color: $bg-primary;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
}

.answer-comparison {
  text-align: left;
  margin-top: $spacing-md;

  &.correct-answer {
    animation: slideIn 0.5s ease-out;
  }

  p {
    margin: $spacing-sm 0;
    line-height: 1.6;
  }

  .your-answer {
    color: $warning;
  }
}

.celebration {
  text-align: center;
  margin-bottom: $spacing-lg;
  animation: bounceIn 0.6s ease-out;

  .confetti {
    font-size: 48px;
    animation: confettiFall 0.8s ease-out;
  }

  .encouragement-text {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $success;
    animation: textPop 0.4s ease-out;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes confettiFall {
  0% {
    opacity: 0;
    transform: translateY(-50px) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translateY(0) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

@keyframes textPop {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.practice-footer {
  margin-top: $spacing-xl;
}

.complete-summary {
  max-width: 800px;
  margin: 0 auto;
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-2xl;
}

.summary-header {
  text-align: center;
  margin-bottom: $spacing-2xl;
}

.celebration-large {
  margin-bottom: $spacing-xl;
  animation: bounceIn 0.6s ease-out;

  .confetti-large {
    font-size: 80px;
    animation: confettiFall 1s ease-out;
  }

  h2 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $primary;
    margin: $spacing-md 0 0 0;
  }
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xl;
  padding: $spacing-xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: $border-radius-lg;
  color: white;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 8px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  .score-percentage {
    font-size: 48px;
    font-weight: $font-weight-bold;
    line-height: 1;
  }

  .score-label {
    font-size: $font-size-sm;
    opacity: 0.9;
    margin-top: $spacing-xs;
  }
}

.score-details {
  display: flex;
  gap: $spacing-2xl;
  width: 100%;
  justify-content: center;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;

  .score-number {
    font-size: 32px;
    font-weight: $font-weight-bold;
    line-height: 1;
  }

  .score-text {
    font-size: $font-size-sm;
    opacity: 0.9;
  }

  &.correct .score-number {
    color: #67f3d8;
  }

  &.incorrect .score-number {
    color: #ffcfcf;
  }

  &.total .score-number {
    color: white;
  }
}

.questions-review {
  margin-bottom: $spacing-2xl;

  h3 {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-lg;
    text-align: center;
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  max-height: 400px;
  overflow-y: auto;
  padding-right: $spacing-sm;
}

.review-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  border-left: 4px solid $border-color;
  transition: all 0.3s ease;

  &.correct {
    border-left-color: $success;
    background-color: rgba($success, 0.05);
  }

  &.incorrect {
    border-left-color: $error;
    background-color: rgba($error, 0.05);
  }

  .review-number {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: $primary;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-semibold;
    font-size: $font-size-sm;
  }

  .review-content {
    flex: 1;
    min-width: 0;
  }

  .review-english {
    font-weight: $font-weight-semibold;
    color: $text-primary;
    font-size: $font-size-base;
    margin-bottom: $spacing-xs;
  }

  .review-chinese {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .review-wrong {
    color: $error;
    font-size: $font-size-sm;
    margin-top: $spacing-xs;
  }

  .review-status {
    flex-shrink: 0;
  }

  .status-icon {
    font-size: 24px;

    &.correct {
      color: $success;
    }

    &.incorrect {
      color: $error;
    }
  }
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  padding-top: $spacing-xl;
  border-top: 1px solid $divider;
}

.hint-content {
  padding: $spacing-lg 0;

  .hint-item {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: $bg-secondary;
    border-radius: $border-radius-md;

    &:last-child {
      margin-bottom: 0;
    }

    .hint-label {
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      min-width: 100px;
    }

    .hint-value {
      font-size: $font-size-lg;

      &.english {
        color: $primary;
        font-weight: $font-weight-bold;
      }

      &.chinese {
        color: $text-primary;
      }
    }
  }
}

.auto-next-text {
  color: $success;
  font-size: $font-size-sm;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// iPad specific optimizations
@media (pointer: coarse) {
  .input-section {
    :deep(.handwriting-input) {
      .el-textarea__inner {
        // Larger minimum height for touch devices
        min-height: 120px;
        // Better spacing for handwriting
        padding: 12px;
      }
    }
  }
}
</style>
