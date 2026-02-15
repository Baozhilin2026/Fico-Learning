<template>
  <div class="interview-session">
    <div class="session-container">
      <!-- Session Header -->
      <div class="session-header">
        <div class="stage-info">
          <el-tag type="primary" size="large">{{ currentStage }}</el-tag>
          <span class="question-count">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
        </div>

        <div class="session-actions">
          <el-button
            :icon="isPaused ? VideoPlay : VideoPause"
            circle
            @click="togglePause"
          />
          <el-button
            :icon="Close"
            type="danger"
            circle
            @click="handleEndInterview"
          />
        </div>
      </div>

      <!-- Pause Overlay -->
      <div v-if="isPaused" class="pause-overlay">
        <el-icon :size="80"><VideoPlay /></el-icon>
        <p>面试已暂停</p>
        <el-button type="primary" @click="togglePause">继续面试</el-button>
      </div>

      <!-- Question Section -->
      <div v-if="!isPaused" class="question-section">
        <div class="question-header">
          <el-icon class="question-icon"><QuestionFilled /></el-icon>
          <span>面试问题</span>
          <el-button
            :icon="VideoPlay"
            size="small"
            text
            :loading="playingQuestion"
            @click="playQuestion"
          >
            播放问题
          </el-button>
        </div>

        <!-- AI Avatar & Countdown -->
        <div class="avatar-container">
          <div class="ai-avatar" :class="{ 'speaking': playingQuestion }">
            <svg viewBox="0 0 100 100" class="avatar-svg">
              <defs>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <!-- Face -->
              <circle cx="50" cy="50" r="45" fill="url(#avatarGradient)" />
              <!-- Eyes -->
              <ellipse cx="35" cy="40" rx="8" ry="10" fill="white" />
              <ellipse cx="65" cy="40" rx="8" ry="10" fill="white" />
              <circle cx="35" cy="40" r="4" fill="#333" />
              <circle cx="65" cy="40" r="4" fill="#333" />
              <!-- Eyebrows -->
              <line x1="25" y1="28" x2="45" y2="32" stroke="white" stroke-width="2" stroke-linecap="round" />
              <line x1="55" y1="32" x2="75" y2="28" stroke="white" stroke-width="2" stroke-linecap="round" />
              <!-- Mouth -->
              <path
                :d="playingQuestion ? 'M 30 65 Q 50 80 70 65' : 'M 35 65 Q 50 60 65 65'"
                stroke="white"
                stroke-width="3"
                fill="none"
                stroke-linecap="round"
              />
              <!-- Sound waves when speaking -->
              <g v-if="playingQuestion" class="sound-waves">
                <circle cx="50" cy="50" r="50" fill="none" stroke="rgba(102, 126, 234, 0.3)" stroke-width="2" class="wave-1" />
                <circle cx="50" cy="50" r="55" fill="none" stroke="rgba(102, 126, 234, 0.2)" stroke-width="2" class="wave-2" />
              </g>
            </svg>
          </div>

          <!-- Countdown Overlay -->
          <div v-if="countdown > 0" class="countdown-overlay">
            <div class="countdown-number">{{ countdown }}</div>
            <div class="countdown-text">秒后开始朗读</div>
          </div>
        </div>

        <div class="question-content">
          <p class="question-text">{{ currentQuestion.englishQuestion }}</p>
          <p class="question-translation">{{ currentQuestion.chineseTranslation }}</p>
        </div>
      </div>

      <!-- Answer Section -->
      <div v-if="!isPaused" class="answer-section">
        <div class="answer-header">
          <span>你的回答</span>
          <el-segmented v-model="answerMode" :options="answerModeOptions" />
        </div>

        <!-- Text Answer -->
        <div v-if="answerMode === 'text'" class="text-answer">
          <el-input
            v-model="textAnswer"
            type="textarea"
            :rows="8"
            placeholder="请用英文输入你的回答..."
            show-word-limit
            maxlength="2000"
          />

          <div class="answer-hint">
            <span :class="{ 'hint-warning': textAnswer.trim().length > 0 && textAnswer.trim().length < 10 }">
              {{ textAnswer.trim().length }} / 10 字符（最少10个字符）
            </span>
          </div>

          <div class="answer-actions">
            <el-button
              type="primary"
              :disabled="textAnswer.trim().length < 10"
              @click="submitTextAnswer"
            >
              提交回答
            </el-button>

            <el-button @click="skipQuestion">
              跳过此题
            </el-button>
          </div>
        </div>

        <!-- Voice Answer -->
        <div v-else class="voice-answer">
          <div class="recorder-container">
            <div class="recorder-display">
              <el-button
                :type="isRecording ? 'danger' : 'primary'"
              :icon="isRecording ? VideoPause : VideoPlay"
              circle
              :size="60"
              @click="toggleRecording"
            />

              <div class="recorder-info">
                <div class="recording-time">{{ formattedDuration() }}</div>
                <div class="recording-status">
                  {{ isRecording ? '录音中（点击停止）' : hasRecording ? '录音完成' : '点击开始录音' }}
                </div>
              </div>

              <div v-if="hasRecording" class="recorder-controls">
                <el-button
                  :icon="VideoPlay"
                  circle
                  size="small"
                  @click="playRecording"
                >
                  播放录音
                </el-button>

                <el-button
                  :icon="RefreshLeft"
                  circle
                  size="small"
                  @click="resetRecording"
                >
                  重新录制
                </el-button>
              </div>
            </div>

            <div class="recorder-actions">
              <el-button
                type="primary"
                :disabled="!hasRecording"
                @click="submitVoiceAnswer"
              >
                提交录音
              </el-button>

              <el-button @click="skipQuestion">
                跳过此题
              </el-button>
            </div>
          </div>

          <!-- Audio Player for recording -->
          <audio
            v-if="audioUrl"
            ref="audioPlayer"
            :src="audioUrl"
            @ended="handleAudioEnded"
          />
        </div>
      </div>

      <!-- Timer -->
      <div v-if="!isPaused" class="timer-bar">
        <div
          class="timer-progress"
          :style="{ width: `${timerPercentage}%` }"
        />
        <span class="timer-text">剩余时间: {{ remainingTime }}秒</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  VideoPlay,
  VideoPause,
  Close,
  QuestionFilled,
  RefreshLeft
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTTS } from '@/composables/useTTS'
import { useRecorder } from '@/composables/useRecorder'
import { useI18n } from '@/composables/useI18n'
import { useProgressStore } from '@/stores/progress'

