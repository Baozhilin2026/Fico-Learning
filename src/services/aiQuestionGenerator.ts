import { glmService } from './glmService'
import { dataLoader } from './dataLoader'
import type { FICOJobLevel, FICOIndustry, AIInterviewQuestion } from '@/types'

class AIQuestionGenerator {
  private questionCache = new Map<string, AIInterviewQuestion[]>()

  // Track ALL generated questions to ensure uniqueness across sessions
  private generatedQuestions = new Set<string>()
  private usedTopicCombinations = new Set<string>()

  // Comprehensive topic list - 50+ unique topics
  private readonly allTopics = {
    basicConcepts: [
      "Company Code definition and purpose",
      "Company Code vs Business Area differences",
      "Chart of Accounts structure and types",
      "Chart of Accounts assignment to Company Code",
      "Document Type purpose and configuration",
      "Document Type control over account types",
      "Document Type number ranges",
      "Posting Key purpose and function",
      "Posting Key control over debit/credit",
      "Standard vs custom Posting Keys",
      "Fiscal Year Variant configuration",
      "Posting Period Variant purpose",
      "Posting period open/close process",
      "Account Group purpose and configuration",
      "Account Group field status",
      "Business Area usage and purpose",
      "Business Area vs Company Code scenarios",
      "Valuation Class and Valuation Area",
      "Credit Control Area purpose"
    ],
    masterData: [
      "Vendor Master account groups",
      "Vendor Master segments and data",
      "Vendor Master One-Time Vendor",
      "Customer Master account groups",
      "Customer Master partner functions",
      "GL Account master data structure",
      "GL Account chart of accounts assignment",
      "GL Account field status groups",
      "Asset Master classification views",
      "Asset Master depreciation areas",
      "Asset Master time-dependent data",
      "Cost Center standard hierarchy",
      "Cost Center basic data requirements",
      "Profit Center vs Cost Center",
      "Profit Center standard hierarchy"
    ],
    configuration: [
      "Account Determination configuration",
      "Account Determination table structure",
      "Account Determination for automatic postings",
      "Validation and Substitution basics",
      "Validation configuration steps",
      "Substitution configuration steps",
      "Document Number Range types",
      "Document Number Range assignment",
      "Posting Period Variant configuration",
      "Posting Period special periods",
      "Depreciation Key configuration",
      "Depreciation calculation methods",
      "Payment Terms configuration",
      "Payment Terms impact on due dates"
    ],
    transactions: [
      "F-02 G/L account posting",
      "FB60 vendor invoice posting",
      "F-110 automatic payment run",
      "F-90 asset acquisition posting",
      "F-92 asset retirement posting",
      "OBYC Account Determination T-code",
      "OB52 Posting Period T-code",
      "OB08 Document Type T-code",
      "FS00 GL Account Master T-code",
      "XK01 Vendor Master T-code",
      "FD01 Customer Master T-code",
      "AS01 Asset Master T-code",
      "KK01 Cost Center T-code",
      "MMPV Posting Period Open T-code",
      "FBL3N Vendor Line Items Display",
      "FAGLL03 GL Account Balance Display"
    ],
    processes: [
      "P2P Procure to Pay overview",
      "P2P Purchase Requisition step",
      "P2P Goods Receipt step",
      "P2P Invoice Verification step",
      "P2P Payment to Vendor step",
      "O2C Order to Cash overview",
      "O2C Sales Order creation",
      "O2C Delivery and Goods Issue",
      "O2C Billing document creation",
      "O2C Customer payment posting",
      "Asset Lifecycle overview",
      "Asset Acquisition through purchase",
      "Asset Acquisition through integration",
      "Asset Depreciation posting",
      "Asset Retirement with sale",
      "Asset Retirement with scrapping"
    ],
    testing: [
      "Test Script structure and content",
      "Test Script purpose in projects",
      "Test Script execution process",
      "Configuration Documentation requirements",
      "Configuration Documentation tools",
      "Unit Testing in SAP projects",
      "Integration Testing basics",
      "UAT User Acceptance Testing",
      "UAT Support responsibilities",
      "Test Data preparation",
      "Test Cycle planning",
      "Defect tracking and reporting"
    ]
  }

