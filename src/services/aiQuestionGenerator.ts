import { glmService } from './glmService'
import { dataLoader } from './dataLoader'
import type { FICOJobLevel, FICOIndustry, AIInterviewQuestion } from '@/types'

class AIQuestionGenerator {
  private questionCache = new Map<string, AIInterviewQuestion[]>()

  private getCacheKey(jobLevel: FICOJobLevel, industry: FICOIndustry, stage: string): string {
    return `${jobLevel}-${industry}-${stage}`
  }

  private getJuniorLevelGuidelines(stage: string): string {
    const guidelines: Record<string, string> = {
      '技术问题': `
JUNIOR LEVEL FOCUS - Questions MUST be basic and foundational:

PRIORITY TOPICS (Focus 70% of questions here):
1. BASIC CONCEPTS: Company code, Chart of Accounts, Document types, Posting keys, Fiscal year variant
2. BASIC CONFIGURATION: Account determination, Posting period variant, Depreciation key setup
3. DOCUMENTATION SKILLS: Test script writing, Configuration documentation, Simple error analysis
4. CORE PROCESS UNDERSTANDING: P2P (Procure to Pay), O2C (Order to Cash), Asset depreciation basics

ALLOWED QUESTION TYPES:
- "What is [concept]?" - Definition questions
- "How do you configure [basic setting]?" - Step-by-step configuration questions
- "What is the purpose of [T-code]?" - Transaction code purpose questions
- "Can you explain the difference between [X] and [Y]?" - Simple comparison questions
- "How do you handle [simple error scenario]?" - Basic troubleshooting questions

AVOID (Too advanced for junior):
- Complex integration scenarios
- Advanced configuration with multiple dependencies
- Production support/issue resolution
- Migration/Cutover activities
- Performance optimization
- Complex business scenarios requiring deep analysis

DIFFICULTY: ALL questions must be "basic" level difficulty`,

      '真实场景问题': `
JUNIOR LEVEL FOCUS - Simple, practical scenarios:

SCENARIO TYPES (Keep scenarios simple and straightforward):
1. SIMPLE OPERATIONS: Vendor invoice posting, Asset master creation, Cost center maintenance
2. BASIC CONFIGURATION: Setting up a new GL account, Configuring document posting period
3. DOCUMENTATION: Writing a test script for basic scenarios, Documenting configuration steps
4. SIMPLE ERRORS: Posting errors due to period lock, Account determination errors, Document type issues

EXAMPLE SIMPLE SCENARIOS:
- "A vendor invoice cannot be posted because the posting period is closed. What do you check?"
- "You need to create a new G/L account. What information do you need?"
- "How do you write a test script for vendor invoice posting?"
- "What configuration is needed before creating an asset master record?"

DIFFICULTY: ALL scenarios must be "basic" - solvable with standard SAP knowledge`,

      '项目经验': `
JUNIOR LEVEL FOCUS - Learning and support experience:

ACCEPTABLE PROJECT TOPICS:
- Assisting in configuration tasks under supervision
- Writing test scripts and execution
- Creating or updating configuration documentation
- Participating in data migration preparation
- Supporting UAT (User Acceptance Testing)
- Learning from senior consultants

QUESTION EXAMPLES:
- "What was your role in the FICO implementation project?"
- "Have you written test scripts? Can you describe the process?"
- "What configuration tasks have you assisted with?"
- "How do you document your configuration work?"`,

      '自我介绍': `
JUNIOR LEVEL FOCUS - Career start and learning:

SUGGESTED QUESTIONS:
- "Please introduce yourself briefly."
- "Why did you choose SAP FICO as your career path?"
- "What SAP FICO topics have you learned so far?"
- "What are your expectations for this junior consultant position?"`,

      '反问环节': `
JUNIOR LEVEL FOCUS - Learning-oriented questions:

This is for candidates to ask questions. Generate candidate questions that show interest in learning:
- Questions about training opportunities
- Questions about team structure and mentorship
- Questions about the technologies they will learn
- Questions about project exposure for junior consultants`
    }

    return guidelines[stage] || ''
  }

