<template>
  <div class="mock-interview-page">
    <TopNavbar />

    <div class="page-content">
      <!-- Loading/Generating Phase -->
      <div v-if="phase === 'generating'" class="generating-container">
        <el-icon class="is-loading" :size="60">
          <Loading />
        </el-icon>
        <h3>正在生成面试题...</h3>
        <p>根据您选择的 {{ jobLevelDisplay }} 和 {{ industryDisplay }} 岗位要求定制</p>
        <el-progress
          :percentage="generatingProgress"
          :stroke-width="10"
          class="progress-bar"
        />
      </div>

      <!-- Setup Phase -->
      <InterviewSetup
        v-else-if="phase === 'setup'"
        @start="handleStartInterview"
        @cancel="handleCancel"
      />

      <!-- Session Phase -->
      <InterviewSession
        v-else-if="phase === 'session'"
        :questions="currentQuestions"
        :settings="interviewSettings"
        @complete="handleInterviewComplete"
        @cancel="handleCancel"
      />

      <!-- Feedback Phase -->
      <FeedbackReport
        v-else-if="phase === 'feedback'"
        :feedback="feedback"
        :answers="answers"
        :job-level="interviewSettings.jobLevel"
        :industry="interviewSettings.industry"
        @restart="handleRestart"
      />
    </div>

    <BottomInfoBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'
import InterviewSetup from '@/components/mock-interview/InterviewSetup.vue'
import InterviewSession from '@/components/mock-interview/InterviewSession.vue'
import FeedbackReport from '@/components/mock-interview/FeedbackReport.vue'
import { aiFeedbackService } from '@/services/aiFeedbackService'
import { aiQuestionGenerator } from '@/services/aiQuestionGenerator'
import { dataLoader } from '@/services/dataLoader'
import { juniorInterviewService } from '@/services/juniorInterviewService'
import { middleInterviewService } from '@/services/middleInterviewService'
import { seniorInterviewService } from '@/services/seniorInterviewService'
import type { InterviewQuestion, EvaluationResult } from '@/services/juniorInterviewService'
import type { InterviewQuestion as MiddleInterviewQuestion } from '@/services/middleInterviewService'
import type { InterviewQuestion as SeniorInterviewQuestion } from '@/services/seniorInterviewService'
import { useStudyTimer } from '@/composables/useStudyTimer'
import { useTTS } from '@/composables/useTTS'
import { useProgressStore } from '@/stores/progress'
import type { InterviewFeedback, InterviewAnswer, FICOJobLevel, FICOIndustry } from '@/types'

const progressStore = useProgressStore()
const { initialize: initializeTTS } = useTTS()

// Auto-start study timer when on this page
useStudyTimer()

type Phase = 'setup' | 'generating' | 'session' | 'feedback'

// const router = useRouter()

const phase = ref<Phase>('setup')
const interviewSettings = ref<{
  jobLevel: FICOJobLevel
  industry: FICOIndustry
  timePerQuestion?: number
}>({
  jobLevel: 'junior',
  industry: 'manufacturing'
})

const currentQuestions = ref<Array<{
  englishQuestion: string
  chineseTranslation: string
}>>([])

const answers = ref<InterviewAnswer[]>([])
const feedback = ref<InterviewFeedback | AIInterviewFeedback | null>(null)
const referenceAnswers = ref<Map<string, { answer: string }>>(new Map())
const generatingProgress = ref(0)

const jobLevelDisplay = computed(() => {
  const config = {
    junior: '初级顾问',
    middle: '中级顾问',
    senior: '高级顾问'
  }
  return config[interviewSettings.value.jobLevel] || ''
})

const industryDisplay = computed(() => {
  const config = {
    manufacturing: '制造业',
    retail: '零售/电商',
    finance: '金融服务',
    energy: '能源与化工',
    pharma: '医药与生命科学',
    technology: '高科技与互联网',
    logistics: '物流与运输',
    public: '公共部门与教育',
    realestate: '房地产与建筑',
    other: '其他'
  }
  return config[interviewSettings.value.industry] || ''
})

