// Vocabulary types
export interface VocabularyEntry {
  序号: number
  英文: string
  读音: string
  中文翻译: string
  中文解释: string
  SAP场景例句: string
  常见会议说法: string[]
  常见错误用法: string[]
  章节?: string
}

export interface VocabularySection {
  章节: string
  词汇列表: VocabularyEntry[]
}

export interface VocabularyData {
  FICO词汇表: VocabularySection[]
}

// Communication types
export interface ScriptScenario {
  场景序号: number
  场景名称: string
  英文话术: string
  中文话术: string
  使用场景: string
}

export interface ScriptPhase {
  阶段名称: string
  场景列表: ScriptScenario[]
}

export interface ScriptObject {
  沟通对象: string
  阶段列表: ScriptPhase[]
}

export interface CommunicationData {
  文档名称: string
  沟通话术列表: ScriptObject[]
}

// Interview QA types
export interface InterviewQuestion {
  questionNo: string
  questionContent: string
  questionContentCN?: string
  sampleAnswer: string
  sampleAnswerCN?: string
}

export interface InterviewPart {
  partId: string
  partName: string
  questions: InterviewQuestion[]
}

export interface InterviewQAData {
  documentName: string
  parts: InterviewPart[]
}

// Interview Questions types
export interface InterviewQuestionItem {
  englishQuestion: string
  chineseTranslation: string
  englishAnswer: string
  chineseAnswer: string
}

export interface InterviewStage {
  interviewStage: string
  questions: InterviewQuestionItem[]
}

export interface InterviewQuestionsData {
  interviewContents: InterviewStage[]
}

// Config types
export interface InterviewConfig {
  questionsPerStage: number
  timePerQuestion: number
  stages: string[]
}

export interface AppConfig {
  authorizationCodes: string[]
  lastUpdated: string
  adminContact: string
  version: string
  interviewConfig: InterviewConfig
}

// TTS Settings types
export type TTSAccent = 'indian' | 'singapore' | 'western'
export type TTSGender = 'male' | 'female'

export interface TTSSettings {
  rate: number
}

// Bookmark types
export type BookmarkType = 'vocabulary' | 'communication' | 'interview'

export interface Bookmark {
  id: string
  type: BookmarkType
  data: any
  createdAt: string
}

// Progress types
export interface VocabularyProgress {
  learnedCount: number
  dictationCorrect: number
  dictationTotal: number
  recognitionCorrect: number
  recognitionTotal: number
}

export interface LearningProgress {
  vocabulary: VocabularyProgress
  todayStudyTime: number
  lastStudyDate: string
}

// Interview types
export interface InterviewAnswer {
  questionId?: string
  question: string
  answer: string
  audioBlob?: Blob
  timestamp?: string
}

export interface InterviewSession {
  id: string
  date: string
  settings: {}
  answers: InterviewAnswer[]
  feedback: InterviewFeedback | null
}

export interface InterviewFeedback {
  englishExpression: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    score: number
  }
  ficoProfessionalism: {
    strengths?: string[]
    weaknesses?: string[]
    suggestions?: string[]
    score?: number
    technicalAccuracy?: string[]
    industryContext?: string[]
    keywordUsage?: string[]
  }
  interviewSkills: {
    strengths?: string[]
    weaknesses?: string[]
    suggestions?: string[]
    score?: number
    clarity?: string[]
    structure?: string[]
    completeness?: string[]
  }
  overallScore: number
  aiInsights?: {
    overallAssessment: string
    careerRecommendations: string[]
    skillGaps: string[]
  }
  referenceAnswers?: Array<{
    question: string
    englishAnswer: string
    chineseAnswer: string
  }>
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean
  authToken: string | null
  loginTime: number | null
}

// AI Interview types
export type FICOJobLevel = 'junior' | 'middle' | 'senior'
export type FICOIndustry =
  | 'manufacturing'
  | 'retail'
  | 'finance'
  | 'energy'
  | 'pharma'
  | 'technology'
  | 'logistics'
  | 'public'
  | 'realestate'
  | 'other'

export interface AIInterviewQuestion {
  id: string
  englishQuestion: string
  chineseTranslation: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  competencies: string[]
  expectedAnswerKeywords: string[]
  stage: string
}

export interface AIInterviewFeedback {
  englishExpression: {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
  ficoProfessionalism: {
    score: number
    technicalAccuracy: string[]
    industryContext: string[]
    keywordUsage: string[]
  }
  interviewSkills: {
    score: number
    clarity: string[]
    structure: string[]
    completeness: string[]
  }
  overallScore: number
  aiInsights: {
    overallAssessment: string
    careerRecommendations: string[]
    skillGaps: string[]
  }
}

export interface ParsedJobRequirement {
  jobLevel: FICOJobLevel
  experience: string
  targetCompany: string
  competencies: {
    technical: string[]
    business: string[]
    project: string[]
  }
  interviewProcess: {
    questionsCount: number
    timePerQuestion: number
    scoringStructure: Record<string, number>
  }
  assessmentCriteria: {
    basic: string[]
    intermediate: string[]
    advanced: string[]
  }
}

export interface GLMConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

export interface JobLevelConfig {
  name: string
  experience: string
  questionsPerSession: number
  timePerQuestion: number
  document: string
  competencies?: {
    technical: string[]
    business: string[]
    project: string[]
  }
}

export interface AppConfigExtended extends AppConfig {
  glm?: GLMConfig
  jobLevels?: Record<FICOJobLevel, JobLevelConfig>
  industries?: Record<FICOIndustry, string>
}
