<template>
  <div class="bookmarks-page">
    <TopNavbar />

    <div class="page-content">
      <div class="main-content">
        <div class="content-header">
          <h2>{{ t('bookmarks.title') }}</h2>

          <div class="header-actions">
            <el-select
              v-model="selectedType"
              placeholder="筛选类型"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="单词短语" value="vocabulary" />
              <el-option label="沟通语句" value="communication" />
              <el-option label="面试内容" value="interview" />
            </el-select>

            <el-button
              v-if="hasBookmarks"
              :icon="Delete"
              type="danger"
              @click="handleClearAll"
            >
              清空全部
            </el-button>
          </div>
        </div>

        <div v-if="!hasBookmarks" class="empty-state">
          <el-empty :description="t('bookmarks.noBookmarks')">
            <el-button type="primary" @click="$router.push('/vocabulary')">
              开始学习
            </el-button>
          </el-empty>
        </div>

        <div v-else class="bookmarks-list">
          <!-- Vocabulary Bookmarks -->
          <div v-if="filteredBookmarks.vocabulary.length > 0" class="bookmark-section">
            <h3>{{ t('bookmarks.vocabulary') }}</h3>
            <div class="bookmark-grid">
              <VocabularyCard
                v-for="bookmark in filteredBookmarks.vocabulary"
                :key="bookmark.id"
                :vocabulary="bookmark.data"
                :is-bookmarked="true"
                @bookmark="handleRemoveBookmark"
              />
            </div>
          </div>

          <!-- Communication Bookmarks -->
          <div v-if="filteredBookmarks.communication.length > 0" class="bookmark-section">
            <h3>{{ t('bookmarks.communication') }}</h3>
            <div class="bookmark-list-communication">
              <ScriptCard
                v-for="bookmark in filteredBookmarks.communication"
                :key="bookmark.id"
                :scenario="bookmark.data.scenario"
                :object="bookmark.data.object"
                :phase="bookmark.data.phase"
                :is-bookmarked="true"
                @bookmark="handleRemoveBookmark"
              />
            </div>
          </div>

          <!-- Interview Bookmarks -->
          <div v-if="filteredBookmarks.interview.length > 0" class="bookmark-section">
            <h3>{{ t('bookmarks.interview') }}</h3>
            <div class="bookmark-list-interview">
              <QuestionCard
                v-for="bookmark in filteredBookmarks.interview"
                :key="bookmark.id"
                :question="bookmark.data.question"
                :part="bookmark.data.part"
                :part-name="bookmark.data.partName"
                :is-bookmarked="true"
                @bookmark="handleRemoveBookmark"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomInfoBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useI18n } from '@/composables/useI18n'
import { useStudyTimer } from '@/composables/useStudyTimer'
import TopNavbar from '@/components/common/TopNavbar.vue'
import BottomInfoBar from '@/components/common/BottomInfoBar.vue'
import VocabularyCard from '@/components/vocabulary/VocabularyCard.vue'
import ScriptCard from '@/components/communication/ScriptCard.vue'
import QuestionCard from '@/components/interview/QuestionCard.vue'

const { t } = useI18n()
const bookmarkStore = useBookmarkStore()
// Auto-start study timer when on this page
useStudyTimer()

const selectedType = ref<string>('')

const allBookmarks = computed(() => bookmarkStore.getAllBookmarks())

const hasBookmarks = computed(() => allBookmarks.value.length > 0)

const filteredBookmarks = computed(() => {
  const bookmarks = selectedType.value
    ? allBookmarks.value.filter(b => b.type === selectedType.value)
    : allBookmarks.value

  return {
    vocabulary: bookmarks.filter(b => b.type === 'vocabulary'),
    communication: bookmarks.filter(b => b.type === 'communication'),
    interview: bookmarks.filter(b => b.type === 'interview')
  }
})

function handleFilterChange() {
  // Filter changes are handled by computed property
}

function handleRemoveBookmark(item: any) {
  let type: string
  let id: string

  if (item.序号 !== undefined) {
    type = 'vocabulary'
    id = item.序号.toString()
  } else if (item.scenario) {
    type = 'communication'
    id = item.scenario.场景序号.toString()
  } else if (item.question) {
    type = 'interview'
    id = item.question.questionNo
  } else {
    return
  }

  bookmarkStore.removeBookmark(type as any, id)
  ElMessage.success(t('bookmarks.removeBookmark'))
}

async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有收藏吗？此操作不可撤销。',
      '清空收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    bookmarkStore.clearBookmarks()
    ElMessage.success('已清空所有收藏')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
.bookmarks-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  margin-top: $navbar-height;
  margin-bottom: $bottombar-height;
}

.main-content {
  max-width: $max-content-width;
  margin: 0 auto;
  width: 100%;
  padding: $spacing-xl;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;

  h2 {
    margin: 0;
    color: $primary;
  }
}

.header-actions {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2xl;
}

.bookmark-section {
  h3 {
    margin-bottom: $spacing-lg;
    color: $text-primary;
    border-bottom: 2px solid $primary;
    padding-bottom: $spacing-sm;
  }
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: $spacing-lg;
}

.bookmark-list-communication,
.bookmark-list-interview {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

@media (max-width: 768px) {
  .bookmark-grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-md;
  }
}
</style>