  private flattenTopics(): string[] {
    return [
      ...this.allTopics.basicConcepts,
      ...this.allTopics.masterData,
      ...this.allTopics.configuration,
      ...this.allTopics.transactions,
      ...this.allTopics.processes,
      ...this.allTopics.testing
    ]
  }

  private getUnusedTopics(count: number): string[] {
    const allFlat = this.flattenTopics()
    const unused = allFlat.filter(t => !this.usedTopicCombinations.has(t))

    // If not enough unused, reset and start fresh
    if (unused.length < count) {
      this.usedTopicCombinations.clear()
      return allFlat.slice(0, count)
    }

    // Shuffle and select
    const shuffled = unused.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    // Mark as used
    selected.forEach(t => this.usedTopicCombinations.add(t))

    return selected
  }

  private getCacheKey(jobLevel: FICOJobLevel, industry: FICOIndustry, stage: string): string {
    // Unique ID every time - no caching for junior
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    return `${jobLevel}-${industry}-${stage}-${uniqueId}`
  }

  private getJuniorLevelGuidelines(stage: string, selectedTopics: string[]): string {
    const topicList = selectedTopics.join("\n- ")

    const guidelines: Record<string, string> = {
      '技术问题': `
JUNIOR LEVEL TECHNICAL QUESTIONS - BASIC FUNDAMENTALS

YOU MUST USE THESE DIFFERENT TOPICS (do NOT deviate):
- ${topicList}

KEEP IT SIMPLE - Use ONLY these basic question formats:
1. BASIC DEFINITION: "What is [topic]?"
   Examples: "What is a Company Code?", "What is a Document Type?", "What is a Chart of Accounts?"

2. SIMPLE T-CODE: "Which T-code is used for [task]?"
   Examples: "Which T-code creates a G/L account?", "Which T-code posts vendor invoices?"

3. YES/NO: "Is [fact] true?"
   Examples: "Is a Document Type required for posting?", "Is Company Code the smallest org unit?"

4. SIMPLE LISTING: "What are the main [items]?"
   Examples: "What are the standard posting keys?", "What are the common document types?"

5. SIMPLE PURPOSE: "What is the purpose of [topic]?"
   Examples: "What is the purpose of a Chart of Accounts?", "What is a Posting Key used for?"

DO NOT use complex questions. Focus on:
- Basic definitions and terminology
- Simple T-codes for common tasks
- Yes/No factual questions
- Simple lists of items
- Basic purpose/function questions`,

      '真实场景问题': `
JUNIOR LEVEL SCENARIO QUESTIONS - VERY BASIC OPERATIONS

YOU MUST USE THESE DIFFERENT TOPICS (do NOT deviate):
- ${topicList}

KEEP IT SIMPLE - Use ONLY these basic question formats:
1. SIMPLE OPERATION: "To [simple task], which T-code?"
   Examples: "To post a vendor invoice, which T-code?", "To create a GL account, which T-code?"

2. BASIC ERROR: "You see error [X]. What do you do?"
   Examples: "Error: Posting period closed. What T-code opens it?"

3. SIMPLE PREREQUISITE: "Before [task], what must exist?"
   Examples: "Before creating an asset, what master data is needed?"

4. SINGLE STEP: "What is the first step to [task]?"
   Examples: "What is the first step to post a document?"

DO NOT use complex scenarios. Focus on:
- Single-step operations
- Common error resolution
- Basic prerequisites`,

      '项目经验': `
JUNIOR LEVEL PROJECT EXPERIENCE - SIMPLE FACTUAL

Use ONLY these simple factual question formats:
- "What SAP modules were in your project?"
- "What testing did you perform?"
- "What documentation did you write?"
- "What tools did you use?"

DO NOT ask about:
- Leadership roles
- Complex challenges
- Decision-making
- Architectural choices`,

      '自我介绍': `
JUNIOR LEVEL SELF-INTRODUCTION - SIMPLE FACTS

Use ONLY these simple factual question formats:
- "What is your educational background?"
- "What SAP certifications do you have?"
- "What SAP FICO training have you completed?"
- "What computer skills do you have?"
- "What languages do you speak?"

DO NOT ask about:
- Complex career goals
- Leadership philosophy
- Strategic thinking`,

      '反问环节': `
CANDIDATE QUESTIONS - SIMPLE FACTUAL

Generate simple questions about:
- SAP version used
- Training provided
- Team size
- Project duration
- Industries served`
    }

    return guidelines[stage] || ''
  }

