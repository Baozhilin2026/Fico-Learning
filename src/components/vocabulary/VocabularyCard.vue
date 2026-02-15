<template>
  <div class="vocabulary-card" :class="{ 'is-flipped': isFlipped }" @click="flipCard">
    <div class="card-inner">
      <!-- Front Side -->
      <div class="card-front">
        <div class="card-content">
          <div class="term-section">
            <h3 class="english-term">{{ vocabulary.英文 }}</h3>
            <div class="ipa-pronunciation">
              <span class="ipa">{{ vocabulary.读音 }}</span>
              <el-button
                :icon="isPlaying ? VideoPause : VideoPlay"
                circle
                size="small"
                :loading="loading"
                @click.stop="playAudio"
              />
            </div>
          </div>

          <div class="translation-section">
            <span class="chinese-translation">{{ vocabulary.中文翻译 }}</span>
          </div>

          <div class="explanation">
            <span class="label">中文解释:</span>
            <p>{{ vocabulary.中文解释 }}</p>
          </div>
        </div>

        <el-button
          :icon="isBookmarked ? StarFilled : Star"
          :type="isBookmarked ? 'warning' : 'default'"
          circle
          size="small"
          class="bookmark-btn"
          @click.stop="$emit('bookmark', vocabulary)"
        />
      </div>

      <!-- Back Side -->
      <div class="card-back">
        <div class="card-content">
          <div class="detail-section">
            <div class="section-title">SAP场景例句</div>
            <div class="example-sentence">
              <p class="english">{{ vocabulary.SAP场景例句 }}</p>
              <el-button
                :icon="isPlayingExample ? VideoPause : VideoPlay"
                circle
                size="small"
                :loading="loadingExample"
                class="play-button"
                @click.stop="playExampleAudio"
              />
            </div>

            <div v-if="vocabulary.常见会议说法 && vocabulary.常见会议说法.length > 0" class="section-title">
              常见会议说法
            </div>
            <ul v-if="vocabulary.常见会议说法 && vocabulary.常见会议说法.length > 0" class="meeting-expressions">
              <li v-for="(expr, index) in vocabulary.常见会议说法" :key="index" class="meeting-expression-item">
                <span class="expression-text">{{ expr }}</span>
                <el-button
                  :icon="playingExpressionIndex === index ? VideoPause : VideoPlay"
                  circle
                  size="small"
                  :loading="loadingExpression && playingExpressionIndex === index"
                  class="play-button-small"
                  @click.stop="playExpressionAudio(expr, index)"
                />
              </li>
            </ul>

            <div v-if="vocabulary.常见错误用法 && vocabulary.常见错误用法.length > 0" class="section-title">
              常见错误用法
            </div>
            <div v-if="vocabulary.常见错误用法 && vocabulary.常见错误用法.length > 0" class="wrong-usage">
              <p v-for="(wrong, index) in vocabulary.常见错误用法" :key="index" class="wrong-item">
                {{ wrong }}
              </p>
            </div>
          </div>
        </div>

        <div class="back-hint">点击翻回正面</div>
      </div>
    </div>
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
const progressStore = useProgressStore()
const isFlipped = ref(false)
const loading = ref(false)
const loadingExample = ref(false)
const isPlayingExample = ref(false)
const loadingExpression = ref(false)
const playingExpressionIndex = ref<number | null>(null)

function flipCard() {
  isFlipped.value = !isFlipped.value
}

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

async function playExampleAudio() {
  loadingExample.value = true
  isPlayingExample.value = true
  try {
    await speak(props.vocabulary.SAP场景例句, {
      accent: 'western',
      gender: 'female',
      rate: 1.0
    })

    // Add learning record when playing example sentence
    progressStore.addRecord({
      type: 'vocabulary',
      title: `示例句: ${props.vocabulary.SAP场景例句?.substring(0, 30)}${props.vocabulary.SAP场景例句?.length > 30 ? '...' : ''}`
    })
  } finally {
    loadingExample.value = false
    isPlayingExample.value = false
  }
}

async function playExpressionAudio(expression: string, index: number) {
  loadingExpression.value = true
  playingExpressionIndex.value = index
  try {
    await speak(expression, {
      accent: 'western',
      gender: 'female',
      rate: 1.0
    })

    // Add learning record when playing expression
    progressStore.addRecord({
      type: 'vocabulary',
      title: `常见表达: ${expression?.substring(0, 30)}${expression?.length > 30 ? '...' : ''}`
    })
  } finally {
    loadingExpression.value = false
    playingExpressionIndex.value = null
  }
}
</script>

<style scoped lang="scss">
.vocabulary-card {
  background-color: transparent;
  height: 320px;
  perspective: 1000px;
  cursor: pointer;
  width: 360px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.vocabulary-card.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background-color: $bg-primary;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  transition: all $transition-base;
  overflow-y: auto;
}

.vocabulary-card:hover .card-front,
.vocabulary-card:hover .card-back {
  box-shadow: $shadow-md;
}

.card-back {
  transform: rotateY(180deg);
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.term-section {
  margin-bottom: $spacing-md;
}

.english-term {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $primary;
  margin-bottom: $spacing-xs;
}

.ipa-pronunciation {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.ipa {
  font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;
  font-size: $font-size-sm;
  color: $text-secondary;
  background-color: $bg-secondary;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
}

.translation-section {
  margin-bottom: $spacing-md;

  .chinese-translation {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.explanation {
  flex: 1;

  .label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  p {
    margin: $spacing-xs 0 0 0;
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.6;
  }
}

.bookmark-btn {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.section-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.example-sentence {
  background-color: $bg-secondary;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  border-left: 3px solid $accent;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-md;

  .english {
    flex: 1;
    font-size: $font-size-sm;
    color: $text-primary;
    margin: 0;
    font-style: italic;
  }

  .play-button {
    flex-shrink: 0;
  }
}

.meeting-expressions {
  list-style: none;
  padding: 0;
  margin: 0;

  .meeting-expression-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-primary;
    padding: $spacing-xs $spacing-sm;
    background-color: $bg-secondary;
    border-radius: $border-radius-sm;
    margin-bottom: $spacing-xs;

    .expression-text {
      flex: 1;
    }

    .play-button-small {
      flex-shrink: 0;
    }
  }
}

.wrong-usage {
  .wrong-item {
    font-size: $font-size-sm;
    color: $error;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba($error, 0.05);
    border-radius: $border-radius-sm;
    margin-bottom: $spacing-xs;

    &:before {
      content: '✗ ';
      font-weight: $font-weight-bold;
    }
  }
}

.back-hint {
  position: absolute;
  bottom: $spacing-sm;
  right: $spacing-sm;
  font-size: $font-size-xs;
  color: $text-disabled;
}
</style>
