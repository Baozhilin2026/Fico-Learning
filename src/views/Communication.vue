<template>
  <div class="communication-page">
    <TopNavbar />

    <!-- Top Bar with Object Filter and TTS Settings -->
    <div class="top-bar">
      <!-- Object Filter - Left Side -->
      <div class="object-section">
        <span class="object-label">筛选沟通对象 / Filter Object:</span>
        <el-select
          v-model="selectedObject"
          placeholder="全部 / All"
          clearable
          @change="handleFilterChange"
          class="object-select"
        >
          <el-option label="全部" value="" />
          <el-option label="Key User" value="Key User" />
          <el-option label="CFO" value="财务总监" />
        </el-select>
      </div>

      <!-- TTS Settings - Right Side -->
      <div class="ts-settings">
        <div class="ts-row">
          <span class="ts-label">口音 / Accent:</span>
          <el-radio-group v-model="currentAccent" @change="handleAccentChange" size="small">
            <el-radio-button value="indian">印度</el-radio-button>
            <el-radio-button value="singapore">新加坡</el-radio-button>
            <el-radio-button value="western">欧美</el-radio-button>
          </el-radio-group>
        </div>
        <div class="ts-row">
          <span class="ts-label">性别 / Gender:</span>
          <el-radio-group v-model="currentGender" @change="handleGenderChange" size="small">
            <el-radio-button value="male">男</el-radio-button>
            <el-radio-button value="female">女</el-radio-button>
          </el-radio-group>
        </div>
        <div class="ts-row">
          <span class="ts-label">语速 / Speed:</span>
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

        <div v-if="!isDataLoaded" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else class="scripts-list">
          <ScriptCard
            v-for="script in currentPageData"
            :key="script.scenario.场景序号"
            :scenario="script.scenario"
            :object="script.object"
            :phase="script.phase"
            :is-bookmarked="isBookmarked(script)"
            @bookmark="handleBookmark"
          />
        </div>

        <el-pagination
          v-if="totalPages > 1"
          v-model:current-page="currentPage"
          @current-change="handlePageChange"
          :page-size="pageSize"
          :total="filteredScripts.length"
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
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'
import ScriptCard from '@/components/communication/ScriptCard.vue'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
const settingsStore = useSettingsStore()
useStudyTimer()

const searchKeyword = ref('')
const currentEngine = ref('google')
const currentAccent = ref(settingsStore.ttsAccent)
const currentGender = ref(settingsStore.ttsGender)
const currentRate = ref(settingsStore.ttsRate)
const selectedObject = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const allScripts = ref<any[]>([])
const isDataLoaded = ref(false)

const filteredScripts = computed(() => {
  let scripts = allScripts.value

  // Filter by object
  if (selectedObject.value) {
    scripts = scripts.filter(s => s.object === selectedObject.value)
  }

  // Filter by search keyword
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    scripts = scripts.filter(s =>
      s.scenario.英文话术.toLowerCase().includes(keyword) ||
      s.scenario.中文话术.includes(keyword) ||
      s.scenario.使用场景.includes(keyword)
    )
  }

  return scripts
})

const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = Math.min(currentPage.value * pageSize.value, filteredScripts.value.length)
  return filteredScripts.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredScripts.value.length / pageSize.value)
})

function handlePageChange(page: number) {
  console.log('[Communication] Page changed to:', page)
  currentPage.value = page
  const startIndex = (page - 1) * pageSize.value
  const endIndex = Math.min(page * pageSize.value, filteredScripts.value.length)
  console.log('[Communication] Showing items', startIndex, 'to', endIndex, 'of', filteredScripts.value.length)
}

function isBookmarked(script: any): boolean {
  return bookmarkStore.isBookmarked('communication', String(script.scenario.场景序号))
}

function handleBookmark(script: any) {
  const id = String(script.scenario.场景序号)
  if (bookmarkStore.isBookmarked('communication', id)) {
    bookmarkStore.removeBookmark('communication', id)
  } else {
    bookmarkStore.addBookmark('communication', id, script)
  }
}

function handleFilterChange() {
  currentPage.value = 1
}

function handleSearch() {
  currentPage.value = 1
}

function handleAccentChange(value: string) {
  settingsStore.setTTSAccent(value)
}

function handleGenderChange(value: string) {
  settingsStore.setTTSGender(value)
}

function handleRateChange(value: number) {
  settingsStore.setTTSRate(value)
}

onMounted(async () => {
  try {
    const communication = await dataLoader.loadCommunication()

    // Flatten structure for easier display
    communication.沟通话术列表.forEach(obj => {
      obj.阶段列表.forEach(phase => {
        phase.场景列表.forEach(scenario => {
          allScripts.value.push({
            object: obj.沟通对象,
            phase: phase.阶段名称,
            scenario
          })
        })
      })
    })

    console.log('Communication scripts loaded:', allScripts.value.length)
    console.log('Filtered scripts length:', filteredScripts.value.length)
    console.log('Total pages:', totalPages.value)

    isDataLoaded.value = true
  } catch (error) {
    console.error('Failed to load communication data:', error)
  }
})
</script>

<style scoped lang="scss">
.communication-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  margin-top: calc($navbar-height + 4px);
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
  position: sticky;
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
  margin-top: 4px;
  margin-bottom: 4px;
}

.object-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.object-label {
  font-size: 14px;
  font-weight: $font-weight-semibold;
  color: $primary;
  white-space: nowrap;
}

.object-select {
  width: 200px;
}

.ts-settings {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: flex-start;
}

.ts-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .ts-label {
    font-size: 14px;
    font-weight: $font-weight-semibold;
    color: $primary;
    white-space: nowrap;
  }
}

:deep(.el-radio-button__inner) {
  font-size: 14px;
  padding: 4px 8px;
}

.scripts-list {
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
    height: auto;
  }

  .object-section {
    justify-content: flex-start;
  }

  .object-select {
    width: 100% !important;
  }

  .ts-settings {
    align-items: flex-start;
  }

  .ts-row {
    width: 100%;
  }
}
</style>