async function handleStartInterview(settings: {
  jobLevel: FICOJobLevel
  industry: FICOIndustry
}) {
  interviewSettings.value = settings

  // Initialize TTS immediately on user interaction (required for Safari/iOS)
  try {
    await initializeTTS()
    console.log('[MockInterview] TTS initialized on user interaction')
  } catch (error) {
    console.warn('[MockInterview] TTS initialization failed:', error)
  }

  phase.value = 'generating'
  generatingProgress.value = 0

  try {
    // Load job level config to get questions per session
    const config = await dataLoader.loadConfig()
    const jobLevelConfig = (config as any).jobLevels?.[settings.jobLevel]

    // Store time per question in settings for InterviewSession to use
    const timePerQuestion = jobLevelConfig?.timePerQuestion || 180
    ;(interviewSettings.value as any).timePerQuestion = timePerQuestion

    // Progress update
    generatingProgress.value = 20

    // For junior level, use the junior interview service
    if (settings.jobLevel === 'junior') {
      console.log('[Mock Interview] Using Junior Interview Service for question generation')
      const juniorQuestions = await juniorInterviewService.generateQuestions()

      // Store the full questions for evaluation later
      ;(interviewSettings.value as any).juniorQuestions = juniorQuestions

      // Convert to the format expected by InterviewSession
      currentQuestions.value = juniorQuestions.map(q => ({
        englishQuestion: q.englishQuestion,
        chineseTranslation: q.chineseTranslation
      }))
    } else if (settings.jobLevel === 'middle') {
      // For middle level, use the middle interview service
      console.log('[Mock Interview] Using Middle Interview Service for question generation')
      const middleQuestions = await middleInterviewService.generateQuestions()

      // Store the full questions for evaluation later
      ;(interviewSettings.value as any).middleQuestions = middleQuestions

      // Convert to the format expected by InterviewSession
      currentQuestions.value = middleQuestions.map(q => ({
        englishQuestion: q.englishQuestion,
        chineseTranslation: q.chineseTranslation
      }))
    } else if (settings.jobLevel === 'senior') {
      // For senior level, use the senior interview service
      console.log('[Mock Interview] Using Senior Interview Service for question generation')
      const seniorQuestions = await seniorInterviewService.generateQuestions()

      // Store the full questions for evaluation later
      ;(interviewSettings.value as any).seniorQuestions = seniorQuestions

      // Convert to the format expected by InterviewSession
      currentQuestions.value = seniorQuestions.map(q => ({
        englishQuestion: q.englishQuestion,
        chineseTranslation: q.chineseTranslation
      }))
    } else {
      // Fallback: use AI generation for any other level
      const stages = config.interviewConfig.stages || ['项目经验', '技术问题', '真实场景问题', '反问环节']
      const totalQuestions = jobLevelConfig?.questionsPerSession || 5
      const questionsPerStage = Math.ceil(totalQuestions / stages.length)

      // Generate questions using AI
      const questions = await aiQuestionGenerator.generateQuestionsForAllStages(
        settings.jobLevel,
        settings.industry,
        questionsPerStage
      )

      // Limit questions to the job level's total questions
      const limitedQuestions = questions.slice(0, totalQuestions)

      // Convert to the format expected by InterviewSession
      currentQuestions.value = limitedQuestions.map(q => ({
        englishQuestion: q.englishQuestion,
        chineseTranslation: q.chineseTranslation
      }))
    }

    generatingProgress.value = 100

    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 300))

    phase.value = 'session'
  } catch (error) {
    console.error('Failed to generate interview questions:', error)
    ElMessage.error('生成面试题失败，请检查网络连接或稍后重试')
    phase.value = 'setup'
  }
}

async function loadInterviewQuestions(questionsPerStage: number) {
  try {
    const interviewData = await dataLoader.loadInterviewQuestions()
    const questions: Array<{
      englishQuestion: string
      chineseTranslation: string
    }> = []

    // Collect questions from each stage
    interviewData.interviewContents.forEach(stage => {
      const stageQuestions = stage.questions
        .slice(0, questionsPerStage)
        .map(q => ({
          englishQuestion: q.englishQuestion,
          chineseTranslation: q.chineseTranslation
        }))

      questions.push(...stageQuestions)

      // Store reference answers
      stage.questions.forEach(q => {
        if (q.englishAnswer) {
          referenceAnswers.value.set(q.englishQuestion, { answer: q.englishAnswer })
        }
      })
    })

    // Shuffle questions within each stage and limit
    currentQuestions.value = questions.slice(0, questionsPerStage * 5)
  } catch (error) {
    console.error('Failed to load interview questions:', error)
  }
}