  private buildQuestionGenerationPrompt(
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    stage: string,
    count: number,
    jobRequirements: any,
    sessionId: string
  ): string {
    const industryName = this.getIndustryName(industry)
    const stageMapping: Record<string, string> = {
      '自我介绍': 'Self Introduction',
      '项目经验': 'Project Experience',
      '技术问题': 'Technical Questions',
      '真实场景问题': 'Scenario-based Questions',
      '反问环节': 'Candidate Questions'
    }

    const englishStage = stageMapping[stage] || stage

    // Get unused topics for this generation
    const selectedTopics = this.getUnusedTopics(count)

    // Add junior level specific guidelines
    let levelGuidance = ''
    if (jobLevel === 'junior') {
      levelGuidance = '\n\n' + this.getJuniorLevelGuidelines(stage, selectedTopics) + '\n\n'
    }

    return `You are a professional SAP FICO interviewer generating ${count} questions for a ${jobLevel} level consultant.

TARGET: ${industryName} industry | Stage: ${englishStage}${levelGuidance}

CRITICAL UNIQUENESS REQUIREMENTS:
- Session ID: ${sessionId}
- Timestamp: ${Date.now()}
- Random: ${Math.random().toString(36)}

FORBIDDEN QUESTIONS (do NOT use these - too complex for junior):
- "What is the difference between X and Y?" (TOO HARD)
- "How does X affect Y?" (TOO HARD)
- "What are the key steps to configure X?" (TOO HARD)
- Troubleshooting with multiple causes (TOO HARD)

PREFERRED SIMPLE QUESTIONS:
- "What is [X]?"
- "Which T-code is used for [X]?"
- "Is [fact] true or false?"
- "What are the main [items]?"
- "What is the purpose of [X]?"

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "q_${Date.now()}_1",
      "englishQuestion": "Your simple question here?",
      "chineseTranslation": "中文翻译",
      "difficulty": "basic",
      "competencies": ["competency"],
      "expectedAnswerKeywords": ["keyword1", "keyword2"],
      "stage": "${stage}"
    }
  ]
}

Generate ${count} UNIQUE, SIMPLE questions NOW! Each question must be different from all previous questions.`
  }

  private getIndustryName(industry: FICOIndustry): string {
    const industryNames: Record<FICOIndustry, string> = {
      manufacturing: 'Manufacturing',
      retail: 'Retail/E-commerce',
      finance: 'Financial Services',
      energy: 'Energy & Chemicals',
      pharma: 'Pharmaceuticals',
      technology: 'Technology',
      logistics: 'Logistics',
      public: 'Public Sector',
      realestate: 'Real Estate',
      other: 'Other'
    }
    return industryNames[industry]
  }

