import type {
  VocabularyData,
  CommunicationData,
  InterviewQAData,
  InterviewQuestionsData,
  AppConfig
} from '@/types'

class DataLoader {
  private vocabularies: VocabularyData | null = null
  private communication: CommunicationData | null = null
  private interviewQA: InterviewQAData | null = null
  private interviewQuestions: InterviewQuestionsData | null = null
  private config: AppConfig | null = null

  private async fetchJSON<T>(filename: string): Promise<T> {
    try {
      const response = await fetch(`/data/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error loading ${filename}:`, error)
      throw error
    }
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) return this.config
    this.config = await this.fetchJSON<AppConfig>('config.json')
    return this.config
  }

  async loadVocabularies(): Promise<VocabularyData> {
    if (this.vocabularies) return this.vocabularies
    this.vocabularies = await this.fetchJSON<VocabularyData>('vocabularies.json')
    return this.vocabularies
  }

  async loadCommunication(): Promise<CommunicationData> {
    if (this.communication) return this.communication
    this.communication = await this.fetchJSON<CommunicationData>('communication.json')
    return this.communication
  }

  async loadInterviewQA(): Promise<InterviewQAData> {
    if (this.interviewQA) return this.interviewQA
    this.interviewQA = await this.fetchJSON<InterviewQAData>('interview-qa.json')
    return this.interviewQA
  }

  async loadInterviewQuestions(): Promise<InterviewQuestionsData> {
    if (this.interviewQuestions) return this.interviewQuestions
    this.interviewQuestions = await this.fetchJSON<InterviewQuestionsData>('interview-questions.json')
    return this.interviewQuestions
  }

  async loadAll(): Promise<{
    vocabularies: VocabularyData
    communication: CommunicationData
    interviewQA: InterviewQAData
    interviewQuestions: InterviewQuestionsData
    config: AppConfig
  }> {
    const [vocabularies, communication, interviewQA, interviewQuestions, config] = await Promise.all([
      this.loadVocabularies(),
      this.loadCommunication(),
      this.loadInterviewQA(),
      this.loadInterviewQuestions(),
      this.loadConfig()
    ])

    return { vocabularies, communication, interviewQA, interviewQuestions, config }
  }

  // Check if data needs to be updated based on timestamp
  async checkUpdate(): Promise<boolean> {
    try {
      const config = await this.loadConfig()
      const lastUpdate = localStorage.getItem('fico_last_update')

      if (!lastUpdate) return true

      const storedDate = new Date(lastUpdate)
      const configDate = new Date(config.lastUpdated)

      return configDate > storedDate
    } catch {
      return false
    }
  }

  // Clear cached data
  clearCache(): void {
    this.vocabularies = null
    this.communication = null
    this.interviewQA = null
    this.interviewQuestions = null
    this.config = null
  }

  // Get vocabulary by section name
  getVocabulariesBySection(sectionName: string) {
    if (!this.vocabularies) return []
    const section = this.vocabularies.FICO词汇表.find(s => s.章节 === sectionName)
    return section?.词汇列表 || []
  }

  // Get all section names
  getSectionNames(): string[] {
    if (!this.vocabularies) return []
    return this.vocabularies.FICO词汇表.map(s => s.章节)
  }

  // Get communication scripts by object
  getCommunicationByObject(objectName: string) {
    if (!this.communication) return []
    const obj = this.communication.沟通话术列表.find(o => o.沟通对象 === objectName)
    return obj?.阶段列表 || []
  }

  // Get all communication objects
  getCommunicationObjects(): string[] {
    if (!this.communication) return []
    return this.communication.沟通话术列表.map(o => o.沟通对象)
  }

  // Get interview questions by stage
  getInterviewQuestionsByStage(stageName: string) {
    if (!this.interviewQuestions) return []
    const stage = this.interviewQuestions.interviewContents.find(s => s.interviewStage === stageName)
    return stage?.questions || []
  }

  // Get all interview stages
  getInterviewStages(): string[] {
    if (!this.interviewQuestions) return []
    return this.interviewQuestions.interviewContents.map(s => s.interviewStage)
  }

  // Search vocabularies
  searchVocabularies(keyword: string) {
    if (!this.vocabularies) return []
    const results: Array<{ section: string; entry: any }> = []
    const lowerKeyword = keyword.toLowerCase()

    this.vocabularies.FICO词汇表.forEach(section => {
      section.词汇列表.forEach(entry => {
        const englishMatch = entry.英文.toLowerCase().includes(lowerKeyword)
        const chineseMatch = entry.中文翻译.includes(keyword)
        const explanationMatch = entry.中文解释.includes(keyword)

        if (englishMatch || chineseMatch || explanationMatch) {
          results.push({ section: section.章节, entry })
        }
      })
    })

    return results
  }

  // Search communication scripts
  searchCommunication(keyword: string) {
    if (!this.communication) return []
    const results: Array<{ object: string; phase: string; scenario: any }> = []
    const lowerKeyword = keyword.toLowerCase()

    this.communication.沟通话术列表.forEach(obj => {
      obj.阶段列表.forEach(phase => {
        phase.场景列表.forEach(scenario => {
          const englishMatch = scenario.英文话术.toLowerCase().includes(lowerKeyword)
          const chineseMatch = scenario.中文话术.includes(keyword)
          const sceneMatch = scenario.使用场景.includes(keyword)

          if (englishMatch || chineseMatch || sceneMatch) {
            results.push({
              object: obj.沟通对象,
              phase: phase.阶段名称,
              scenario
            })
          }
        })
      })
    })

    return results
  }

  // Search interview content
  searchInterview(keyword: string) {
    if (!this.interviewQA) return []
    const results: Array<{ part: string; question: any }> = []
    const lowerKeyword = keyword.toLowerCase()

    this.interviewQA.parts.forEach(part => {
      part.questions.forEach(question => {
        const qMatch = question.questionContent.toLowerCase().includes(lowerKeyword)
        const aMatch = question.sampleAnswer.toLowerCase().includes(lowerKeyword)

        if (qMatch || aMatch) {
          results.push({ part: part.partName, question })
        }
      })
    })

    return results
  }
}

export const dataLoader = new DataLoader()
