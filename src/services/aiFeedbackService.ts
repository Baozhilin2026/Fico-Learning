import { glmService } from './glmService'
import { dataLoader } from './dataLoader'
import type { FICOJobLevel, FICOIndustry, AIInterviewFeedback, InterviewAnswer } from '@/types'

class AIFeedbackService {
  private feedbackCache = new Map<string, AIInterviewFeedback>()

  private buildEvaluationPrompt(
    question: string,
    answer: string,
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    competencies: string[]
  ): string {
    return `You are a senior SAP FICO interview evaluation expert. Please provide a professional assessment of candidate's interview response.

Interview Question: ${question}
Candidate's Answer: ${answer}
Job Level: ${jobLevel}
Industry: ${industry}
Expected Competencies: ${competencies.join(', ')}

Please evaluate response across three dimensions (score 0-100 for each):

1. English Expression (30%)
   - Grammatical accuracy
   - Fluency and coherence
   - Professional terminology usage

2. FICO Professional Competence (40%)
   - Technical accuracy of FICO concepts
   - Understanding of industry scenarios
   - Usage of key FICO terminology

3. Interview Communication Skills (30%)
   - Completeness of answer
   - Logical structure
   - Use of examples and elaboration

Provide detailed, specific feedback that will help candidate improve.

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "englishExpression": {
    "score": 85,
    "strengths": ["Good grammar structure", "Clear communication"],
    "weaknesses": ["Some pronunciation issues with technical terms"],
    "suggestions": ["Practice pronouncing FICO terminology"]
  },
  "ficoProfessionalism": {
    "score": 75,
    "technicalAccuracy": ["Correct understanding of company code configuration"],
    "industryContext": ["Needs more industry-specific examples"],
    "keywordUsage": ["Used key terms like Company Code, Document Type"]
  },
  "interviewSkills": {
    "score": 80,
    "clarity": ["Answer was clear and direct"],
    "structure": ["Good logical flow"],
    "completeness": ["Covered main aspects thoroughly"]
  },
  "overallScore": 79,
  "aiInsights": {
    "overallAssessment": "The candidate demonstrates solid FICO foundational knowledge...",
    "careerRecommendations": ["Consider gaining more hands-on project experience"],
    "skillGaps": ["Limited exposure to real-world manufacturing scenarios"]
  }
}

Evaluate now.`
  }

