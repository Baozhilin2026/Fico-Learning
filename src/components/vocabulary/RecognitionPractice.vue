<template>
  <div class="recognition-practice">
    <div class="practice-header">
      <h3>认读练习</h3>
      <div class="header-info">
        <el-tag>{{ currentIndex + 1 }} / {{ totalQuestions }}</el-tag>
        <el-tag v-if="countdown > 0">{{ countdown }}s</el-tag>
      </div>
    </div>

    <div v-if="!showResult" class="practice-content">
      <div class="question-section">
        <div class="chinese-meaning">
          <p class="chinese">{{ currentVocabulary.中文翻译 }}</p>
          <p class="explanation">{{ currentVocabulary.中文解释 }}</p>
        </div>

        <el-button
          :icon="VideoPlay"
          circle
          size="large"
          @click="playAudio"
        >
          听读音
        </el-button>
      </div>

      <div class="options-section">
        <p class="instruction">请选择对应的英文术语</p>

        <div class="options-grid">
          <el-radio-group v-model="selectedAnswer" class="options-list">
            <el-radio
              v-for="option in currentOptions"
              :key="option.序号"
              class="option-item"
            >
              {{ option.英文 }}
            </el-radio>
          </el-radio-group>
        </div>

        <el-button
          type="primary"
          size="large"
          :disabled="selectedAnswer === null"
          @click="submitAnswer"
        >
          提交答案
        </el-button>
      </div>
    </div>

    <div v-else class="result-content">
      <el-result
        :icon="isCorrect ? 'success' : 'error'"
        :title="isCorrect ? t('vocabulary.correct') : t('vocabulary.incorrect')"
      >
        <template #sub-title>
          <div v-if="!isCorrect" class="answer-comparison">
            <p><strong>你的选择:</strong> {{ getVocabById(selectedAnswer)?.英文 }}</p>
            <p><strong>正确答案:</strong> {{ currentVocabulary.英文 }}</p>
          </div>
        </template>
      </el-result>

      <el-space>
        <el-button @click="next">{{ currentIndex >= totalQuestions - 1 ? '完成' : '继续' }}</el-button>
      </el-space>
    </div>

    <div class="practice-footer">
      <el-progress :percentage="progressPercentage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
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
const { speak } = useTTS()

const currentIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)
const correctCount = ref(0)
const questionOrder = ref<number[]>([])
const currentOptions = ref<VocabularyEntry[]>([])

// Countdown timer
const countdown = ref(3)
const countdownInterval = ref<NodeJS.Timeout | null>(null)

const totalQuestions = computed(() => Math.min(10, props.vocabularies.length))
const progressPercentage = computed(() => ((currentIndex.value) / totalQuestions.value) * 100)

const currentVocabulary = computed(() => {
  if (questionOrder.value.length === 0) return props.vocabularies[0]
  const index = questionOrder.value[currentIndex.value]
  return props.vocabularies[index]
})

// Clear countdown when component unmounts
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
})

onMounted(() => {
  // Reset index and countdown
  currentIndex.value = 0
  countdown.value = 3

  // Shuffle and select random vocabularies
  const indices = Array.from({ length: props.vocabularies.length }, (_, i) => i)
  shuffleArray(indices)
  questionOrder.value = indices.slice(0, totalQuestions.value)

  // Load first question options
  generateOptions()

  // Start countdown
  startCountdown()
})

// Watch for vocabulary changes to auto-play audio
watchEffect(() => {
  if (currentVocabulary.value) {
    nextTick(() => {
      playAudio()
    })
  }
})

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

async function playAudio() {
  // Force western accent, female voice, and 1.0x speed for vocabulary module
  await speak(currentVocabulary.value.英文, {
    accent: 'western',
    gender: 'female',
    rate: 1.0
  })
}

function getVocabById(id: number | null): VocabularyEntry | undefined {
  if (id === null) return undefined
  return props.vocabularies.find(v => v.序号 === id)
}

function generateOptions() {
  const correctIndex = questionOrder.value[currentIndex.value]
  const correctVocab = props.vocabularies[correctIndex]

  // Get 3 random wrong options
  const wrongOptions = props.vocabularies
    .filter(v => v.序号 !== correctVocab.序号)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  // Combine and shuffle
  const options = [correctVocab, ...wrongOptions]
  shuffleArray(options)

  currentOptions.value = options
}

function submitAnswer() {
  isCorrect.value = selectedAnswer.value === currentVocabulary.value.序号
  showResult.value = true

  if (isCorrect.value) {
    correctCount.value++
  }

  // Auto-play next question audio after short delay
  nextTick(() => {
    playAudio()
  })
}

function next() {
  selectedAnswer.value = null
  showResult.value = false

  if (currentIndex.value >= totalQuestions.value - 1) {
    // Practice complete
    emit('complete', {
      correct: correctCount.value,
      total: totalQuestions.value
    })
  } else {
    currentIndex.value++
    generateOptions()
    // Auto-play audio for next question
    nextTick(() => {
      playAudio()
    })
  }
}

function startCountdown() {
  // Clear any existing interval
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value)
      countdownInterval.value = null
      // Countdown finished - auto-play audio
      playAudio()
    }
  }, 1000)
}

function resetCountdown() {
  countdown.value = 3
}
</script>

<style scoped lang="scss">
.recognition-practice {
  max-width: 800px;
  margin: 0 auto;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.1) 100%);
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  position: relative;

  .header-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

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

.question-section {
  background-color: $bg-primary;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  text-align: center;
}

.chinese-meaning {
  margin-bottom: $spacing-lg;
}

.chinese {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $primary;
  margin-bottom: $spacing-sm;
}

.explanation {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: 1.6;
}

.options-section {
  background-color: $bg-primary;
  padding: $spacing-xl;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
}

.instruction {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  text-align: center;
  margin-bottom: $spacing-lg;
}

.options-grid {
  margin-bottom: $spacing-lg;
}

.options-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.option-item {
  padding: $spacing-lg;
  border: 2px solid $border-color;
  border-radius: $border-radius-lg;
  background: white;
  transition: all 0.2s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
}

.option-item:hover {
  background: $bg-secondary;
  border-color: $primary;
}

.option-item :deep(.el-radio__input) {
  margin-right: $spacing-sm;
}

.option-item :deep(.el-radio__label) {
  font-size: $font-size-base;
  color: $text-primary;
  line-height: 1.5;
  padding: $spacing-sm $spacing-sm;
  cursor: pointer;
  white-space: nowrap;
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

  p {
    margin: $spacing-sm 0;
    line-height: 1.6;
  }
}

.practice-footer {
  margin-top: $spacing-xl;
}
</style>