  private buildQuestionGenerationPrompt(
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    stage: string,
    count: number,
    jobRequirements: any
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

    // Add junior level specific guidelines
    let levelGuidance = ''
    if (jobLevel === 'junior') {
      levelGuidance = '\n\n' + this.getJuniorLevelGuidelines(stage) + '\n\n'
    }

    // Add randomization hint for variety in generated questions
    const randomVarietyHint = jobLevel === 'junior'
      ? `\n\nIMPORTANT FOR VARIETY: Generate UNIQUE questions each time. Avoid common/template questions. Use different angles, perspectives, and wording. Current timestamp reference: ${Date.now()}.`
      : ''

    return `You are a professional SAP FICO interviewer responsible for generating interview questions for a ${jobLevel} level FICO implementation consultant.

Job Requirements:
- Position: ${jobRequirements.name}
- Experience: ${jobRequirements.experience}
- Technical Skills: ${jobRequirements.competencies?.technical?.join(', ') || 'N/A'}
- Business Skills: ${jobRequirements.competencies?.business?.join(', ') || 'N/A'}
- Project Skills: ${jobRequirements.competencies?.project?.join(', ') || 'N/A'}

Target Industry: ${industryName} (${industry})
Interview Stage: ${englishStage}
Number of Questions Required: ${count}${levelGuidance}${randomVarietyHint}
Please generate ${count} professional interview questions following these guidelines:
1. Questions should be in English and professional
2. Each question should be specific and relevant to the job level and industry
3. Include expected keywords that a good answer should contain
4. Assign appropriate difficulty level (basic/intermediate/advanced)
5. Identify which competencies are being assessed
6. For junior level: Focus on foundational concepts, basic configuration, documentation skills, and simple operational scenarios${jobLevel === 'junior' ? '. All questions must be "basic" difficulty' : ''}

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "unique_id_1",
      "englishQuestion": "Your English question here?",
      "chineseTranslation": "Your Chinese translation here",
      "difficulty": "basic",
      "competencies": ["competency1", "competency2"],
      "expectedAnswerKeywords": ["keyword1", "keyword2", "keyword3"],
      "stage": "${stage}"
    }
  ]
}

Generate ${count} UNIQUE and CREATIVE questions now. Do NOT repeat common questions - be original and specific.${jobLevel === 'junior' ? ' Keep them SIMPLE but vary the wording and angles.' : ''}`
  }

  private getIndustryName(industry: FICOIndustry): string {
    const industryNames: Record<FICOIndustry, string> = {
      manufacturing: 'Manufacturing',
      retail: 'Retail/E-commerce',
      finance: 'Financial Services'
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

      const prompt = this.buildQuestionGenerationPrompt(
        jobLevel,
        industry,
        stage,
        count,
        jobReqs
      )

      // Adjust system prompt for junior level
      const systemPrompt = jobLevel === 'junior'
        ? 'You are a professional SAP FICO interviewer conducting interviews for JUNIOR LEVEL consultants (0-2 years experience). Keep questions SIMPLE and FOUNDATIONAL. Focus on: (1) Basic concepts like company code, chart of accounts, document types, (2) Simple configuration steps, (3) Documentation and testing skills, (4) Basic process understanding. AVOID complex integration, advanced configuration, or production support scenarios. Always respond with valid JSON only, no markdown, no code blocks, no explanations.'
        : 'You are a professional SAP FICO interviewer. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just the raw JSON data.'

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

      // Clean the response - remove markdown code blocks if present
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

      const questions: AIInterviewQuestion[] = result.questions.map((q: any, index: number) => ({
        id: q.id || `${jobLevel}-${industry}-${stage}-${index}`,
        englishQuestion: q.englishQuestion || '',
        chineseTranslation: q.chineseTranslation || '',
        difficulty: q.difficulty || 'intermediate',
        competencies: Array.isArray(q.competencies) ? q.competencies : [],
        expectedAnswerKeywords: Array.isArray(q.expectedAnswerKeywords) ? q.expectedAnswerKeywords : [],
        stage: q.stage || stage
      }))

      // Cache the questions
      this.questionCache.set(cacheKey, questions)

      return questions
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

    // For junior level, always generate fresh questions to avoid repetition
    const shouldUseCache = jobLevel === 'junior' ? false : useCache

    const allQuestions: AIInterviewQuestion[] = []

    for (const stage of stages) {
      try {
        const stageQuestions = await this.generateQuestions(
          jobLevel,
          industry,
          stage,
          questionsPerStage,
          shouldUseCache
        )
        allQuestions.push(...stageQuestions)
      } catch (error) {
        console.error(`Failed to generate questions for stage ${stage}:`, error)
        // Continue with other stages even if one fails
      }
    }

    return allQuestions
  }

  clearCache(): void {
    this.questionCache.clear()
  }

  clearCacheForStage(jobLevel: FICOJobLevel, industry: FICOIndustry, stage: string): void {
    const cacheKey = this.getCacheKey(jobLevel, industry, stage)
    this.questionCache.delete(cacheKey)
  }
}

export const aiQuestionGenerator = new AIQuestionGenerator()
