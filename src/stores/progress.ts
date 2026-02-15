import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VocabularyProgress, LearningProgress } from '@/types'

const STORAGE_KEY = 'fico_progress'

interface RecordItem {
  id: string
  type: 'vocabulary' | 'communication' | 'interview' | 'mockInterview'
  title: string
  timestamp: number
  score?: number
}

const DEFAULT_PROGRESS: LearningProgress = {
  vocabulary: {
    learnedCount: 0,
    dictationCorrect: 0,
    dictationTotal: 0,
    recognitionCorrect: 0,
    recognitionTotal: 0
  },
  todayStudyTime: 0,
  lastStudyDate: ''
}

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<LearningProgress>({ ...DEFAULT_PROGRESS })
  const recentRecords = ref<RecordItem[]>([])
  let isLoaded = false  // Track if data has been loaded from localStorage

  function loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        progress.value = { ...DEFAULT_PROGRESS, ...data.progress }

        // Check if it's a new day
        const today = new Date().toDateString()
        if (progress.value.lastStudyDate !== today) {
          progress.value.todayStudyTime = 0
        }

        recentRecords.value = data.recentRecords || []
      }
      isLoaded = true
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress: progress.value,
        recentRecords: recentRecords.value
      }))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Initialize
  loadProgress()

  return {
    progress,
    recentRecords,

    // All getter functions should ensure data is loaded first
    markVocabularyAsLearned: (vocabularyId: string) => {
      ensureLoaded()
      progress.value.vocabulary.learnedCount++
      saveProgress()
    },

    updateDictationScore: (correct: number, total: number) => {
      ensureLoaded()
      progress.value.vocabulary.dictationCorrect += correct
      progress.value.vocabulary.dictationTotal += total
      saveProgress()
    },

    updateRecognitionScore: (correct: number, total: number) => {
      ensureLoaded()
      progress.value.vocabulary.recognitionCorrect += correct
      progress.value.vocabulary.recognitionTotal += total
      saveProgress()
    },

    addStudyTime: (minutes: number) => {
      ensureLoaded()
      progress.value.todayStudyTime += minutes
      progress.value.lastStudyDate = new Date().toDateString()
      saveProgress()
    },

    getAccuracy: (): number => {
      ensureLoaded()
      const v = progress.value.vocabulary
      const totalCorrect = v.dictationCorrect + v.recognitionCorrect
      const totalQuestions = v.dictationTotal + v.recognitionTotal

      if (totalQuestions === 0) return 0
      return Math.round((totalCorrect / totalQuestions) * 100)
    },

    getProgress: (): LearningProgress => {
      ensureLoaded()
      return { ...progress.value }
    },

    addRecord: (record: Omit<RecordItem, 'id' | 'timestamp'>) => {
      ensureLoaded()
      const newRecord: RecordItem = {
        ...record,
        id: Date.now().toString(),
        timestamp: Date.now()
      }

      recentRecords.value.unshift(newRecord)

      // Keep only last 20 records
      if (recentRecords.value.length > 20) {
        recentRecords.value = recentRecords.value.slice(0, 20)
      }

      saveProgress()
    },

    getRecentRecords: (): RecordItem[] => {
      ensureLoaded()
      return [...recentRecords.value]
    },

    clearRecords: () => {
      ensureLoaded()
      recentRecords.value = []
      saveProgress()
    },

    resetProgress: () => {
      ensureLoaded()
      progress.value = { ...DEFAULT_PROGRESS }
      saveProgress()
    }
  }

  function ensureLoaded() {
    if (!isLoaded) {
      loadProgress()
    }
  }
})
