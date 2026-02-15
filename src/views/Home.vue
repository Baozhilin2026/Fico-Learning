<template>
  <div class="home-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>{{ t('home.welcome') }}</h1>
          <p>{{ t('auth.description') }}</p>
        </div>
        <div class="header-right">
          <div class="study-time-badge">
            <el-icon><Clock /></el-icon>
            <div class="time-info">
              <span class="time-value">{{ studyTime }}</span>
              <span class="time-label">{{ t('home.todayStudyTime') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modules Grid -->
      <div class="modules-section">
        <div class="modules-grid">
          <div
            v-for="module in modules"
            :key="module.id"
            class="module-card"
            @click="navigateTo(module.path)"
          >
            <div class="module-icon" :style="{ backgroundColor: module.color }">
              <el-icon :size="36">
                <component :is="module.icon" />
              </el-icon>
            </div>
            <h3 class="module-title">{{ module.title }}</h3>
            <p class="module-description">{{ module.description }}</p>
            <div class="module-action">
              <el-button type="primary" link>
                {{ t('home.startLearning') }}
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Records -->
      <div v-if="recentRecords.length > 0" class="recent-section">
        <div class="section-header">
          <h2>{{ t('home.recentRecords') }}</h2>
        </div>

        <div class="records-list">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="record-item"
          >
            <div class="record-icon">
              <el-icon><component :is="record.icon" /></el-icon>
            </div>
            <div class="record-content">
              <div class="record-title">{{ record.title }}</div>
              <div class="record-time">{{ record.time }}</div>
            </div>
            <div class="record-score" v-if="record.score">
              <el-tag :type="record.score >= 80 ? 'success' : 'warning'">
                {{ record.score }}%
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomInfoBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Reading,
  ChatDotSquare,
  QuestionFilled,
  VideoCamera,
  Star,
  ArrowRight,
  Clock,
  DataAnalysis
} from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import { useProgressStore } from '@/stores/progress'
import { useStudyTimer } from '@/composables/useStudyTimer'
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'

const router = useRouter()
const { t } = useI18n()
const progressStore = useProgressStore()
const { getCurrentStudyTime, formatTime } = useStudyTimer()

interface ModuleItem {
  id: string
  title: string
  description: string
  path: string
  icon: any
  color: string
}

interface RecordItem {
  id: string
  title: string
  time: string
  score?: number
  icon: any
}

const studyTime = ref('0分钟')

const modules = ref<ModuleItem[]>([
  {
    id: 'vocabulary',
    title: t('nav.vocabulary'),
    description: '学习FICO相关英文术语和短语，支持听力默写和认读练习',
    path: '/vocabulary',
    icon: Reading,
    color: '#2196F3'
  },
  {
    id: 'communication',
    title: t('nav.communication'),
    description: '掌握项目沟通中的常用英文语句，支持多口音朗读',
    path: '/communication',
    icon: ChatDotSquare,
    color: '#FF9800'
  },
  {
    id: 'interview',
    title: t('nav.interview'),
    description: '熟悉FICO面试常见问题和参考答案',
    path: '/interview',
    icon: QuestionFilled,
    color: '#4CAF50'
  },
  {
    id: 'mockInterview',
    title: t('nav.mockInterview'),
    description: 'AI模拟真实面试场景，提供专业点评反馈',
    path: '/mock-interview',
    icon: VideoCamera,
    color: '#9C27B0'
  },
  {
    id: 'bookmarks',
    title: t('nav.bookmarks'),
    description: '查看收藏的词条、语句和面试内容',
    path: '/bookmarks',
    icon: Star,
    color: '#F44336'
  }
])

const recentRecords = ref<RecordItem[]>([])
let studyTimeUpdateInterval: number | null = null

onMounted(() => {
  loadProgress()
  loadRecentRecords()

  // Update study time display every 5 seconds
  studyTimeUpdateInterval = window.setInterval(() => {
    updateStudyTime()
  }, 5000)
})

// Also refresh records when component is activated (navigation back to home)
onActivated(() => {
  loadRecentRecords()
})

// Clean up interval on unmount
onBeforeUnmount(() => {
  if (studyTimeUpdateInterval !== null) {
    clearInterval(studyTimeUpdateInterval)
    studyTimeUpdateInterval = null
  }
})

function updateStudyTime() {
  const currentMinutes = getCurrentStudyTime()
  studyTime.value = `${currentMinutes}分钟`
}

function loadProgress() {
  const progress = progressStore.getProgress()
  studyTime.value = `${progress.todayStudyTime}分钟`
}

function loadRecentRecords() {
  const records = progressStore.getRecentRecords()
  recentRecords.value = records.slice(0, 5).map(r => ({
    id: r.id,
    title: r.title,
    time: new Date(r.timestamp).toLocaleString('zh-CN'),
    score: r.score,
    icon: getIconForType(r.type)
  }))
}

function getIconForType(type: string) {
  switch (type) {
    case 'vocabulary': return Reading
    case 'communication': return ChatDotSquare
    case 'interview': return QuestionFilled
    case 'mockInterview': return VideoCamera
    default: return DataAnalysis
  }
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-secondary;
}

.page-container {
  flex: 1;
  max-width: $max-content-width;
  width: 100%;
  margin: 0 auto;
  padding: $spacing-xl;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 120px;
  gap: $spacing-xl;
}

.header-left {
  flex: 1;

  h1 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $primary;
    margin: 0 0 $spacing-sm 0;
  }

  p {
    font-size: $font-size-base;
    color: $text-secondary;
    margin: 0;
  }
}

.header-right {
  flex-shrink: 0;
}

.study-time-badge {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background-color: $bg-primary;
  padding: $spacing-md $spacing-lg;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  border: 1px solid rgba($primary, 0.1);

  .el-icon {
    font-size: $font-size-2xl;
    color: $primary;
  }

  .time-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .time-value {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $primary;
      line-height: 1;
    }

    .time-label {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-top: $spacing-xs;
    }
  }
}

.modules-section {
  margin-bottom: $spacing-2xl;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-lg;
}

.module-card {
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;
  cursor: pointer;
  transition: all $transition-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-4px);
  }
}

.module-icon {
  width: 64px;
  height: 64px;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: $spacing-md;
}

.module-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
}

.module-description {
  font-size: $font-size-xs;
  color: $text-secondary;
  line-height: 1.4;
  margin: 0 0 $spacing-md 0;
  flex: 1;
}

.module-action {
  margin-top: auto;
}

.recent-section {
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  h2 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.record-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  background-color: $bg-secondary;
  transition: background-color $transition-fast;

  &:hover {
    background-color: $bg-tertiary;
  }
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  background-color: rgba($primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  flex-shrink: 0;
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-time {
  font-size: $font-size-xs;
  color: $text-disabled;
  margin-top: $spacing-xs;
}

.record-score {
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .modules-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: $spacing-md;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
  }

  .header-left {
    text-align: center;

    h1 {
      font-size: $font-size-2xl;
    }
  }

  .header-right {
    display: flex;
    justify-content: center;
  }

  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .module-card {
    padding: $spacing-lg;
  }

  .module-icon {
    width: 48px;
    height: 48px;

    .el-icon {
      font-size: 24px;
    }
  }

  .module-title {
    font-size: $font-size-sm;
  }

  .module-description {
    font-size: $font-size-xs;
  }
}

@media (max-width: 480px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
