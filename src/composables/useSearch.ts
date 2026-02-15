import { ref, computed } from 'vue'
import { dataLoader } from '@/services/dataLoader'

// Simple debounce function
function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: number | null = null
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => fn(...args), delay)
  }) as T
}

interface SearchResult {
  type: 'vocabulary' | 'communication' | 'interview'
  id: string
  title: string
  content: string
  data: any
}

export function useSearch() {
  const keyword = ref('')
  const isSearching = ref(false)
  const results = ref<SearchResult[]>([])

  // Debounced search function
  const performSearch = useDebounceFn(async (query: string) => {
    if (!query.trim()) {
      results.value = []
      isSearching.value = false
      return
    }

    isSearching.value = true

    try {
      const allResults: SearchResult[] = []

      // Search vocabularies
      const vocabResults = dataLoader.searchVocabularies(query)
      vocabResults.forEach(({ section, entry }) => {
        allResults.push({
          type: 'vocabulary',
          id: `vocab-${entry.序号}`,
          title: entry.英文,
          content: `${entry.中文翻译} - ${section}`,
          data: { section, entry }
        })
      })

      // Search communication scripts
      const commResults = dataLoader.searchCommunication(query)
      commResults.forEach(({ object, phase, scenario }) => {
        allResults.push({
          type: 'communication',
          id: `comm-${scenario.场景序号}`,
          title: scenario.场景名称,
          content: `${object} - ${phase}`,
          data: { object, phase, scenario }
        })
      })

      // Search interview content
      const interviewResults = dataLoader.searchInterview(query)
      interviewResults.forEach(({ part, question }) => {
        allResults.push({
          type: 'interview',
          id: `interview-${question.questionNo}`,
          title: question.questionContent,
          content: `${part} - ${question.questionNo}`,
          data: { part, question }
        })
      })

      results.value = allResults
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      isSearching.value = false
    }
  }, 300)

  // Watch keyword changes
  function search(query: string) {
    keyword.value = query
    performSearch(query)
  }

  // Clear search results
  function clear() {
    keyword.value = ''
    results.value = []
  }

  // Group results by type
  const groupedResults = computed(() => {
    const groups: Record<string, SearchResult[]> = {
      vocabulary: [],
      communication: [],
      interview: []
    }

    results.value.forEach(result => {
      groups[result.type].push(result)
    })

    return groups
  })

  return {
    keyword,
    isSearching,
    results,
    groupedResults,
    search,
    clear
  }
}
