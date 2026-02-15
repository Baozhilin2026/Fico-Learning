<template>
  <div class="vocabulary-list-item">
    <div class="item-content">
      <div class="term-section">
        <h3 class="english-term">{{ vocabulary.英文 }}</h3>
        <div class="ipa-pronunciation">
          <span class="ipa">{{ vocabulary.读音 }}</span>
          <el-button
            :icon="isPlaying ? VideoPause : VideoPlay"
            circle
            size="small"
            :loading="loading"
            @click="playAudio"
          />
        </div>
      </div>

      <div class="translation-section">
        <span class="chinese-translation">{{ vocabulary.中文翻译 }}</span>
      </div>
    </div>

    <el-button
      :icon="isBookmarked ? StarFilled : Star"
      :type="isBookmarked ? 'warning' : 'default'"
      circle
      size="small"
      @click="$emit('bookmark', vocabulary)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VideoPlay, VideoPause, Star, StarFilled } from '@element-plus/icons-vue'
import { useTTS } from '@/composables/useTTS'
import { useProgressStore } from '@/stores/progress'
import type { VocabularyEntry } from '@/types'

interface Props {
  vocabulary: VocabularyEntry
  isBookmarked?: boolean
}

interface Emits {
  (e: 'bookmark', vocabulary: VocabularyEntry): void
}

const props = withDefaults(defineProps<Props>(), {
  isBookmarked: false
})

defineEmits<Emits>()

const { speak, isPlaying } = useTTS()
const loading = ref(false)
const progressStore = useProgressStore()

async function playAudio() {
  loading.value = true
  try {
    await speak(props.vocabulary.英文, {
      accent: 'western',
      gender: 'female',
      rate: 1.0
    })

    // Add learning record when playing vocabulary
    progressStore.addRecord({
      type: 'vocabulary',
      title: `${props.vocabulary.英文} - ${props.vocabulary.中文翻译}`
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.vocabulary-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  background-color: $bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  &:hover {
    box-shadow: $shadow-md;
    background-color: $bg-tertiary;
  }
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  min-width: 0;
}

.term-section {
  flex-shrink: 0;
  min-width: 200px;
}

.english-term {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $primary;
  margin: 0 0 $spacing-xs 0;
}

.ipa-pronunciation {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.ipa {
  font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;
  font-size: $font-size-xs;
  color: $text-secondary;
  background-color: $bg-secondary;
  padding: 2px $spacing-xs;
  border-radius: $border-radius-sm;
}

.translation-section {
  flex: 1;
  min-width: 0;

  .chinese-translation {
    font-size: $font-size-sm;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }

  .term-section {
    min-width: auto;
  }

  .translation-section {
    .chinese-translation {
      white-space: normal;
    }
  }
}
</style>