  private buildSessionEvaluationPrompt(
    answers: InterviewAnswer[],
    jobLevel: FICOJobLevel,
    industry: FICOIndustry
  ): string {
    // Check if all questions were skipped
    const allSkipped = answers.every(a =>
      !a.answer.trim() ||
      a.answer === '[跳过]' ||
      a.answer === '[Skipped]' ||
      a.answer === '[语音回答]' && !a.audioBlob
    )

    const answeredCount = answers.filter(a =>
      a.answer.trim() &&
      a.answer !== '[跳过]' &&
      a.answer !== '[Skipped]'
    ).length

    const answersText = answers.map((a, i) => {
      let answerStatus = ''
      if (a.answer.trim() === '' || a.answer === '[跳过]' || a.answer === '[Skipped]') {
        answerStatus = '(Skipped)'
      }
      return `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || '[No answer provided]'} ${answerStatus}`
    }).join('\n\n')

    let specialInstructions = ''

    if (allSkipped) {
      specialInstructions = `
SPECIAL SITUATION - ALL QUESTIONS SKIPPED:
The candidate has skipped all ${answers.length} questions in this interview session. This is understandable - interview preparation takes time and courage.

For your evaluation:
- Provide encouraging and constructive feedback
- Acknowledge that starting somewhere is first step to improvement
- Give a moderate baseline score (50-60 range) to allow room for growth
- Focus on learning recommendations and study resources
- Emphasize that practice makes progress
- Be motivational rather than critical
`
    } else if (answeredCount < answers.length / 2) {
      specialInstructions = `
SPECIAL SITUATION - MOST QUESTIONS SKIPPED:
The candidate has only answered ${answeredCount} out of ${answers.length} questions.

For your evaluation:
- Be encouraging and supportive
- Acknowledge questions that were attempted
- Provide constructive guidance for improvement
- Focus on building confidence
`
    }

    // Build JSON template separately to avoid escaping issues
    const jsonTemplate = `{
  "englishExpression": {
    "score": 82,
    "strengths": ["Consistently good grammar", "Professional vocabulary"],
    "weaknesses": ["Occasional hesitation"],
    "suggestions": ["Continue practicing to improve fluency"]
  },
  "ficoProfessionalism": {
    "score": 78,
    "strengths": ["Correctly explained Company Code configuration principles", "Mentioned key integration points"],
    "weaknesses": ["Missing Document Type posting logic details", "Did not cover fiscal year variant handling"],
    "suggestions": ["Study Document Posting configuration in depth", "Practice explaining fiscal year variants"]
  },
  "interviewSkills": {
    "score": 85,
    "clarity": ["Clear and structured responses"],
    "structure": ["Well-organized answers"],
    "completeness": ["Thorough coverage of topics"]
  },
  "overallScore": 81,
  "aiInsights": {
    "overallAssessment": "The candidate shows strong potential as a FICO consultant...",
    "careerRecommendations": ["Focus on gaining more project implementation experience"],
    "skillGaps": ["Consider deepening knowledge in Controlling module"]
  },
  "referenceAnswers": [
    {
      "question": "EXACT text of question 1 from interview",
      "englishAnswer": "A good English answer in 2-3 sentences...",
      "chineseAnswer": "中文参考答案..."
    },
    {
      "question": "EXACT text of question 2 from interview",
      "englishAnswer": "Another good answer...",
      "chineseAnswer": "另一个参考答案..."
    }
  ]
}`

    // Add uniqueness and objectivity instructions for all levels
    let levelSpecificInstructions = ''

    if (jobLevel === 'junior') {
      levelSpecificInstructions = `

JUNIOR LEVEL SPECIFIC INSTRUCTIONS:
- Evaluate FAIRLY based on ACTUAL answer quality - do not be overly harsh or generous
- A score of 70-80 is appropriate for most junior consultants (they are still learning!)
- FICO Professionalism: Compare candidate's answer to reference answer OBJECTIVELY:
  * Award points for correct concepts mentioned, even if explanation is simple
  * Deduct points only for CLEAR technical errors or missing key concepts
  * Do NOT expect expert-level depth from junior consultants
  * Focus on fundamentals: company code, chart of accounts, document types, posting keys
- English Expression: Junior consultants may have grammar issues - focus on clarity and communication
- Interview Skills: Reward effort and structure, not just length of answer
- Provide CONSTRUCTIVE, encouraging feedback that guides improvement`
    } else if (jobLevel === 'middle') {
      levelSpecificInstructions = `

MIDDLE LEVEL SPECIFIC INSTRUCTIONS:
- Expect solid FICO knowledge with practical project experience
- A score of 75-85 is appropriate for middle consultants
- FICO Professionalism: Should demonstrate deeper understanding:
  * Configuration expertise (account determination, posting keys, document types)
  * Integration knowledge (FI-CO, FI-MM, FI-SD)
  * Production support and troubleshooting experience
- English Expression: Should be professional with clear technical communication
- Interview Skills: Answers should be well-structured with specific examples
- Provide specific, actionable feedback for career growth`
    } else if (jobLevel === 'senior') {
      levelSpecificInstructions = `

SENIOR LEVEL SPECIFIC INSTRUCTIONS:
- Expect expert-level FICO knowledge with leadership experience
- A score of 80-90 is appropriate for senior consultants
- FICO Professionalism: Should demonstrate comprehensive expertise:
  * Advanced configuration and optimization
  * Complex integration scenarios and architecture design
  * Project leadership and client management
  * Problem-solving in complex production environments
- English Expression: Should be fluent with precise technical terminology
- Interview Skills: Answers should demonstrate strategic thinking and mentorship experience
- Provide challenging feedback to drive continued excellence`
    }

    const uniquenessHint = `\n\nIMPORTANT FOR OBJECTIVE EVALUATION: Generate UNIQUE, SPECIFIC feedback each time. Current evaluation timestamp: ${Date.now()}. Base scores on ACTUAL answer quality compared to reference answers, not templates.`

    return `You are a senior SAP FICO interview evaluation expert. Please provide a comprehensive professional assessment of candidate's entire interview session.

Job Level: ${jobLevel}
Industry: ${industry}
Total Questions: ${answers.length}
Questions Attempted: ${answeredCount}
${specialInstructions}

Interview Session:
${answersText}

IMPORTANT EVALUATION INSTRUCTIONS:

1. You MUST FIRST generate reference answers for ALL questions, then evaluate FICO Professionalism by DIRECTLY COMPARING the candidate's answers against these reference answers.

2. For FICO Business Professionalism (40% weight), evaluate based on COMPARISON with reference answers:
   - Technical content accuracy: What correct FICO concepts from reference are present/absent in candidate's answer?
   - Key terminology coverage: What essential FICO keywords from reference are present/missing?
   - Completeness of technical points: What key technical points from reference are covered/missing?
   - Industry context relevance: Compared to reference, does the answer address industry-specific considerations?

3. Be OBJECTIVE and SPECIFIC in your feedback - state clearly what was covered vs missing:
   - List technical points from reference answer that ARE present in candidate's answer
   - List key FICO terminology that is MISSING from candidate's answer
   - List technical concepts that are INCORRECTLY explained compared to reference
   - For each feedback point, clearly indicate it came from comparing with reference answer

4. You MUST provide reference answers (2-3 sentences each) in BOTH English and Chinese for EVERY SINGLE QUESTION listed above. These should represent what an ideal ${jobLevel} level FICO consultant in ${industry} industry should answer.

Output ONLY valid JSON in this exact format (no markdown, no code blocks):
${jsonTemplate}

CRITICAL REMEMBER:
- You MUST include referenceAnswers for ALL ${answers.length} questions
- For ficoProfessionalism feedback, base your assessment on DIRECT COMPARISON between candidate's answer and reference answer you generated
- Specify what technical points ARE covered, what are MISSING, what are INCORRECT
- Do not skip any question in referenceAnswers array

5. SCORE OBJECTIVELY based on ACTUAL answer quality:
   - Do NOT use template scores - evaluate each answer on its own merit
   - For junior level: 70-80 is a normal score, 85+ is excellent
   - Vary your scores and feedback based on the specific answers provided
   - If all answers are similar to previous evaluations, STILL evaluate them fairly based on quality
- Generate UNIQUE, SPECIFIC feedback for THIS evaluation session - do not repeat previous evaluations

Evaluate now.`
  }

