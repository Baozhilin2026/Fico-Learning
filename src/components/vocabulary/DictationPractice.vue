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

    <div v-else-if="!showResult" class="practice-content">
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
            <el-button :icon="Right" @click="next">
              跳过
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
            <el-button @click="retry">重试</el-button>
            <el-button type="primary" @click="next">继续</el-button>
          </el-space>
        </template>
      </el-result>
    </div>

    <div class="practice-footer">
      <el-progress :percentage="progressPercentage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VideoPlay, VideoPause, RefreshLeft, Right } from '@element-plus/icons-vue'
import { useTTS } from '@/composables/useTTS'
import { useI18n } from '@/composables/useI18n'
import type { VocabularyEntry } from '@/types'

interface Props {
  vocabularies: VocabularyEntry[]
}

interface Emits {
  (e: 'complete', result: { correct: number; total: number }): void
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

const totalQuestions = computed(() => Math.min(10, props.vocabularies.length))
const progressPercentage = computed(() => ((currentIndex.value) / totalQuestions.value) * 100)

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
  const correctAnswer = currentVocabulary.value.英文.toLowerCase().trim()
  const answer = userAnswer.value.toLowerCase().trim()
  isCorrect.value = correctAnswer === answer

  if (isCorrect.value) {
    correctCount.value++
  }

  showResult.value = true
}

function retry() {
  userAnswer.value = ''
  showResult.value = false
  // Auto play audio immediately
  speak(currentVocabulary.value.英文, { rate: 1.0 })
}

function next() {
  userAnswer.value = ''
  showResult.value = false

  if (currentIndex.value >= totalQuestions.value - 1) {
    // Practice complete
    emit('complete', {
      correct: correctCount.value,
      total: totalQuestions.value
    })
  } else {
    currentIndex.value++
    // Auto play audio immediately
    speak(currentVocabulary.value.英文, { rate: 1.0 })
  }
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
