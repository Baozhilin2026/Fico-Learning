import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VocabularyEntry } from '@/types'
import { dataLoader } from '@/services/dataLoader'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const vocabularies = ref<VocabularyEntry[]>([])
  const currentSection = ref('基本概念')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sections = ref<string[]>([])

  const currentVocabularies = computed(() => {
    return dataLoader.getVocabulariesBySection(currentSection.value)
  })

  const totalCount = computed(() => {
    return vocabularies.value.length
  })

  async function loadVocabularies() {
    if (vocabularies.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      await dataLoader.loadVocabularies()

      // Get section names from dataLoader
      sections.value = dataLoader.getSectionNames()

      // Load all vocabularies with section info
      sections.value.forEach(section => {
        const items = dataLoader.getVocabulariesBySection(section)
        items.forEach(item => {
          vocabularies.value.push({ ...item, 章节: section })
        })
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabularies'
      console.error('Failed to load vocabularies:', err)
    } finally {
      loading.value = false
    }
  }

  function setSection(section: string) {
    currentSection.value = section
  }

  function getVocabularyById(id: number): VocabularyEntry | undefined {
    return vocabularies.value.find(v => v.序号 === id)
  }

  function searchVocabularies(keyword: string) {
    return dataLoader.searchVocabularies(keyword)
  }

  function getVocabulariesBySectionNames(sectionNames: string[]) {
    if (sectionNames.length === 0) {
      return vocabularies.value
    }
    return vocabularies.value.filter(v => sectionNames.includes(v.章节))
  }

  return {
    vocabularies,
    currentSection,
    loading,
    error,
    sections,
    currentVocabularies,
    totalCount,
    loadVocabularies,
    setSection,
    getVocabularyById,
    searchVocabularies,
    getVocabulariesBySectionNames
  }
})