  async generateQuestions(
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    stage: string,
    count: number,
    useCache = true
  ): Promise<AIInterviewQuestion[]> {
    // Unique cache key - no reuse for junior
    const cacheKey = this.getCacheKey(jobLevel, industry, stage)

    if (useCache && this.questionCache.has(cacheKey)) {
      return this.questionCache.get(cacheKey)!
    }

    try {
      const config = await dataLoader.loadConfig()
      const jobReqs = (config as any).jobLevels?.[jobLevel]

      if (!jobReqs) {
        throw new Error(`Job requirements not found for level: ${jobLevel}`)
      }

      // Generate unique session ID
      const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      const prompt = this.buildQuestionGenerationPrompt(
        jobLevel,
        industry,
        stage,
        count,
        jobReqs,
        sessionId
      )

      // Enhanced system prompt for junior level - SIMPLIFIED
      const systemPrompt = jobLevel === 'junior'
        ? `You are an SAP FICO interviewer for JUNIOR positions (0-2 years).

GENERATE SIMPLE, BASIC QUESTIONS ONLY.

ALLOWED QUESTION FORMATS (simple):
1. "What is [X]?" - Definition questions
2. "Which T-code is used for [X]?" - T-code identification
3. "Is [statement] true?" - Yes/No questions
4. "What are the main [X]?" - Simple listing questions
5. "What is the purpose of [X]?" - Purpose questions

FORBIDDEN (too complex for junior):
- "What is the difference..." questions
- "How does X affect Y..." questions
- "What are the steps to configure..." questions
- Multi-part questions
- Troubleshooting questions

SCORE EXPECTATIONS: For junior level, questions should test BASIC KNOWLEDGE only:
- Company Code, Chart of Accounts, Document Type, Posting Key, Fiscal Year
- Simple T-codes like F-02, FB60, OB52, FS00, XK01
- Basic master data concepts

T-CODE QUESTIONS: Maximum 1 per batch

Output ONLY raw JSON. No markdown.`
        : 'You are an SAP FICO interviewer. Output ONLY raw JSON, no markdown, no explanations.'

      const response = await glmService.callGLM([
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ], 3000)

      // Clean the response
      let cleanedResponse = response.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7)
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3)
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3)
      }
      cleanedResponse = cleanedResponse.trim()

      const result = JSON.parse(cleanedResponse)

      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error('Invalid response format: questions array not found')
      }

      console.log(`[AI Question Generator] AI returned ${result.questions.length} questions for stage ${stage} (requested ${count})`)

      const questions: AIInterviewQuestion[] = result.questions.map((q: any, index: number) => ({
        id: q.id || `${jobLevel}-${industry}-${stage}-${sessionId}-${index}`,
        englishQuestion: q.englishQuestion || '',
        chineseTranslation: q.chineseTranslation || '',
        difficulty: q.difficulty || 'basic',
        competencies: Array.isArray(q.competencies) ? q.competencies : [],
        expectedAnswerKeywords: Array.isArray(q.expectedAnswerKeywords) ? q.expectedAnswerKeywords : [],
        stage: q.stage || stage
      }))

      // Filter against ALL previously generated questions
      const uniqueQuestions: AIInterviewQuestion[] = []
      for (const q of questions) {
        const normalized = q.englishQuestion.toLowerCase()
          .replace(/\bwhat is\b/g, '')
          .replace(/\bwhat are\b/g, '')
          .replace(/\bwhich\b/g, '')
          .replace(/\?/g, '')
          .trim()

        if (!this.generatedQuestions.has(normalized)) {
          this.generatedQuestions.add(normalized)
          uniqueQuestions.push(q)
        }
      }

      // Limit T-code questions to max 1 for junior
      let filteredQuestions = uniqueQuestions
      if (jobLevel === 'junior') {
        const tCodeQuestions: AIInterviewQuestion[] = []
        const nonTCodeQuestions: AIInterviewQuestion[] = []

        for (const q of uniqueQuestions) {
          const question = q.englishQuestion.toLowerCase()
          const isTCodeQuestion = question.includes('t-code') ||
                                 question.includes('tcode') ||
                                 question.includes('transaction code') ||
                                 /f-\d+/.test(q.englishQuestion) ||
                                 /fb\d+/.test(q.englishQuestion) ||
                                 /ob\d+[a-z]?/.test(q.englishQuestion) ||
                                 /fs00|xk01|fd01|mmpv|ovkr/.test(q.englishQuestion.toLowerCase())

          if (isTCodeQuestion) {
            tCodeQuestions.push(q)
          } else {
            nonTCodeQuestions.push(q)
          }
        }

        // Keep all non-T-code questions, plus at most 1 T-code question
        filteredQuestions = [...nonTCodeQuestions]
        if (tCodeQuestions.length > 0) {
          filteredQuestions.unshift(tCodeQuestions[0])
        }

        console.log(`[AI Question Generator] Stage ${stage}: ${uniqueQuestions.length} total, ${tCodeQuestions.length} T-code, ${nonTCodeQuestions.length} non-T-code, filtered to ${filteredQuestions.length}`)
      }

      // Cache the filtered questions
      this.questionCache.set(cacheKey, filteredQuestions)

      return filteredQuestions
    } catch (error) {
      console.error('Failed to generate AI questions:', error)
      throw error
    }
  }

  async generateQuestionsForAllStages(
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    questionsPerStage: number,
    useCache = true
  ): Promise<AIInterviewQuestion[]> {
    const config = await dataLoader.loadConfig()
    const stages = config.interviewConfig.stages
    const jobLevelConfig = (config as any).jobLevels?.[jobLevel]
    const totalQuestionsRequired = jobLevelConfig?.questionsPerSession || 5

    console.log(`[AI Question Generator] generateQuestionsForAllStages: jobLevel=${jobLevel}, industry=${industry}, questionsPerStage=${questionsPerStage}, totalRequired=${totalQuestionsRequired}, stages=${stages.length}`)

    // Never use cache for junior - always fresh
    const shouldUseCache = jobLevel === 'junior' ? false : useCache

    const allQuestions: AIInterviewQuestion[] = []

    // For junior level, generate more questions to ensure we have enough after filtering
    const actualQuestionsPerStage = jobLevel === 'junior'
      ? Math.max(questionsPerStage, Math.ceil(totalQuestionsRequired / stages.length) + 1)
      : questionsPerStage

    console.log(`[AI Question Generator] actualQuestionsPerStage=${actualQuestionsPerStage}`)

    for (const stage of stages) {
      try {
        // Add delay between stages for timestamp variety
        if (jobLevel === 'junior' && allQuestions.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 150))
        }

        const stageQuestions = await this.generateQuestions(
          jobLevel,
          industry,
          stage,
          actualQuestionsPerStage,
          shouldUseCache
        )
        allQuestions.push(...stageQuestions)
      } catch (error) {
        console.error(`Failed to generate questions for stage ${stage}:`, error)
      }
    }

    // Final deduplication across all stages for junior
    if (jobLevel === 'junior') {
      const finalUnique: AIInterviewQuestion[] = []
      const seenPatterns = new Set<string>()

      for (const q of allQuestions) {
        // Create multiple pattern variations for comparison
        const patterns = [
          q.englishQuestion.toLowerCase(),
          q.englishQuestion.toLowerCase().replace(/\bwhat is\b/g, '').replace(/\?/g, '').trim(),
          q.englishQuestion.toLowerCase().replace(/\bwhich\b/g, '').replace(/\?/g, '').trim(),
          q.englishQuestion.toLowerCase().replace(/\bhow does\b/g, '').replace(/\?/g, '').trim()
        ]

        let isDuplicate = false
        for (const pattern of patterns) {
          if (seenPatterns.has(pattern)) {
            isDuplicate = true
            break
          }
        }

        if (!isDuplicate) {
          for (const pattern of patterns) {
            seenPatterns.add(pattern)
          }
          finalUnique.push(q)
        }
      }

      // Ensure we have exactly the required number of questions
      const limitedQuestions = finalUnique.slice(0, totalQuestionsRequired)

      // If we still don't have enough questions, generate additional ones
      if (limitedQuestions.length < totalQuestionsRequired) {
        const additionalNeeded = totalQuestionsRequired - limitedQuestions.length
        console.log(`[AI Question Generator] Only generated ${limitedQuestions.length} questions, need ${totalQuestionsRequired}. Generating ${additionalNeeded} more...`)

        // Try to generate more questions from unused topics
        const remainingStages = stages.filter(stage => stage !== '自我介绍' && stage !== '反问环节')
        const fallbackStage = remainingStages[Math.floor(Math.random() * remainingStages.length)] || '技术问题'

        try {
          const additionalQuestions = await this.generateQuestions(
            jobLevel,
            industry,
            fallbackStage,
            additionalNeeded + 1, // Generate extra to account for possible duplicates
            false // Never use cache for additional questions
          )

          for (const q of additionalQuestions) {
            const normalized = q.englishQuestion.toLowerCase()
              .replace(/\bwhat is\b/g, '')
              .replace(/\bwhat are\b/g, '')
              .replace(/\bwhich\b/g, '')
              .replace(/\?/g, '')
              .trim()

            if (!seenPatterns.has(normalized) && limitedQuestions.length < totalQuestionsRequired) {
              seenPatterns.add(normalized)
              limitedQuestions.push(q)
            }
          }
        } catch (error) {
          console.error('Failed to generate additional questions:', error)
        }
      }

      console.log(`[AI Question Generator] Final question count: ${limitedQuestions.length}/${totalQuestionsRequired}`)
      return limitedQuestions
    }

    return allQuestions
  }

  clearCache(): void {
    this.questionCache.clear()
    this.generatedQuestions.clear()
    this.usedTopicCombinations.clear()
  }

  clearCacheForStage(jobLevel: FICOJobLevel, industry: FICOIndustry, stage: string): void {
    const keysToDelete: string[] = []
    for (const key of this.questionCache.keys()) {
      if (key.startsWith(`${jobLevel}-${industry}`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.questionCache.delete(key))
  }
}

export const aiQuestionGenerator = new AIQuestionGenerator()
