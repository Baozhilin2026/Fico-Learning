import type { InterviewFeedback, InterviewAnswer } from '@/types'

interface FeedbackConfig {
  minScore: number
  maxScore: number
}

const FICO_KEYWORDS = [
  'General Ledger', 'G/L', 'Chart of Accounts', 'COA', 'Company Code',
  'Fiscal Year', 'Posting', 'Document Type', 'Posting Key',
  'Accounts Payable', 'AP', 'Accounts Receivable', 'AR',
  'Asset Accounting', 'AA', 'Depreciation', 'Asset Master',
  'Controlling', 'CO', 'Cost Center', 'Profit Center',
  'Internal Order', 'Cost Element', 'Activity Based Costing', 'ABC',
  'Product Costing', 'Profitability Analysis', 'CO-PA',
  'Automatic Payment Program', 'APP', 'Dunning', 'Valuation',
  'Subledger', 'Reconciliation', 'Balance Sheet', 'P&L',
  'SAP', 'S/4HANA', 'ECC', 'FI', 'CO', 'FICO'
]

const GRAMMAR_PATTERNS = {
  good: [
    /^[A-Z]/, // Starts with capital letter
    /\.$/, // Ends with period
    /\b(I am|I have|I have been|I was)\b/i, // Good first person forms
    /\b(the|a|an|my|our|their)\b/i // Proper articles
  ],
  issues: [
    /\bi\b(?!\s+am)/i, // Single 'i' not followed by 'am'
    /\s{2,}/, // Multiple spaces
    /[.]{2,}/ // Multiple periods
  ]
}