async function handleInterviewComplete(completedAnswers: InterviewAnswer[]) {
  console.log('handleInterviewComplete called with answers:', completedAnswers)
  answers.value = completedAnswers

  try {
    // Generate feedback
    console.log('Setting phase to generating')
    phase.value = 'generating'
    generatingProgress.value = 20

    // For junior level, use AI evaluation with reference answers from MD
    if (interviewSettings.value.jobLevel === 'junior' && (interviewSettings.value as any).juniorQuestions) {
      console.log('[Mock Interview] Processing junior level interview')
      const juniorQuestions = (interviewSettings.value as any).juniorQuestions as InterviewQuestion[]
      console.log('[Mock Interview] juniorQuestions:', juniorQuestions.length, juniorQuestions)

      // Use AI evaluation with reference answers from MD
      console.log('[Mock Interview] Using AI evaluation with reference answers from MD')
      const referenceAnswers = juniorQuestions.map(q => ({
        question: q.englishQuestion,
        englishAnswer: q.englishAnswer,
        chineseAnswer: q.chineseAnswer
      }))

      feedback.value = await aiFeedbackService.evaluateSessionWithReferences(
        completedAnswers,
        interviewSettings.value.jobLevel,
        interviewSettings.value.industry,
        referenceAnswers
      )
    } else if (interviewSettings.value.jobLevel === 'middle' && (interviewSettings.value as any).middleQuestions) {
      // For middle level, use AI evaluation with reference answers from MD
      console.log('[Mock Interview] Processing middle level interview')
      const middleQuestions = (interviewSettings.value as any).middleQuestions as MiddleInterviewQuestion[]
      console.log('[Mock Interview] middleQuestions:', middleQuestions.length, middleQuestions)

      // Use AI evaluation with reference answers from MD
      console.log('[Mock Interview] Using AI evaluation with reference answers from MD')
      const referenceAnswers = middleQuestions.map(q => ({
        question: q.englishQuestion,
        englishAnswer: q.englishAnswer,
        chineseAnswer: q.chineseAnswer
      }))

      feedback.value = await aiFeedbackService.evaluateSessionWithReferences(
        completedAnswers,
        interviewSettings.value.jobLevel,
        interviewSettings.value.industry,
        referenceAnswers
      )
    } else if (interviewSettings.value.jobLevel === 'senior' && (interviewSettings.value as any).seniorQuestions) {
      // For senior level, use AI evaluation with reference answers from MD
      console.log('[Mock Interview] Processing senior level interview')
      const seniorQuestions = (interviewSettings.value as any).seniorQuestions as SeniorInterviewQuestion[]
      console.log('[Mock Interview] seniorQuestions:', seniorQuestions.length, seniorQuestions)

      // Use AI evaluation with reference answers from MD
      console.log('[Mock Interview] Using AI evaluation with reference answers from MD')
      const referenceAnswers = seniorQuestions.map(q => ({
        question: q.englishQuestion,
        englishAnswer: q.englishAnswer,
        chineseAnswer: q.chineseAnswer
      }))

      feedback.value = await aiFeedbackService.evaluateSessionWithReferences(
        completedAnswers,
        interviewSettings.value.jobLevel,
        interviewSettings.value.industry,
        referenceAnswers
      )
    } else {
      // Fallback: use AI feedback without reference answers
      console.log('Calling aiFeedbackService.evaluateSession...')
      feedback.value = await aiFeedbackService.evaluateSession(
        completedAnswers,
        interviewSettings.value.jobLevel,
        interviewSettings.value.industry
      )
    }

    console.log('Feedback received:', feedback.value)
    generatingProgress.value = 100

    // Add learning record after feedback is generated
    if (feedback.value && feedback.value.overallScore) {
      const answeredCount = completedAnswers.filter(a =>
        a.answer.trim() &&
        a.answer !== '[跳过]' &&
        a.answer !== '[Skipped]'
      ).length

      if (answeredCount > 0) {
        progressStore.addRecord({
          type: 'mockInterview',
          title: `模拟面试 - ${jobLevelDisplay.value} (${industryDisplay.value})`,
          score: feedback.value.overallScore
        })
      }
    }

    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 300))

    console.log('Setting phase to feedback')
    phase.value = 'feedback'
  } catch (error) {
    console.error('Failed to generate AI feedback:', error)
    // Still show feedback page even if AI evaluation fails
    feedback.value = {
      englishExpression: { score: 60, strengths: [], weaknesses: [], suggestions: [] },
      ficoProfessionalism: {
        score: 60,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        technicalAccuracy: [],
        industryContext: [],
        keywordUsage: []
      },
      interviewSkills: {
        score: 60,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        clarity: [],
        structure: [],
        completeness: []
      },
      overallScore: 60,
      aiInsights: { overallAssessment: '评估暂时不可用，请稍后重试。', careerRecommendations: [], skillGaps: [] },
      referenceAnswers: completedAnswers.map(a => ({ question: a.question, englishAnswer: '暂无参考答案', chineseAnswer: '暂无参考答案' }))
    }
    ElMessage.error('评估失败，请稍后重试')
    phase.value = 'feedback'
  }
}

function handleCancel() {
  phase.value = 'setup'
}

function handleRestart() {
  phase.value = 'setup'
  answers.value = []
  feedback.value = null
  currentQuestions.value = []
  generatingProgress.value = 0
}
</script>

<style scoped lang="scss">
.mock-interview-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  margin-top: $navbar-height;
  margin-bottom: $bottombar-height;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  padding: $spacing-2xl;
  text-align: center;

  h3 {
    margin: 0;
    font-size: $font-size-xl;
    color: $text-primary;
  }

  p {
    margin: 0;
    font-size: $font-size-base;
    color: $text-secondary;
  }

  .progress-bar {
    width: 300px;
    margin-top: $spacing-lg;
  }
}
</style>
