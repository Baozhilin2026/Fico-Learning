<template>
  <div class="interview-page">
    <TopNavbar />

    <!-- Top Bar with Scenario Select and TTS Settings -->
    <div class="top-bar">
      <!-- Scenario Selection - Left Side -->
      <div class="scenario-section">
        <span class="scenario-label">选择场景 / Select Scenario:</span>
        <el-select
          v-model="selectedScenarios"
          placeholder="全部 / All"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="handleScenarioChange"
          class="scenario-select"
        >
          <el-option
            v-for="part in parts"
            :key="part.partId"
            :label="part.partName"
            :value="part.partId"
          />
        </el-select>
      </div>

      <!-- TTS Settings - Right Side -->
      <div class="tts-settings">
        <div class="tts-row">
          <span class="tts-label">口音 / Accent:</span>
          <el-radio-group v-model="currentAccent" @change="handleAccentChange" size="small">
            <el-radio-button value="indian">印度</el-radio-button>
            <el-radio-button value="singapore">新加坡</el-radio-button>
            <el-radio-button value="western">欧美</el-radio-button>
          </el-radio-group>
        </div>
        <div class="tts-row">
          <span class="tts-label">性别 / Gender:</span>
          <el-radio-group v-model="currentGender" @change="handleGenderChange" size="small">
            <el-radio-button value="male">男</el-radio-button>
            <el-radio-button value="female">女</el-radio-button>
          </el-radio-group>
        </div>
        <div class="tts-row">
          <span class="tts-label">语速 / Speed:</span>
          <el-radio-group v-model="currentRate" @change="handleRateChange" size="small">
            <el-radio-button :value="0.8">慢</el-radio-button>
            <el-radio-button :value="1.0">中</el-radio-button>
            <el-radio-button :value="1.2">快</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="main-content">

        <div v-if="!interviewData" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else class="questions-list">
          <QuestionCard
            v-for="item in currentPageData"
            :key="item.question.questionNo"
            :question="item.question"
            :part="item.part"
            :part-name="item.partName"
            :is-bookmarked="isBookmarked(item)"
            @bookmark="handleBookmark"
          />
        </div>

        <el-pagination
          v-if="totalPages > 1"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
          :page-size="pageSize"
          :total="filteredQuestions.length"
          class="pagination"
          style="position: relative; z-index: 100; display: flex !important; visibility: visible !important;"
        />
      </div>
    </div>

    <BottomInfoBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useSettingsStore } from '@/stores/settings'
import { useStudyTimer } from '@/composables/useStudyTimer'
import { dataLoader } from '@/services/dataLoader'
import type { InterviewQAData, TTSAccent, TTSGender } from '@/types'
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'
import QuestionCard from '@/components/interview/QuestionCard.vue'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const settingsStore = useSettingsStore()
useStudyTimer()

const searchKeyword = ref('')
const selectedScenarios = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const interviewData = ref<InterviewQAData | null>(null)
const allQuestions = ref<any[]>([])

const currentAccent = ref<TTSAccent>(settingsStore.ttsAccent)
const currentGender = ref<TTSGender>(settingsStore.ttsGender)
const currentRate = ref(settingsStore.ttsRate)

const parts = computed(() => {
  return interviewData.value?.parts || []
})

const filteredQuestions = computed(() => {
  let questions = allQuestions.value

  if (selectedScenarios.value.length > 0) {
    questions = questions.filter(q => selectedScenarios.value.includes(q.part))
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    questions = questions.filter(q =>
      q.question.questionContent.toLowerCase().includes(keyword) ||
      q.question.sampleAnswer.toLowerCase().includes(keyword) ||
      (q.question.questionContentCN && q.question.questionContentCN.includes(keyword)) ||
      (q.question.sampleAnswerCN && q.question.sampleAnswerCN.includes(keyword))
    )
  }

  return questions
})

const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = Math.min(currentPage.value * pageSize.value, filteredQuestions.value.length)
  return filteredQuestions.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  const pages = Math.ceil(filteredQuestions.value.length / pageSize.value)
  console.log('[InterviewContent] Computed:', {
    filteredQuestionsLength: filteredQuestions.value.length,
    pageSize: pageSize.value,
    totalPages: pages
  })
  return pages
})

function handlePageChange(page: number) {
  console.log('[InterviewContent] Page changed to:', page)
  currentPage.value = page
  const startIndex = (page - 1) * pageSize.value
  const endIndex = Math.min(page * pageSize.value, filteredQuestions.value.length)
  console.log('[InterviewContent] Showing items', startIndex, 'to', endIndex, 'of', filteredQuestions.value.length)
}

function isBookmarked(item: any): boolean {
  return bookmarkStore.isBookmarked('interview', item.question.questionNo)
}

function handleBookmark(item: any) {
  const id = item.question.questionNo
  if (bookmarkStore.isBookmarked('interview', id)) {
    bookmarkStore.removeBookmark('interview', id)
  } else {
    bookmarkStore.addBookmark('interview', id, item)
  }
}

function handleScenarioChange() {
  currentPage.value = 1
}

function handleAccentChange(value: TTSAccent) {
  settingsStore.setTTSAccent(value)
}

function handleGenderChange(value: TTSGender) {
  settingsStore.setTTSGender(value)
}

function handleRateChange(value: number) {
  settingsStore.setTTSRate(value)
}

onMounted(async () => {
  try {
    console.log('Loading interview data...')
    interviewData.value = await dataLoader.loadInterviewQA()
    console.log('Interview data loaded:', interviewData.value)
    console.log('Parts:', interviewData.value?.parts)

    if (interviewData.value?.parts) {
      interviewData.value.parts.forEach(part => {
        console.log('Processing part:', part.partId, part.partName)
        part.questions.forEach(question => {
          allQuestions.value.push({
            part: part.partId,
            partName: part.partName,
            question
          })
        })
      })
      console.log('Total questions loaded:', allQuestions.value.length)
      console.log('Filtered questions length:', filteredQuestions.value.length)
      console.log('Total pages:', totalPages.value)
    }
  } catch (error) {
    console.error('Failed to load interview data:', error)
  }
})
</script>

<style scoped lang="scss">
.interview-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  margin-top: calc($navbar-height + 50px);
  margin-bottom: $bottombar-height;
}

.main-content {
  max-width: $max-content-width;
  margin: 0 auto;
  width: 100%;
  padding: $spacing-xl;
  font-size: 14px;
}

.top-bar {
  position: fixed;
  top: $navbar-height;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #e8f4fd;
  border-bottom: 1px solid #b3e5fc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-lg;

  .scenario-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .scenario-label {
      font-size: 13px;
      font-weight: $font-weight-semibold;
      color: $primary;
      white-space: nowrap;
    }

    .scenario-select {
      width: 300px;
    }
  }

  .tts-settings {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    align-items: flex-start;

    .tts-row {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .tts-label {
        font-size: 12px;
        font-weight: $font-weight-semibold;
        color: $primary;
        white-space: nowrap;
      }
    }

    :deep(.el-radio-button__inner) {
      font-size: 12px;
      padding: 4px 8px;
    }
  }
}

.questions-list {
  display: grid;
  gap: $spacing-md;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: $spacing-md;

  p {
    color: $text-secondary;
  }
}

@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    gap: $spacing-md;
    align-items: stretch;
    height: auto;
  }

  .scenario-section {
    justify-content: flex-start;
  }

  .scenario-select {
    width: 100% !important;
  }

  .tts-settings {
    align-items: flex-start;
  }

  .tts-row {
    width: 100%;
  }
}
</style>