  private getCacheKey(answer: string, jobLevel: FICOJobLevel, industry: FICOIndustry): string {
    return `${jobLevel}-${industry}-${answer.slice(0, 50)}`
  }

  // Normalize feedback to ensure it has all required fields
  private normalizeFeedback(feedback: any): AIInterviewFeedback {
    // Ensure englishExpression has all required arrays
    if (!feedback.englishExpression.strengths) {
      feedback.englishExpression.strengths = []
    }
    if (!feedback.englishExpression.weaknesses) {
      feedback.englishExpression.weaknesses = []
    }
    if (!feedback.englishExpression.suggestions) {
      feedback.englishExpression.suggestions = []
    }

    // Ensure ficoProfessionalism has all required arrays
    if (!feedback.ficoProfessionalism.strengths) {
      feedback.ficoProfessionalism.strengths = []
    }
    if (!feedback.ficoProfessionalism.weaknesses) {
      feedback.ficoProfessionalism.weaknesses = []
    }
    if (!feedback.ficoProfessionalism.suggestions) {
      feedback.ficoProfessionalism.suggestions = []
    }
    // Combine special arrays into strengths for display
    if (feedback.ficoProfessionalism.technicalAccuracy) {
      feedback.ficoProfessionalism.strengths.push(...feedback.ficoProfessionalism.technicalAccuracy)
    }
    if (feedback.ficoProfessionalism.keywordUsage) {
      feedback.ficoProfessionalism.strengths.push(...feedback.ficoProfessionalism.keywordUsage)
    }

    // Ensure interviewSkills has all required arrays
    if (!feedback.interviewSkills.strengths) {
      feedback.interviewSkills.strengths = []
    }
    if (!feedback.interviewSkills.weaknesses) {
      feedback.interviewSkills.weaknesses = []
    }
    if (!feedback.interviewSkills.suggestions) {
      feedback.interviewSkills.suggestions = []
    }
    // Combine special arrays into strengths for display
    if (feedback.interviewSkills.clarity) {
      feedback.interviewSkills.strengths.push(...feedback.interviewSkills.clarity)
    }
    if (feedback.interviewSkills.structure) {
      feedback.interviewSkills.strengths.push(...feedback.interviewSkills.structure)
    }
    if (feedback.interviewSkills.completeness) {
      feedback.interviewSkills.strengths.push(...feedback.interviewSkills.completeness)
    }

    // Ensure aiInsights exists
    if (!feedback.aiInsights) {
      feedback.aiInsights = {
        overallAssessment: 'Good effort in interview.',
        careerRecommendations: [],
        skillGaps: []
      }
    }
    if (!feedback.aiInsights.careerRecommendations) {
      feedback.aiInsights.careerRecommendations = []
    }
    if (!feedback.aiInsights.skillGaps) {
      feedback.aiInsights.skillGaps = []
    }

    // Ensure referenceAnswers exists
    if (!feedback.referenceAnswers) {
      feedback.referenceAnswers = []
    }

    return feedback
  }

