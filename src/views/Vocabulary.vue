<template>
  <div class="vocabulary-page">
    <TopNavbar />

    <div class="page-content">
      <div class="main-content">
        <div v-if="!isDataLoaded" class="loading-container">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else>
          <!-- Category Selection Section -->
          <div class="category-section">
            <div class="category-header">
              <h3>{{ t('vocabulary.selectCategory') }}</h3>
              <div class="category-actions">
                <el-button size="small" link @click="selectAllCategories">
                  {{ t('vocabulary.selectAll') }}
                </el-button>
                <el-button size="small" link @click="clearAllCategories">
                  {{ t('vocabulary.clearAll') }}
                </el-button>
              </div>
            </div>

            <div class="category-chips">
              <el-checkbox-group v-model="selectedSections" @change="handleCategoryChange">
                <el-checkbox-button
                  v-for="section in sections"
                  :key="section"
                  :label="section"
                >
                  {{ section }}
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </div>

          <!-- Content Header -->
          <div class="content-header">
            <div class="header-actions">
              <el-button
                :type="practiceMode === 'learn' ? 'primary' : ''"
                @click="practiceMode = 'learn'"
              >
                {{ t('vocabulary.learnMode') }}
              </el-button>
              <el-button
                :type="practiceMode === 'dictation' ? 'primary' : ''"
                @click="startDictation"
              >
                {{ t('vocabulary.dictationPractice') }}
              </el-button>
              <el-button
                :type="practiceMode === 'game' ? 'primary' : ''"
                @click="startGame"
              >
                消除乐
              </el-button>
              <el-button-group v-if="practiceMode === 'learn'" class="view-mode-toggle">
                <el-button
                  :type="viewMode === 'card' ? 'primary' : ''"
                  :icon="Grid"
                  @click="viewMode = 'card'"
                >
                  {{ t('vocabulary.cardMode') }}
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : ''"
                  :icon="List"
                  @click="viewMode = 'list'"
                >
                  {{ t('vocabulary.listMode') }}
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- Learning mode -->
          <div v-if="practiceMode === 'learn'" class="vocabularies-list">
            <!-- Card Mode -->
            <template v-if="viewMode === 'card'">
              <VocabularyCard
                v-for="vocab in paginatedVocabularies"
                :key="vocab.序号"
                :vocabulary="vocab"
                :is-bookmarked="isBookmarked(vocab)"
                @bookmark="handleBookmark"
              />
            </template>

            <!-- List Mode -->
            <template v-else>
              <VocabularyListItem
                v-for="vocab in paginatedVocabularies"
                :key="vocab.序号"
                :vocabulary="vocab"
                :is-bookmarked="isBookmarked(vocab)"
                @bookmark="handleBookmark"
              />
            </template>

            <div v-if="currentVocabularies.length === 0" class="empty-state">
              <el-icon :size="48"><Document /></el-icon>
              <p>{{ t('vocabulary.noCategorySelected') }}</p>
            </div>
          </div>

          <!-- Pagination for learn mode -->
          <el-pagination
            v-if="practiceMode === 'learn' && totalPages > 1"
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="currentVocabularies.length"
            layout="prev, pager, next"
            class="pagination"
            @current-change="handlePageChange"
          />

          <!-- Dictation practice mode -->
          <DictationPractice
            v-else-if="practiceMode === 'dictation'"
            :vocabularies="currentVocabularies"
            @complete="handlePracticeComplete"
            @back="exitDictation"
          />

          <!-- Match3 game mode -->
          <Match3Game
            v-else-if="practiceMode === 'game'"
            :vocabularies="currentVocabularies"
            @close="exitGame"
          />
        </div>
      </div>
    </div>

    <BottomInfoBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Document, Loading, Grid, List } from '@element-plus/icons-vue'
