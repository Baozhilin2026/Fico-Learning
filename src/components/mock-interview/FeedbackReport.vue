<template>
  <div class="feedback-report">
    <div class="report-container">
      <div class="report-header">
        <div class="score-display">
          <div class="score-circle" :class="getScoreClass(feedback.overallScore)">
            <span class="score-value">{{ feedback.overallScore }}</span>
            <span class="score-label">总分</span>
          </div>
        </div>

        <div class="header-info">
          <h2>{{ t('mockInterview.feedbackReport') }}</h2>
          <p class="report-date">{{ reportDate }}</p>
        </div>

        <div class="header-actions">
          <el-button
            :icon="RefreshLeft"
            @click="$emit('restart')"
          >
            {{ t('mockInterview.restart') }}
          </el-button>

          <el-button
            :icon="Download"
            @click="exportPDF"
          >
            {{ t('mockInterview.exportPDF') }}
          </el-button>
        </div>
      </div>

      <div class="report-content">
        <!-- Special Notice for All Skipped -->
        <div v-if="allQuestionsSkipped" class="special-notice all-skipped-notice">
          <el-icon class="notice-icon"><InfoFilled /></el-icon>
          <div class="notice-content">
            <h4>本次面试所有题目均已跳过</h4>
            <p>面试准备需要时间和勇气，开始学习就是进步的第一步。建议您：</p>
            <ul>
              <li>先从词汇模块开始，积累FICO专业术语</li>
              <li>参考下方的面试题参考答案，学习标准回答思路</li>
              <li>练习后再来尝试，每次进步都是成长</li>
            </ul>
            <p class="encouragement">继续加油，相信您一定能够掌握这些知识！</p>
          </div>
        </div>

        <!-- Special Notice for Partially Answered -->
        <div v-else-if="someQuestionsSkipped" class="special-notice partially-answered-notice">
          <el-icon class="notice-icon"><InfoFilled /></el-icon>
          <div class="notice-content">
            <h4>部分题目已跳过</h4>
            <p>您已经尝试回答了部分问题，这是很好的开始。对于跳过的题目，请参考下方的标准答案进行学习。</p>
          </div>
        </div>

        <!-- AI Insights Section -->
        <div v-if="feedback.aiInsights" class="ai-insights-section">
          <h3>AI 综合评估</h3>

          <div class="insight-card">
            <h4>
              <el-icon><ChatDotRound /></el-icon>
              总体评价
            </h4>
            <p class="insight-text">{{ feedback.aiInsights.overallAssessment }}</p>
          </div>

          <div v-if="feedback.aiInsights.careerRecommendations.length > 0" class="insight-card">
            <h4>
              <el-icon><TrendCharts /></el-icon>
              职业发展建议
            </h4>
            <ul class="insight-list">
              <li v-for="(item, index) in feedback.aiInsights.careerRecommendations" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="feedback.aiInsights.skillGaps.length > 0" class="insight-card">
            <h4>
              <el-icon><Warning /></el-icon>
              能力提升方向
            </h4>
            <ul class="insight-list">
              <li v-for="(item, index) in feedback.aiInsights.skillGaps" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Dimension Scores -->
        <div class="dimensions-grid">
          <div
            v-for="dimension in dimensions"
            :key="dimension.key"
            class="dimension-card"
          >
            <div class="dimension-header">
              <h3>{{ dimension.label }}</h3>
              <el-tag :type="getScoreType(dimension.score)">
                {{ dimension.score }}分
              </el-tag>
            </div>

            <el-progress
              :percentage="dimension.score"
              :color="getProgressColor(dimension.score)"
              :stroke-width="8"
            />

            <div class="dimension-content">
              <div v-if="dimension.data.strengths.length > 0" class="feedback-section strengths">
                <h4>
                  <el-icon><Check /></el-icon>
                  {{ t('mockInterview.strengths') }}
                </h4>
                <ul>
                  <li v-for="(item, index) in dimension.data.strengths" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="dimension.data.weaknesses.length > 0" class="feedback-section weaknesses">
                <h4>
                  <el-icon><Close /></el-icon>
                  {{ t('mockInterview.weaknesses') }}
                </h4>
                <ul>
                  <li v-for="(item, index) in dimension.data.weaknesses" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="dimension.data.suggestions.length > 0" class="feedback-section suggestions">
                <h4>
                  <el-icon><Reading /></el-icon>
                  {{ t('mockInterview.suggestions') }}
                </h4>
                <ul>
                  <li v-for="(item, index) in dimension.data.suggestions" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <!-- Additional fields for FICO Professionalism -->
              <template v-if="dimension.key === 'ficoProfessionalism'">
                <div v-if="dimension.data.technicalAccuracy?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><Check /></el-icon>
                    技术准确性
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.technicalAccuracy" :key="`tech-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div v-if="dimension.data.industryContext?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><TrendCharts /></el-icon>
                    行业理解
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.industryContext" :key="`industry-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div v-if="dimension.data.keywordUsage?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><Reading /></el-icon>
                    关键词使用
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.keywordUsage" :key="`keyword-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <!-- Additional fields for Interview Skills -->
              <template v-if="dimension.key === 'interviewSkills'">
                <div v-if="dimension.data.clarity?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><Check /></el-icon>
                    清晰度
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.clarity" :key="`clarity-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div v-if="dimension.data.structure?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><TrendCharts /></el-icon>
                    结构性
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.structure" :key="`structure-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div v-if="dimension.data.completeness?.length > 0" class="feedback-section">
                  <h4>
                    <el-icon><Reading /></el-icon>
                    完整性
                  </h4>
                  <ul>
                    <li v-for="(item, index) in dimension.data.completeness" :key="`complete-${index}`">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Answer Details -->
        <div class="answers-section">
          <h3>回答详情</h3>

          <div class="answers-list">
            <div
              v-for="(answer, index) in answers"
              :key="index"
              class="answer-item"
            >
              <div class="answer-header">
                <span class="question-number">问题 {{ index + 1 }}</span>
                <el-button
                  :icon="VideoPlay"
                  size="small"
                  text
                  @click="playQuestion(answer.question)"
                >
                  播放问题
                </el-button>
              </div>

              <div class="answer-content">
                <p class="question">{{ answer.question }}</p>

                <div v-if="answer.audioBlob" class="audio-answer">
                  <el-tag type="info">语音回答</el-tag>
                  <audio
                    :src="getAudioUrl(answer.audioBlob)"
                    controls
                    class="audio-player"
                  />
                </div>

                <div v-else class="text-answer">
                  <el-tag type="info">文字回答</el-tag>
                  <p>{{ answer.answer }}</p>
                </div>

                <!-- AI 参考答案 -->
                <div v-if="getAIReferenceAnswer(answer.question)" class="reference-answer-box">
                  <div class="reference-answer-header">
                    <el-icon><Reading /></el-icon>
                    <span>参考答案</span>
                  </div>
                  <div class="reference-answer-content">
                    <div class="english-answer">
                      <span class="answer-label">英文：</span>
                      <p>{{ getAIReferenceAnswer(answer.question)?.englishAnswer }}</p>
                    </div>
                    <div class="chinese-answer">
                      <span class="answer-label">中文：</span>
                      <p>{{ getAIReferenceAnswer(answer.question)?.chineseAnswer }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { RefreshLeft, Download, VideoPlay, Check, Close, Reading, ChatDotRound, TrendCharts, Warning, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTTS } from '@/composables/useTTS'
import { useI18n } from '@/composables/useI18n'
import type { InterviewFeedback, InterviewAnswer } from '@/types'

interface Props {
  feedback: InterviewFeedback
  answers: InterviewAnswer[]
  jobLevel?: string
  industry?: string
}

interface Emits {
  (e: 'restart'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const { speak } = useTTS()

const audioUrls = ref<Map<Blob, string>>(new Map())

const reportDate = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const dimensions = computed(() => [
  {
    key: 'englishExpression',
    label: t('mockInterview.englishExpression'),
    score: props.feedback.englishExpression.score,
    data: props.feedback.englishExpression
  },
  {
    key: 'ficoProfessionalism',
    label: t('mockInterview.ficoProfessionalism'),
    score: props.feedback.ficoProfessionalism.score,
    data: props.feedback.ficoProfessionalism
  },
  {
    key: 'interviewSkills',
    label: t('mockInterview.interviewSkills'),
    score: props.feedback.interviewSkills.score,
    data: props.feedback.interviewSkills
  }
])

// Check if all questions were skipped
const allQuestionsSkipped = computed(() => {
  if (!props.answers || props.answers.length === 0) return false
  return props.answers.every(a =>
    !a.answer.trim() ||
    a.answer === '[跳过]' ||
    a.answer === '[Skipped]'
  )
})

// Check if some questions were skipped
const someQuestionsSkipped = computed(() => {
  if (!props.answers || props.answers.length === 0) return false
  const skippedCount = props.answers.filter(a =>
    !a.answer.trim() ||
    a.answer === '[跳过]' ||
    a.answer === '[Skipped]'
  ).length
  return skippedCount > 0 && skippedCount < props.answers.length
})

function getScoreClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'needs-improvement'
}

function getScoreType(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

function getProgressColor(score: number): string {
  if (score >= 80) return '#4CAF50'
  if (score >= 60) return '#FF9800'
  return '#F44336'
}

function getReferenceAnswer(question: string): string | undefined {
  // Legacy function - keeping for backward compatibility
  return undefined
}

function getAIReferenceAnswer(question: string): { englishAnswer: string; chineseAnswer: string } | undefined {
  if (!props.feedback.referenceAnswers) return undefined

  // Try exact match first
  let match = props.feedback.referenceAnswers.find(ref => ref.question === question)
  if (match) return match

  // Try matching by question text similarity (remove extra spaces, convert to lowercase)
  const normalizedQuestion = question.trim().toLowerCase().replace(/\s+/g, ' ')
  match = props.feedback.referenceAnswers.find(ref => {
    const normalizedRef = ref.question.trim().toLowerCase().replace(/\s+/g, ' ')
    return normalizedRef === normalizedQuestion
  })
  if (match) return match

  // Try matching by including the first 40 characters
  const questionPrefix = question.substring(0, 40).trim().toLowerCase()
  match = props.feedback.referenceAnswers.find(ref =>
    ref.question.toLowerCase().includes(questionPrefix)
  )
  if (match) return match

  // Fallback: try matching by checking if either contains the other's significant portion
  match = props.feedback.referenceAnswers.find(ref => {
    const refPrefix = ref.question.substring(0, 40).trim().toLowerCase()
    return question.toLowerCase().includes(refPrefix) || ref.question.toLowerCase().includes(questionPrefix)
  })

  return match
}

function getAudioUrl(blob: Blob): string {
  if (!audioUrls.value.has(blob)) {
    const url = URL.createObjectURL(blob)
    audioUrls.value.set(blob, url)
  }
  return audioUrls.value.get(blob)!
}

async function playQuestion(question: string) {
  await speak(question)
}

async function exportPDF() {
  try {
    ElMessage.info('正在生成 PDF，请稍候...')

    // Dynamic imports to avoid loading these libraries until needed
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ])

    // Get the report container
    const element = document.querySelector('.report-container') as HTMLElement
    if (!element) {
      ElMessage.error('找不到报告内容')
      return
    }

    // PDF configuration
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const margin = 10 // Margin in mm
    const contentWidth = pageWidth - (2 * margin)
    const contentHeight = pageHeight - (2 * margin)

    // Create canvas from the entire element with higher scale
    const scale = 3
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true
    })

    const totalHeight = canvas.height
    const totalWidth = canvas.width

    // Calculate how many pages we need
    const pixelsPerMM = totalWidth / contentWidth
    const availablePixelsPerPage = Math.floor(contentHeight * pixelsPerMM)

    let currentPosition = 0
    let pageNumber = 1

    while (currentPosition < totalHeight) {
      if (pageNumber > 1) {
        pdf.addPage()
      }

      // Calculate how much to take from the canvas
      const remainingHeight = totalHeight - currentPosition
      const heightToTake = Math.min(availablePixelsPerPage, remainingHeight)

      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = totalWidth
      pageCanvas.height = heightToTake

      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

        // Draw the portion of the original canvas
        ctx.drawImage(
          canvas,
          0, currentPosition, totalWidth, heightToTake, // Source
          0, 0, totalWidth, heightToTake // Destination
        )
      }

      // Convert to image and add to PDF
      const pageImageData = pageCanvas.toDataURL('image/png', 1.0)
      const pageHeightInMM = (heightToTake * contentWidth) / totalWidth

      pdf.addImage(pageImageData, 'PNG', margin, margin, contentWidth, pageHeightInMM)

      // Move to next position
      currentPosition += heightToTake
      pageNumber++
    }

    // Generate filename
    const jobLevelText = props.jobLevel || '未指定'
    const industryText = props.industry || '未指定'
    const date = new Date().toISOString().slice(0, 10)
    const fileName = `FICO面试报告_${jobLevelText}_${industryText}_${date}.pdf`

    // Save PDF
    pdf.save(fileName)

    ElMessage.success('PDF 导出成功！')
  } catch (error) {
    console.error('PDF export failed:', error)
    ElMessage.error('PDF 导出失败，请稍后重试')
  }
}

// Cleanup
onUnmounted(() => {
  audioUrls.value.forEach(url => URL.revokeObjectURL(url))
})
</script>

<style scoped lang="scss">
.feedback-report {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  background-color: $bg-secondary;
}

.report-container {
  max-width: 1200px;
  width: 100%;
  background-color: $bg-primary;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.report-header {
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  padding: $spacing-xl;
  border-bottom: 1px solid $border-color;
  background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.1) 100%);
}

.score-display {
  flex-shrink: 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: $shadow-md;

  &.excellent {
    border: 4px solid $success;
  }

  &.good {
    border: 4px solid $warning;
  }

  &.needs-improvement {
    border: 4px solid $error;
  }
}

.score-value {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.score-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.header-info {
  flex: 1;

  h2 {
    margin: 0 0 $spacing-xs 0;
    color: $primary;
  }

  .report-date {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.header-actions {
  display: flex;
  gap: $spacing-md;
}

.report-content {
  padding: $spacing-xl;
}

.special-notice {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-xl;

  .notice-icon {
    flex-shrink: 0;
    font-size: $font-size-2xl;
    margin-top: $spacing-xs;
  }

  .notice-content {
    flex: 1;

    h4 {
      margin: 0 0 $spacing-sm 0;
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
    }

    p {
      margin: $spacing-sm 0;
      font-size: $font-size-sm;
      line-height: 1.6;
    }

    ul {
      margin: $spacing-sm 0;
      padding-left: $spacing-lg;

      li {
        font-size: $font-size-sm;
        line-height: 1.6;
        margin-bottom: $spacing-xs;
      }
    }

    .encouragement {
      margin-top: $spacing-md;
      font-weight: $font-weight-medium;
      color: $primary;
    }
  }
}

.all-skipped-notice {
  background: linear-gradient(135deg, rgba($info, 0.1) 0%, rgba($primary, 0.08) 100%);
  border: 2px solid rgba($info, 0.3);
  border-left: 4px solid $info;

  .notice-icon {
    color: $info;
  }

  .notice-content {
    h4 {
      color: $info;
    }
  }
}

.partially-answered-notice {
  background: linear-gradient(135deg, rgba($warning, 0.08) 0%, rgba($primary, 0.05) 100%);
  border: 1px solid rgba($warning, 0.2);
  border-left: 4px solid $warning;

  .notice-icon {
    color: $warning;
  }

  .notice-content {
    h4 {
      color: $warning;
    }
  }
}

.ai-insights-section {
  margin-bottom: $spacing-2xl;
  padding: $spacing-xl;
  background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($accent, 0.05) 100%);
  border-radius: $border-radius-lg;
  border-left: 4px solid $primary;

  h3 {
    margin: 0 0 $spacing-lg 0;
    font-size: $font-size-xl;
    color: $primary;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.insight-card {
  background-color: white;
  border-radius: $border-radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin: 0 0 $spacing-sm 0;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .insight-text {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }

  .insight-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: $font-size-sm;
      padding: $spacing-xs $spacing-sm;
      margin-bottom: $spacing-xs;
      background-color: $bg-secondary;
      border-radius: $border-radius-sm;
      color: $text-secondary;

      &:before {
        content: '•';
        margin-right: $spacing-xs;
        color: $primary;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-2xl;
}

.dimension-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.dimension-content {
  margin-top: $spacing-lg;
}

.feedback-section {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }

  &.strengths {
    h4 {
      color: $success;
    }
  }

  &.weaknesses {
    h4 {
      color: $error;
    }
  }

  &.suggestions {
    h4 {
      color: $primary;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: $font-size-sm;
      padding: $spacing-xs $spacing-sm;
      background-color: white;
      border-radius: $border-radius-sm;
      margin-bottom: $spacing-xs;

      &:before {
        content: '•';
        margin-right: $spacing-xs;
      }
    }
  }
}

.answers-section {
  h3 {
    margin-bottom: $spacing-lg;
    color: $primary;
  }
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.answer-item {
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.question-number {
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.answer-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.question {
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: $font-weight-medium;
  margin: 0;
}

.audio-answer,
.text-answer {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-md;
  background-color: white;
  border-radius: $border-radius-md;
}

.audio-player {
  width: 100%;
  height: 32px;
}

.reference-collapse {
  border-top: 1px solid $divider;
  margin-top: $spacing-sm;

  :deep(.el-collapse-item__header) {
    border-bottom: none;
    font-size: $font-size-sm;
    height: 40px;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }
}

.reference-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $accent;
}

.reference-answer {
  font-size: $font-size-sm;
  color: $text-primary;
  line-height: 1.6;
  margin: 0;
  padding: $spacing-sm;
}

.reference-answer-box {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: linear-gradient(135deg, rgba($accent, 0.08) 0%, rgba($primary, 0.05) 100%);
  border-radius: $border-radius-md;
  border-left: 4px solid $accent;
}

.reference-answer-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  font-size: $font-size-sm;
}

.reference-answer-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding: $spacing-sm;

  .english-answer,
  .chinese-answer {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .answer-label {
    font-weight: $font-weight-medium;
    color: $text-secondary;
    font-size: $font-size-xs;
  }

  p {
    margin: 0;
    line-height: 1.6;
    color: $text-primary;
    font-size: $font-size-sm;
  }
}

@media (max-width: 768px) {
  .report-header {
    flex-direction: column;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .dimensions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