  private getCompetencies(jobLevel: FICOJobLevel): string[] {
    const competencies: Record<FICOJobLevel, string[]> = {
      junior: [
        'Basic FI/CO knowledge',
        'General Ledger',
        'AP/AR basics',
        'Document posting',
        'Basic reporting'
      ],
      middle: [
        'Advanced configuration',
        'Asset Accounting',
        'Controlling (CO)',
        'Cost Center accounting',
        'Product Costing',
        'Module integration'
      ],
      senior: [
        'S/4HANA migration',
        'New General Ledger',
        'Advanced CO-PA',
        'Complex integrations',
        'Strategic planning',
        'Project leadership'
      ]
    }
    return competencies[jobLevel] || competencies.junior
  }

  private ensureAllReferenceAnswers(
    answers: InterviewAnswer[],
    existingReferences: Array<{ question: string; englishAnswer: string; chineseAnswer: string }>,
    jobLevel: FICOJobLevel,
    industry: FICOIndustry
  ): Array<{ question: string; englishAnswer: string; chineseAnswer: string }> {
    const referencesMap = new Map<string, { englishAnswer: string; chineseAnswer: string }>()

    // Add existing references
    existingReferences.forEach(ref => {
      referencesMap.set(ref.question, { englishAnswer: ref.englishAnswer, chineseAnswer: ref.chineseAnswer })
    })

    // Generate fallback for missing questions
    answers.forEach(answer => {
      if (!referencesMap.has(answer.question)) {
        referencesMap.set(answer.question, this.generateFallbackReferenceAnswer(answer.question, jobLevel, industry))
      }
    })

    // Convert back to array preserving order of answers
    return answers.map(answer => ({
      question: answer.question,
      englishAnswer: referencesMap.get(answer.question)!.englishAnswer,
      chineseAnswer: referencesMap.get(answer.question)!.chineseAnswer
    }))
  }

  private generateFallbackReferenceAnswer(
    question: string,
    jobLevel: FICOJobLevel,
    industry: FICOIndustry
  ): { englishAnswer: string; chineseAnswer: string } {
    const jobLevelText = {
      junior: '初级顾问',
      middle: '中级顾问',
      senior: '高级顾问'
    }[jobLevel] || '顾问'

    const industryText = {
      manufacturing: '制造业',
      retail: '零售/电商',
      finance: '金融服务',
      energy: '能源与化工',
      pharma: '医药与生命科学',
      technology: '高科技与互联网',
      logistics: '物流与运输',
      public: '公共部门与教育',
      realestate: '房地产与建筑',
      other: '其他行业'
    }[industry] || '相关行业'

    return {
      englishAnswer: `As a ${jobLevel} level FICO consultant in ${industry} industry, I would explain that ${question.toLowerCase().replace('?', '')} involves understanding core SAP FICO configuration principles and applying them based on business requirements. The key is to demonstrate knowledge of relevant module integration points and industry-specific considerations.`,
      chineseAnswer: `作为${industryText}行业的${jobLevelText}，该问题的核心在于理解SAP FICO的配置原则并根据业务需求进行应用。关键在于展示对相关模块集成点和行业特定考虑因素的理解。建议结合实际项目经验和具体业务场景进行阐述。`
    }
  }