interface Props {
  questions: Array<{
    englishQuestion: string
    chineseTranslation: string
  }>
  settings: {
    accent: string
    gender: string
    timePerQuestion?: number // Time per question in seconds
  }
}

interface Emits {
  (e: 'complete', answers: Array<{ question: string; answer: string; audioBlob?: Blob }>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { speak: speakTTS, setAccent, setGender } = useTTS()
const {
  state: recorderState,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  resetRecording,
  formattedDuration,
  isSupported: isRecorderSupported
} = useRecorder()
const progressStore = useProgressStore()

const currentQuestionIndex = ref(0)
const isPaused = ref(false)
const answerMode = ref<'text' | 'voice'>('text')

// Current stage based on question progress
const currentStage = computed(() => {
  const stages = ['项目经验', '技术问题', '真实场景', '反问环节']
  const totalQuestions = props.questions.length
  if (totalQuestions === 0) return ''
  const questionsPerStage = Math.ceil(totalQuestions / stages.length)
  const stageIndex = Math.min(Math.floor(currentQuestionIndex.value / questionsPerStage), stages.length - 1)
  return stages[stageIndex]
})
const textAnswer = ref('')
const playingQuestion = ref(false)
const countdown = ref(0)
const countdownInterval = ref<number | null>(null)
const questionPlayed = ref(false)

// Get time per question from settings, default to 180 seconds (3 minutes)
const timePerQuestion = computed(() => props.settings.timePerQuestion || 180)
const remainingTime = ref(timePerQuestion.value)

const timerInterval = ref<number | null>(null)
const isRecording = ref(false)
const audioPlayer = ref<HTMLAudioElement | null>(null)

const answers = ref<Array<{ question: string; answer: string; audioBlob?: Blob }>>([])

const answerModeOptions = [
  { label: '文字输入', value: 'text' },
  { label: '语音回答', value: 'voice' }
]

const currentQuestion = computed(() => props.questions[currentQuestionIndex.value])

const totalQuestions = computed(() => props.questions.length)

const timerPercentage = computed(() => {
  return ((timePerQuestion.value - remainingTime.value) / timePerQuestion.value) * 100
})

const hasRecording = computed(() => recorderState.value.audioBlob !== null)

const audioUrl = computed(() => recorderState.value.audioUrl)

// Initialize TTS settings
onMounted(() => {
  setAccent(props.settings.accent as any)
  setGender(props.settings.gender as any)
  remainingTime.value = timePerQuestion.value
})

// Timer
function startTimer() {
  remainingTime.value = timePerQuestion.value
  timerInterval.value = window.setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      autoSubmit()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function autoSubmit() {
  if (answerMode.value === 'text' && textAnswer.value.trim().length >= 10) {
    submitTextAnswer()
  } else if (answerMode.value === 'voice' && hasRecording.value) {
    submitVoiceAnswer()
  } else {
    skipQuestion()
  }
}

// Question playback
async function playQuestion() {
  // Stop countdown if running
  stopCountdown()
  playingQuestion.value = true
  try {
    await speakTTS(currentQuestion.value.englishQuestion)
    questionPlayed.value = true

    // Add learning record when playing interview question
    progressStore.addRecord({
      type: 'interview',
      title: `模拟面试 - ${currentStage.value}: ${currentQuestion.value.englishQuestion?.substring(0, 30)}${currentQuestion.value.englishQuestion?.length > 30 ? '...' : ''}`
    })
  } finally {
    playingQuestion.value = false
  }
}

// Start countdown before playing question
function startCountdown() {
  countdown.value = 5
  countdownInterval.value = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
      // Auto play question after countdown
      playQuestion()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  countdown.value = 0
}

// Pause/Resume
function togglePause() {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    stopTimer()
    stopCountdown()
  } else {
    startTimer()
    // Only start countdown if question hasn't been played yet
    if (!questionPlayed.value && !playingQuestion.value) {
      startCountdown()
    }
  }
}

// Text answer
function submitTextAnswer() {
  // Validate that answer is not empty
  const trimmedAnswer = textAnswer.value.trim()
  if (!trimmedAnswer) {
    ElMessage.warning('请输入回答内容后再提交')
    return
  }

  // Minimum length validation (at least 10 characters)
  if (trimmedAnswer.length < 10) {
    ElMessage.warning('回答内容太短，请至少输入10个字符')
    return
  }

  answers.value.push({
    question: currentQuestion.value.englishQuestion,
    answer: trimmedAnswer
  })

  nextQuestion()
}

// Voice answer
async function toggleRecording() {
  if (!isRecording.value) {
    await startRecording()
    isRecording.value = true
  } else {
    // Stop recording when clicked again
    stopRecording()
    isRecording.value = false
  }
}

function submitVoiceAnswer() {
  // Ensure recording is stopped
  if (isRecording.value) {
    stopRecording()
    isRecording.value = false
  }

  answers.value.push({
    question: currentQuestion.value.englishQuestion,
    answer: '[语音回答]',
    audioBlob: recorderState.value.audioBlob!
  })

  nextQuestion()
}

function playRecording() {
  if (audioPlayer.value) {
    audioPlayer.value.play()
  }
}

function handleAudioEnded() {
  // Audio finished playing
}

// Navigation
function nextQuestion() {
  textAnswer.value = ''
  resetRecording()
  stopTimer()
  stopCountdown()
  questionPlayed.value = false

  if (currentQuestionIndex.value >= totalQuestions.value - 1) {
    // Interview complete - add learning record
    const answeredCount = answers.value.filter(a => a.answer !== '[跳过]').length
    progressStore.addRecord({
      type: 'interview',
      title: `模拟面试完成 - 回答 ${answeredCount}/${totalQuestions.value} 题`,
      score: Math.round((answeredCount / totalQuestions.value) * 100)
    })

    emit('complete', answers.value)
  } else {
    currentQuestionIndex.value++
    startTimer()
    // Start countdown for next question
    startCountdown()
  }
}

function skipQuestion() {
  answers.value.push({
    question: currentQuestion.value.englishQuestion,
    answer: '[跳过]'
  })

  nextQuestion()
}

// End interview
async function handleEndInterview() {
  try {
    await ElMessageBox.confirm(
      '确定要结束面试吗？当前进度将不会保存。',
      '结束面试',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    emit('cancel')
  } catch {
    // User cancelled
  }
}

// Start first question timer and countdown
onMounted(() => {
  startTimer()
  startCountdown()
})

// Cleanup
onUnmounted(() => {
  stopTimer()
  stopCountdown()
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style scoped lang="scss">
.interview-session {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  background-color: $bg-secondary;
}

.session-container {
  max-width: 1000px;
  width: 100%;
  background-color: $bg-primary;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-color;
  background-color: $bg-primary;
}

.stage-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.question-count {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.session-actions {
  display: flex;
  gap: $spacing-sm;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  color: white;
  z-index: 10;

  p {
    font-size: $font-size-xl;
    margin: 0;
  }
}

.question-section {
  padding: $spacing-xl;
  border-bottom: 1px solid $divider;
}

.avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: $spacing-xl 0;
}

.ai-avatar {
  width: 120px;
  height: 120px;
  position: relative;
  transition: transform 0.3s ease;

  &.speaking {
    animation: speakingPulse 0.5s ease-in-out infinite;
  }

  .avatar-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
  }
}

@keyframes speakingPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.sound-waves {
  .wave-1, .wave-2 {
    animation: wavePulse 1.5s ease-in-out infinite;
  }

  .wave-2 {
    animation-delay: 0.5s;
  }
}

@keyframes wavePulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
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
  z-index: 5;

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

.question-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.question-icon {
  font-size: $font-size-xl;
  color: $primary;
}

.question-content {
  .question-text {
    font-size: $font-size-xl;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .question-translation {
    font-size: $font-size-base;
    color: $text-secondary;
    margin: 0;
  }
}

.answer-section {
  padding: $spacing-xl;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.text-answer {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.answer-hint {
  text-align: right;
  font-size: $font-size-xs;
  color: $text-secondary;
  padding: 0 $spacing-xs;

  .hint-warning {
    color: $warning;
    font-weight: $font-weight-medium;
  }
}

.answer-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}

.voice-answer {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.recorder-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.recorder-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-xl;
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
}

.recorder-info {
  text-align: center;
}

.recording-time {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $primary;
  font-family: monospace;
}

.recording-status {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.recorder-controls {
  display: flex;
  gap: $spacing-md;
}

.recorder-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}

.timer-bar {
  position: relative;
  padding: $spacing-md;
  background-color: $bg-secondary;
  overflow: hidden;
}

.timer-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba($primary, 0.1);
  transition: width 1s linear;
}

.timer-text {
  position: relative;
  display: block;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-secondary;
}

@media (max-width: 768px) {
  .session-container {
    border-radius: 0;
  }

  .question-section,
  .answer-section {
    padding: $spacing-lg;
  }

  .answer-header {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
  }
}
</style>