import { useVocabularyStore } from '@/stores/vocabulary'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useProgressStore } from '@/stores/progress'
import { useI18n } from '@/composables/useI18n'
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'
import VocabularyCard from '@/components/vocabulary/VocabularyCard.vue'
import VocabularyListItem from '@/components/vocabulary/VocabularyListItem.vue'
import DictationPractice from '@/components/vocabulary/DictationPractice.vue'
import Match3Game from '@/components/vocabulary/Match3Game.vue'

const { t } = useI18n()
const vocabularyStore = useVocabularyStore()
const bookmarkStore = useBookmarkStore()
const progressStore = useProgressStore()

const practiceMode = ref<'learn' | 'dictation' | 'game'>('learn')
const viewMode = ref<'card' | 'list'>('card')
const currentPage = ref(1)
const pageSize = ref(10)
const isDataLoaded = ref(false)

// Category selection
const sections = computed(() => vocabularyStore.sections)
const selectedSections = ref<string[]>(['基本概念'])

const currentVocabularies = computed(() => {
  return vocabularyStore.getVocabulariesBySectionNames(selectedSections.value)
})

const totalPages = computed(() => {
  return Math.ceil(currentVocabularies.value.length / pageSize.value)
})

const paginatedVocabularies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return currentVocabularies.value.slice(start, end)
})

function handleCategoryChange() {
  currentPage.value = 1
}

function selectAllCategories() {
  selectedSections.value = [...sections.value]
}

function clearAllCategories() {
  selectedSections.value = []
}

function startDictation() {
  practiceMode.value = 'dictation'
}

function startGame() {
  practiceMode.value = 'game'
}

function exitGame() {
  practiceMode.value = 'learn'
}

function exitDictation() {
  practiceMode.value = 'learn'
}

function handlePracticeComplete(result: { correct: number; total: number }) {
  const score = Math.round((result.correct / result.total) * 100)
  const title = `${t('vocabulary.dictationPractice')} - 正确率: ${score}%`

  progressStore.addRecord({
    type: 'vocabulary',
    title: title,
    score: score
  })

  // Don't automatically exit - let user view summary in DictationPractice component
}

function handlePageChange(page: number) {
  console.log('[Vocabulary] Page changed to:', page)
  currentPage.value = page
}

function isBookmarked(vocab: any): boolean {
  return bookmarkStore.isBookmarked('vocabulary', vocab.序号.toString())
}

function handleBookmark(vocab: any) {
  const id = vocab.序号.toString()
  if (bookmarkStore.isBookmarked('vocabulary', id)) {
    bookmarkStore.removeBookmark('vocabulary', id)
  } else {
    bookmarkStore.addBookmark('vocabulary', id, vocab)
  }
}

onMounted(async () => {
  await vocabularyStore.loadVocabularies()
  // Set default category to '基本概念' after sections are loaded
  if (sections.value.length > 0 && sections.value.includes('基本概念')) {
    selectedSections.value = ['基本概念']
  }
  isDataLoaded.value = true
})
</script>

<style scoped lang="scss">
.vocabulary-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  margin-top: calc($navbar-height + 10px);
  margin-bottom: $bottombar-height;
  display: flex;
  justify-content: center;
  width: 100%;
}

.main-content {
  max-width: $max-content-width;
  width: 100%;
  padding-left: calc($spacing-2xl + $spacing-md);
  padding-right: $spacing-xl;
  padding-top: $spacing-xl;
  padding-bottom: $spacing-xl;
  font-size: 14px;
}

.category-section {
  margin-bottom: $spacing-xl;
  margin-left: $spacing-md;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

h3 {
  margin: 0;
  color: $primary;
}

.category-actions {
  display: flex;
  gap: $spacing-sm;

  .el-button {
    font-size: 14px;
    font-weight: $font-weight-semibold;
  }
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  margin-left: $spacing-md;
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
}

.view-mode-toggle {
  margin-left: auto;
}

.vocabularies-list {
  display: grid;
  gap: $spacing-md;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  justify-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  gap: $spacing-md;
  margin-left: $spacing-md;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
  margin-left: $spacing-md;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  gap: $spacing-md;
}

p {
  color: $text-secondary;
}
</style>