  async evaluateAnswer(
    question: string,
    answer: string,
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    useCache = true
  ): Promise<AIInterviewFeedback> {
    const cacheKey = this.getCacheKey(answer, jobLevel, industry)

    if (useCache && this.feedbackCache.has(cacheKey)) {
      return this.feedbackCache.get(cacheKey)!
    }

    try {
      const competencies = this.getCompetencies(jobLevel)
      const prompt = this.buildEvaluationPrompt(
        question,
        answer,
        jobLevel,
        industry,
        competencies
      )

      const response = await glmService.callGLM([
        {
          role: 'system',
          content: 'You are a professional SAP FICO interview evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just raw JSON data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 3000)

      // Clean up response
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

      const feedback = this.normalizeFeedback(JSON.parse(cleanedResponse))

      // Cache feedback
      this.feedbackCache.set(cacheKey, feedback)

      return feedback
    } catch (error) {
      console.error('Failed to evaluate answer with AI:', error)
      throw error
    }
  }

  async evaluateSession(
    answers: InterviewAnswer[],
    jobLevel: FICOJobLevel,
    industry: FICOIndustry,
    useCache = true
  ): Promise<AIInterviewFeedback> {
    // Disable cache for all levels to ensure fresh, objective evaluation each time
    const shouldUseCache = false

    // For session evaluation, create a cache key based on all answers
    const cacheKey = `${jobLevel}-${industry}-${answers.map(a => a.answer.slice(0, 20)).join('-')}`

    if (shouldUseCache && this.feedbackCache.has(cacheKey)) {
      return this.feedbackCache.get(cacheKey)!
    }

    try {
      const prompt = this.buildSessionEvaluationPrompt(
        answers,
        jobLevel,
        industry
      )

      const response = await glmService.callGLM([
        {
          role: 'system',
          content: 'You are a professional SAP FICO interview evaluator. Always respond with valid JSON only, no markdown formatting, no code blocks, no explanations. Just raw JSON data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 3000)

      // Clean up response
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

      const feedback = this.normalizeFeedback(JSON.parse(cleanedResponse))

      // Ensure all questions have reference answers
      feedback.referenceAnswers = this.ensureAllReferenceAnswers(
        answers,
        feedback.referenceAnswers || [],
        jobLevel,
        industry
      )

      // Cache feedback
      this.feedbackCache.set(cacheKey, feedback)

      return feedback
    } catch (error) {
      console.error('Failed to evaluate session with AI:', error)
      throw error
    }
  }

  clearCache(): void {
    this.feedbackCache.clear()
  }

  // Fallback to rule-based feedback if AI is not available
  async evaluateWithFallback(
    question: string,
    answer: string,
    jobLevel: FICOJobLevel,
    industry: FICOIndustry
  ): Promise<AIInterviewFeedback> {
    try {
      const isConfigured = await glmService.isConfigured()
      if (isConfigured) {
        return await this.evaluateAnswer(question, answer, jobLevel, industry)
      }
    } catch (error) {
      console.warn('AI evaluation failed, using fallback:', error)
    }

    // Fallback to basic rule-based evaluation
    return this.normalizeFeedback(this.getFallbackFeedback(answer, jobLevel))
  }

  private getFallbackFeedback(answer: string, jobLevel: FICOJobLevel): AIInterviewFeedback {
    const wordCount = answer.split(/\s+/).length
    const hasFICOTerms = /\b(SAP|FICO|GL|AP|AR|CO|Company Code|Document|Posting|Fiscal Year|Asset|Cost Center|Profit Center)\b/i.test(answer)

    return {
      englishExpression: {
        score: wordCount > 30 ? 70 : 60,
        strengths: wordCount > 30 ? ['Provided a detailed response'] : ['Attempted to answer'],
        weaknesses: wordCount < 30 ? ['Response could be more detailed'] : [],
        suggestions: ['Consider providing more specific examples']
      },
      ficoProfessionalism: {
        score: hasFICOTerms ? 75 : 50,
        technicalAccuracy: hasFICOTerms ? ['Used FICO terminology'] : ['Could include more technical terms'],
        industryContext: ['Consider adding industry-specific context'],
        keywordUsage: hasFICOTerms ? ['Appropriate terminology usage'] : ['Include more FICO keywords']
      },
      interviewSkills: {
        score: 70,
        clarity: ['Communication was clear'],
        structure: ['Answer had some structure'],
        completeness: ['Answer covered basic points']
      },
      overallScore: hasFICOTerms ? 72 : 60,
      aiInsights: {
        overallAssessment: `The candidate has ${jobLevel} level potential and should continue developing FICO expertise.`,
        careerRecommendations: ['Continue studying FICO modules', 'Gain practical implementation experience'],
        skillGaps: ['Consider deepening technical knowledge', 'Practice explaining complex concepts']
      }
    }
  }
}

export const aiFeedbackService = new AIFeedbackService()