class FeedbackService {
  private config: FeedbackConfig = {
    minScore: 0,
    maxScore: 100
  }

  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    return words.filter(word =>
      FICO_KEYWORDS.some(keyword =>
        keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())
      )
    )
  }

  // Check English expression quality
  private evaluateEnglishExpression(answer: string): {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const suggestions: string[] = []

    // Check sentence structure
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length

    // Check for proper capitalization
    if (GRAMMAR_PATTERNS.good[0].test(answer)) {
      strengths.push('句子首字母大写正确')
    } else {
      weaknesses.push('句子首字母未大写')
    }

    // Check for proper ending
    if (GRAMMAR_PATTERNS.good[1].test(answer)) {
      strengths.push('句子结尾标点正确')
    } else {
      weaknesses.push('缺少句子结尾标点')
    }

    // Evaluate sentence complexity
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
      strengths.push('句子长度适中，表达清晰')
    } else if (avgSentenceLength < 10) {
      weaknesses.push('句子过于简单，建议增加更多细节')
      suggestions.push('尝试使用复合句或增加具体例子来丰富回答')
    } else {
      weaknesses.push('句子过长，可能影响理解')
      suggestions.push('考虑将复杂句子拆分为多个简短句子')
    }

    // Check for common issues
    if (GRAMMAR_PATTERNS.issues[1].test(answer)) {
      weaknesses.push('存在多余空格')
    }

    // Calculate score
    let score = 60 // Base score
    score += strengths.length * 10
    score -= weaknesses.length * 5
    score = Math.max(this.config.minScore, Math.min(this.config.maxScore, score))

    return { score, strengths, weaknesses, suggestions }
  }

  // Check FICO professionalism
  private evaluateFICOProfessionalism(answer: string, referenceKeywords: string[]): {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const suggestions: string[] = []

    const userKeywords = this.extractKeywords(answer)
    const keywordSet = new Set(userKeywords.map(k => k.toLowerCase()))

    // Check keyword usage
    if (userKeywords.length >= 3) {
      strengths.push(`使用了${userKeywords.length}个FICO专业术语，表达专业`)
    } else if (userKeywords.length === 0) {
      weaknesses.push('未使用FICO专业术语')
      suggestions.push('在回答中加入相关FICO术语可以体现专业水平')
    } else {
      weaknesses.push('FICO专业术语使用较少')
      suggestions.push('尝试使用更多FICO术语来增强专业性')
    }

    // Check against reference keywords
    const matchedKeywords = referenceKeywords.filter(ref =>
      keywordSet.has(ref.toLowerCase())
    )

    if (matchedKeywords.length > 0) {
      strengths.push(`涵盖了关键概念：${matchedKeywords.join(', ')}`)
    }

    // Check for SAP-specific terms
    if (/\b(SAP|S\/4HANA|ECC|FICO)\b/i.test(answer)) {
      strengths.push('正确引用了SAP产品名称')
    }

    // Check for specific module references
    if (/\b(FI|CO|AA|AP|AR|GL|CO-PA|CO-PC)\b/i.test(answer)) {
      strengths.push('正确引用了FICO子模块')
    }

    // Calculate score
    let score = 50 // Base score
    score += userKeywords.length * 10
    score += matchedKeywords.length * 5
    score = Math.max(this.config.minScore, Math.min(this.config.maxScore, score))

    return { score, strengths, weaknesses, suggestions }
  }

  // Check interview skills
  private evaluateInterviewSkills(answer: string, questionLength: number): {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const suggestions: string[] = []

    const answerLength = answer.split(/\s+/).length
    const ratio = answerLength / Math.max(questionLength, 1)

    // Check answer completeness
    if (answerLength >= 20 && answerLength <= 150) {
      strengths.push('回答长度适中，内容完整')
    } else if (answerLength < 20) {
      weaknesses.push('回答过短，内容不够完整')
      suggestions.push('建议提供更多细节和具体例子')
    } else {
      weaknesses.push('回答过长，可能不够聚焦')
      suggestions.push('尝试更直接地回答问题，突出重点')
    }

    // Check for STAR method (Situation, Task, Action, Result)
    const starIndicators = ['situation', 'task', 'action', 'result', 'first', 'then', 'finally']
    const starCount = starIndicators.filter(indicator =>
      new RegExp(`\\b${indicator}\\b`, 'i').test(answer)
    ).length

    if (starCount >= 2) {
      strengths.push('使用了结构化的回答方式')
    }

    // Check for examples
    if (/\b(for example|for instance|such as|specifically)\b/i.test(answer)) {
      strengths.push('提供了具体例子来支持回答')
    } else {
      suggestions.push('考虑加入具体例子来增强说服力')
    }

    // Check for professional tone
    const professionalWords = ['responsibility', 'experience', 'worked on', 'managed', 'developed', 'implemented']
    const hasProfessionalTone = professionalWords.some(word =>
      new RegExp(`\\b${word}\\b`, 'i').test(answer)
    )

    if (hasProfessionalTone) {
      strengths.push('使用了专业的表达方式')
    }

    // Calculate score
    let score = 50 // Base score
    score += strengths.length * 8
    score -= weaknesses.length * 5
    score = Math.max(this.config.minScore, Math.min(this.config.maxScore, score))

    return { score, strengths, weaknesses, suggestions }
  }

  // Generate feedback for an interview answer
  generateFeedback(
    answer: InterviewAnswer,
    referenceAnswer?: string,
    referenceKeywords?: string[]
  ): InterviewFeedback {
    // Extract keywords from reference answer if provided
    const keywords = referenceKeywords || (
      referenceAnswer
        ? this.extractKeywords(referenceAnswer)
        : this.extractKeywords(answer.question)
    )

    // Evaluate each dimension
    const englishExpression = this.evaluateEnglishExpression(answer.answer)
    const ficoProfessionalism = this.evaluateFICOProfessionalism(answer.answer, keywords)
    const interviewSkills = this.evaluateInterviewSkills(answer.answer, answer.question.split(/\s+/).length)

    // Calculate overall score
    const overallScore = Math.round(
      (englishExpression.score * 0.3 +
        ficoProfessionalism.score * 0.4 +
        interviewSkills.score * 0.3)
    )

    return {
      englishExpression,
      ficoProfessionalism,
      interviewSkills,
      overallScore
    }
  }

  // Generate feedback for multiple answers
  generateSessionFeedback(
    answers: InterviewAnswer[],
    referenceAnswers?: Map<string, { answer?: string; keywords?: string[] }>
  ): InterviewFeedback {
    if (answers.length === 0) {
      return {
        englishExpression: {
          score: 0,
          strengths: [],
          weaknesses: ['未提供任何回答'],
          suggestions: ['请完成面试问题以获得反馈']
        },
        ficoProfessionalism: {
          score: 0,
          strengths: [],
          weaknesses: ['未提供任何回答'],
          suggestions: ['请完成面试问题以获得反馈']
        },
        interviewSkills: {
          score: 0,
          strengths: [],
          weaknesses: ['未提供任何回答'],
          suggestions: ['请完成面试问题以获得反馈']
        },
        overallScore: 0
      }
    }

    // Aggregate feedback from all answers
    const allFeedback = answers.map(answer => {
      const reference = referenceAnswers?.get(answer.question)
      return this.generateFeedback(answer, reference?.answer, reference?.keywords)
    })

    // Average the scores
    const avgScore = (scores: number[]) =>
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)

    const aggregateStrengths = (dimension: 'englishExpression' | 'ficoProfessionalism' | 'interviewSkills') => {
      const strengthSet = new Set<string>()
      allFeedback.forEach(feedback => {
        feedback[dimension].strengths.forEach(s => strengthSet.add(s))
      })
      return Array.from(strengthSet).slice(0, 5) // Limit to top 5
    }

    const aggregateWeaknesses = (dimension: 'englishExpression' | 'ficoProfessionalism' | 'interviewSkills') => {
      const weaknessSet = new Set<string>()
      allFeedback.forEach(feedback => {
        feedback[dimension].weaknesses.forEach(w => weaknessSet.add(w))
      })
      return Array.from(weaknessSet).slice(0, 5) // Limit to top 5
    }

    const aggregateSuggestions = (dimension: 'englishExpression' | 'ficoProfessionalism' | 'interviewSkills') => {
      const suggestionSet = new Set<string>()
      allFeedback.forEach(feedback => {
        feedback[dimension].suggestions.forEach(s => suggestionSet.add(s))
      })
      return Array.from(suggestionSet).slice(0, 3) // Limit to top 3
    }

    const englishExpression = {
      score: avgScore(allFeedback.map(f => f.englishExpression.score)),
      strengths: aggregateStrengths('englishExpression'),
      weaknesses: aggregateWeaknesses('englishExpression'),
      suggestions: aggregateSuggestions('englishExpression')
    }

    const ficoProfessionalism = {
      score: avgScore(allFeedback.map(f => f.ficoProfessionalism.score)),
      strengths: aggregateStrengths('ficoProfessionalism'),
      weaknesses: aggregateWeaknesses('ficoProfessionalism'),
      suggestions: aggregateSuggestions('ficoProfessionalism')
    }

    const interviewSkills = {
      score: avgScore(allFeedback.map(f => f.interviewSkills.score)),
      strengths: aggregateStrengths('interviewSkills'),
      weaknesses: aggregateWeaknesses('interviewSkills'),
      suggestions: aggregateSuggestions('interviewSkills')
    }

    const overallScore = Math.round(
      (englishExpression.score * 0.3 +
        ficoProfessionalism.score * 0.4 +
        interviewSkills.score * 0.3)
    )

    return {
      englishExpression,
      ficoProfessionalism,
      interviewSkills,
      overallScore
    }
  }
}

export const feedbackService = new FeedbackService()
