/**
 * Junior Consultant Interview Service
 *
 * For junior level (初级顾问), we use a fixed set of 6 questions:
 * - 5 questions from Sections 1-10 (one randomly selected from each section)
 * - 1 question from Section 11 (Soft Skills & Career)
 *
 * Questions are selected from the FICO 初级顾问.md document.
 * Evaluation is based on standard answers from the document.
 */

interface Question {
  id: string
  section: string
  sectionNumber: number
  englishQuestion: string
  chineseTranslation: string
  englishAnswer: string
  chineseAnswer: string
}

interface InterviewQuestion {
  id: string
  englishQuestion: string
  chineseTranslation: string
  stage: string
  sectionNumber: number
  sectionName: string
  englishAnswer: string
  chineseAnswer: string
}

interface EvaluationResult {
  englishExpression: {
    score: number
    strengths: string[]
    suggestions: string[]
  }
  ficoProfessionalism: {
    score: number
    strengths: string[]
    suggestions: string[]
  }
  interviewSkills: {
    score: number
    strengths: string[]
    suggestions: string[]
  }
  overallScore: number
  aiInsights: {
    overallAssessment: string
    careerRecommendations: string[]
    skillGaps: string[]
  }
  referenceAnswers: Array<{
    question: string
    englishAnswer: string
    chineseAnswer: string
  }>
}

class JuniorInterviewService {
  private questionsCache: Question[] | null = null
  private usedQuestions: Set<string> = new Set()

  /**
   * Parse the MD file and extract all questions
   */
  private parseMarkdownFile(content: string): Question[] {
    const questions: Question[] = []
    const lines = content.split('\n')

    let currentSection = ''
    let currentSectionNumber = 0
    let currentQuestion: {
      id: string
      englishQuestion: string
      chineseTranslation: string
    } | null = null
    let englishAnswerLines: string[] = []
    let chineseAnswerLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect section header - handles both formats:
      // ## Section 1: General Ledger (GL) / 总账
      const sectionMatch = line.match(/^## Section (\d+):/)
      if (sectionMatch) {
        // Save previous question before changing section
        if (currentQuestion && currentQuestion.englishQuestion && englishAnswerLines.length > 0) {
          questions.push({
            id: `Q${currentQuestion.id}`,
            section: currentSection,
            sectionNumber: currentSectionNumber,
            englishQuestion: currentQuestion.englishQuestion,
            chineseTranslation: currentQuestion.chineseTranslation,
            englishAnswer: englishAnswerLines.join(' ').trim(),
            chineseAnswer: chineseAnswerLines.join(' ').trim()
          })
        }

        currentSectionNumber = parseInt(sectionMatch[1])
        currentSection = line.replace(/^## Section \d+: /, '').replace(/ \/ .*$/, '').trim()
        currentQuestion = null
        englishAnswerLines = []
        chineseAnswerLines = []
        continue
      }

      // Detect question header (Q1, Q2, etc.)
      // Format: ### Q1. What is...?
      const questionMatch = line.match(/^### Q(\d+)\.\s+(.+)$/)
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.englishQuestion && englishAnswerLines.length > 0) {
          questions.push({
            id: `Q${currentQuestion.id}`,
            section: currentSection,
            sectionNumber: currentSectionNumber,
            englishQuestion: currentQuestion.englishQuestion,
            chineseTranslation: currentQuestion.chineseTranslation,
            englishAnswer: englishAnswerLines.join(' ').trim(),
            chineseAnswer: chineseAnswerLines.join(' ').trim()
          })
        }

        const questionNumber = questionMatch[1]

        // Look for Chinese translation on the same line or next line
        let chineseTranslation = ''
        const chineseMatch = line.match(/^### Q\d+\.\s+.+?\s+>\s+(.+)$/)
        if (chineseMatch) {
          chineseTranslation = chineseMatch[1]
        } else {
          // Check next line
          const nextLine = lines[i + 1] || ''
          const nextChineseMatch = nextLine.match(/^>\s+(.+)$/)
          if (nextChineseMatch) {
            chineseTranslation = nextChineseMatch[1]
          }
        }

        currentQuestion = {
          id: questionNumber,
          englishQuestion: questionMatch[2].replace(/\s+>\s+.+$/, '').trim(),
          chineseTranslation: chineseTranslation
        }
        englishAnswerLines = []
        chineseAnswerLines = []
        continue
      }

      // Detect English answer
      // Format: **Answer:** The answer...
      const englishAnswerMatch = line.match(/^\*\*Answer:\*\*\s*(.+)$/)
      if (englishAnswerMatch && currentQuestion) {
        englishAnswerLines = [englishAnswerMatch[1]]
        // Continue reading next lines for multi-line answers
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j]
          if (nextLine.startsWith('**答案：') || nextLine.startsWith('---')) {
            break
          }
          if (nextLine.trim() && !nextLine.startsWith('>')) {
            englishAnswerLines.push(nextLine.trim())
          } else if (nextLine.trim()) {
            break
          }
        }
        continue
      }

      // Detect Chinese answer
      // Format: **答案：** 答案...
      const chineseAnswerMatch = line.match(/^\*\*答案：\*\*\s*(.+)$/)
      if (chineseAnswerMatch && currentQuestion) {
        chineseAnswerLines = [chineseAnswerMatch[1]]
        // Continue reading next lines for multi-line answers
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j]
          if (nextLine.startsWith('---') || nextLine.startsWith('### Q')) {
            break
          }
          if (nextLine.trim() && !nextLine.startsWith('>')) {
            chineseAnswerLines.push(nextLine.trim())
          } else if (nextLine.trim()) {
            break
          }
        }
        continue
      }
    }

    // Save last question
    if (currentQuestion && currentQuestion.englishQuestion && englishAnswerLines.length > 0) {
      questions.push({
        id: `Q${currentQuestion.id}`,
        section: currentSection,
        sectionNumber: currentSectionNumber,
        englishQuestion: currentQuestion.englishQuestion,
        chineseTranslation: currentQuestion.chineseTranslation,
        englishAnswer: englishAnswerLines.join(' ').trim(),
        chineseAnswer: chineseAnswerLines.join(' ').trim()
      })
    }

    console.log(`[Junior Interview Service] Parsed ${questions.length} questions from ${questions.length > 0 ? questions[0].sectionNumber : 0} sections`)

    return questions
  }

  /**
   * Load questions from the MD file
   */
  private async loadQuestions(): Promise<Question[]> {
    if (this.questionsCache) {
      return this.questionsCache
    }

    let content = ''

    try {
      // Try multiple approaches to load the file
      const urls = [
        '/FICO 初级顾问.md',
        '/FICO%20初级顾问.md',
        encodeURI('/FICO 初级顾问.md'),
        '/FICO 初級顧問.md', // Traditional fallback
        '/fico-junior-consultant.md' // English fallback
      ]

      let response: Response | null = null
      let lastError: Error | null = null

      for (const url of urls) {
        try {
          console.log(`[Junior Interview Service] Trying URL: ${url}`)
          response = await fetch(url)
          if (response.ok) {
            console.log(`[Junior Interview Service] Successfully loaded from: ${url}`)
            break
          }
        } catch (e) {
          lastError = e as Error
          console.log(`[Junior Interview Service] Failed to fetch ${url}:`, e)
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to load MD file from all URLs. Last error: ${lastError?.message}`)
      }

      content = await response.text()
      console.log('[Junior Interview Service] MD file content length:', content.length)

    } catch (error) {
      console.error('[Junior Interview Service] Failed to load questions from MD file:', error)
      console.log('[Junior Interview Service] Using fallback questions...')

      // Return fallback questions if MD file cannot be loaded
      this.questionsCache = this.getFallbackQuestions()
      return this.questionsCache
    }

    this.questionsCache = this.parseMarkdownFile(content)

    // If parsing failed or returned no questions, use fallback
    if (this.questionsCache.length === 0) {
      console.warn('[Junior Interview Service] No questions parsed from MD file, using fallback')
      this.questionsCache = this.getFallbackQuestions()
    }

    console.log(`[Junior Interview Service] Loaded ${this.questionsCache.length} questions`)
    return this.questionsCache
  }

  /**
   * Fallback questions if MD file cannot be loaded
   */
  private getFallbackQuestions(): Question[] {
    return [
      // Section 1: General Ledger
      {
        id: 'Q1',
        section: 'General Ledger (GL)',
        sectionNumber: 1,
        englishQuestion: 'What is the General Ledger (GL) in SAP FICO?',
        chineseTranslation: '什么是SAP FICO中的总账（GL）？',
        englishAnswer: 'The General Ledger is the central repository of accounting data in SAP. It records all financial transactions of a company and provides a complete picture of external accounting and accounts.',
        chineseAnswer: '总账是SAP中会计数据的核心储存库，记录公司所有财务交易，提供外部会计的完整概览。'
      },
      {
        id: 'Q2',
        section: 'General Ledger (GL)',
        sectionNumber: 1,
        englishQuestion: 'What is a Company Code in SAP?',
        chineseTranslation: '什么是SAP中的公司代码（Company Code）？',
        englishAnswer: 'A Company Code is the smallest organizational unit for which a complete self-contained set of accounts can be drawn up for external reporting purposes.',
        chineseAnswer: '公司代码是SAP中最小的组织单位，可以为其建立完整独立的帐目用于外部报告。'
      },
      // Section 2: Accounts Payable
      {
        id: 'Q11',
        section: 'Accounts Payable (AP)',
        sectionNumber: 2,
        englishQuestion: 'What is a Vendor Master Record and what does it contain?',
        chineseTranslation: '什么是供应商主记录？它包含哪些内容？',
        englishAnswer: 'A Vendor Master Record stores all information about a vendor. It has three levels: General Data, Company Code Data, and Purchasing Organization Data.',
        chineseAnswer: '供应商主记录存储关于供应商的所有信息，分三个层级：一般数据、公司代码数据和采购组织数据。'
      },
      // Section 3: Accounts Receivable
      {
        id: 'Q21',
        section: 'Accounts Receivable (AR)',
        sectionNumber: 3,
        englishQuestion: 'What is a Customer Master Record in SAP AR?',
        chineseTranslation: 'SAP AR中的客户主记录是什么？',
        englishAnswer: 'A Customer Master Record stores all relevant information about a customer. It is structured in three views: General Data, Company Code Data, and Sales Area Data.',
        chineseAnswer: '客户主记录存储有关客户的所有相关信息，分三个视图：一般数据、公司代码数据和销售区域数据。'
      },
      // Section 4: Asset Accounting
      {
        id: 'Q31',
        section: 'Asset Accounting (FI-AA)',
        sectionNumber: 4,
        englishQuestion: 'What is Asset Accounting (FI-AA) in SAP?',
        chineseTranslation: '什么是SAP中的资产会计（FI-AA）？',
        englishAnswer: 'Asset Accounting is a sub-ledger of the General Ledger that manages fixed assets. It tracks asset acquisition, depreciation, transfers, and retirements.',
        chineseAnswer: '资产会计是总账的子分类账，管理固定资产，追踪资产的购置、折旧、转移和报废。'
      },
      // Section 5: Controlling
      {
        id: 'Q41',
        section: 'Controlling (CO)',
        sectionNumber: 5,
        englishQuestion: 'What is Controlling (CO) in SAP and how does it relate to FI?',
        chineseTranslation: 'SAP中的控制（CO）模块是什么？它与FI的关系是什么？',
        englishAnswer: 'Controlling (CO) handles internal management accounting for decision-making purposes. FI and CO are tightly integrated: FI handles external reporting while CO handles internal reporting.',
        chineseAnswer: '控制（CO）处理用于决策的内部管理会计。FI和CO紧密集成：FI处理外部报告，CO处理内部报告。'
      },
      // Section 6: Integration & Configuration
      {
        id: 'Q51',
        section: 'Integration & Configuration',
        sectionNumber: 6,
        englishQuestion: 'What is the integration between FI and MM (Materials Management)?',
        chineseTranslation: 'FI和MM（物料管理）之间的集成是什么？',
        englishAnswer: 'FI-MM integration occurs through automatic account determination. When goods movements occur in MM, FI documents are automatically created.',
        chineseAnswer: 'FI-MM集成通过自动科目确定实现。当MM中发生货物移动时，自动创建FI凭证。'
      },
      // Section 7: Tax
      {
        id: 'Q61',
        section: 'Tax',
        sectionNumber: 7,
        englishQuestion: 'How does SAP handle tax calculation in FI?',
        chineseTranslation: 'SAP 如何在 FI 中处理税务计算？',
        englishAnswer: 'SAP calculates tax based on tax procedures configured in the system. Tax codes define tax rates and accounts for posting.',
        chineseAnswer: 'SAP 根据系统中配置的税务程序计算税务。税务代码定义了税率和记账科目。'
      },
      // Section 8: Reporting
      {
        id: 'Q71',
        section: 'Reporting',
        sectionNumber: 8,
        englishQuestion: 'What are the main financial reports in SAP FI?',
        chineseTranslation: 'SAP FI 中的主要财务报表有哪些？',
        englishAnswer: 'Main financial reports include Balance Sheet, Profit & Loss Statement, Cash Flow Statement, and Trial Balance.',
        chineseAnswer: '主要财务报表包括资产负债表、损益表、现金流量表和试算平衡表。'
      },
      // Section 9: Implementation
      {
        id: 'Q81',
        section: 'Implementation',
        sectionNumber: 9,
        englishQuestion: 'What are the key steps in SAP FICO implementation?',
        chineseTranslation: 'SAP FICO 实施的关键步骤有哪些？',
        englishAnswer: 'Key steps include blueprint phase, configuration, testing, data migration, training, and go-live support.',
        chineseAnswer: '关键步骤包括蓝图阶段、配置、测试、数据迁移、培训和上线支持。'
      },
      // Section 10: Advanced Topics
      {
        id: 'Q91',
        section: 'Advanced Topics',
        sectionNumber: 10,
        englishQuestion: 'What is the New General Ledger in SAP?',
        chineseTranslation: 'SAP 中的新总账是什么？',
        englishAnswer: 'The New General Ledger provides additional features like document splitting, parallel ledgers, and segment reporting.',
        chineseAnswer: '新总账提供附加功能，如凭证分割、并行分类账和业务分部报告。'
      },
      // Section 11: Soft Skills & Career
      {
        id: 'Q92',
        section: 'Soft Skills & Career',
        sectionNumber: 11,
        englishQuestion: 'Why do you want to work as an SAP FICO consultant?',
        chineseTranslation: '您为什么想成为SAP FICO顾问？',
        englishAnswer: 'SAP FICO combines my interest in finance and technology. It offers continuous learning and creates real business impact.',
        chineseAnswer: 'SAP FICO结合了我对财务和技术的兴趣，提供持续学习的机会并创造真实的业务影响。'
      },
      {
        id: 'Q93',
        section: 'Soft Skills & Career',
        sectionNumber: 11,
        englishQuestion: 'How do you explain a complex SAP concept to a non-technical business user?',
        chineseTranslation: '如何向非技术性业务用户解释复杂的SAP概念？',
        englishAnswer: 'Use analogies from their domain, avoid jargon, use visual aids, and check understanding through questions.',
        chineseAnswer: '使用其领域的类比，避免术语，使用可视化辅助工具，并通过问题确认理解。'
      },
      {
        id: 'Q94',
        section: 'Soft Skills & Career',
        sectionNumber: 11,
        englishQuestion: 'What do you do when you don\'t know the answer to a client\'s question?',
        chineseTranslation: '当您不知道客户问题的答案时，您会怎么做？',
        englishAnswer: 'Be transparent, acknowledge you don\'t know but will find out. Research using SAP Help Portal and follow up promptly.',
        chineseAnswer: '保持透明，承认不知道但会找到答案。通过 SAP 帮助入口研究并及时跟进。'
      }
    ]
  }

  /**
   * Get section name by number
   */
  private getSectionName(sectionNumber: number): string {
    const sectionNames: Record<number, string> = {
      1: 'General Ledger (GL)',
      2: 'Accounts Payable (AP)',
      3: 'Accounts Receivable (AR)',
      4: 'Asset Accounting (FI-AA)',
      5: 'Controlling (CO)',
      6: 'Integration & Configuration',
      7: 'Tax',
      8: 'Reporting',
      9: 'Implementation',
      10: 'Advanced Topics',
      11: 'Soft Skills & Career'
    }
    return sectionNames[sectionNumber] || `Section ${sectionNumber}`
  }

  /**
   * Get stage name based on section
   */
  private getStageBySection(sectionNumber: number): string {
    if (sectionNumber === 11) return '反问环节'
    if (sectionNumber <= 5) return '技术问题'
    return '真实场景问题'
  }

  /**
   * Generate 6 questions for junior level interview
   * - 5 questions from Sections 1-10 (one each, randomly selected)
   * - 1 question from Section 11 (Soft Skills & Career)
   */
  async generateQuestions(): Promise<InterviewQuestion[]> {
    const allQuestions = await this.loadQuestions()

    // Group questions by section
    const questionsBySection = new Map<number, Question[]>()
    for (const question of allQuestions) {
      if (!questionsBySection.has(question.sectionNumber)) {
        questionsBySection.set(question.sectionNumber, [])
      }
      questionsBySection.get(question.sectionNumber)!.push(question)
    }

    // Debug: Log questions per section
    console.log('[Junior Interview Service] Questions per section:')
    for (const [sectionNum, questions] of questionsBySection.entries()) {
      console.log(`  Section ${sectionNum}: ${questions.length} questions`)
    }

    const selectedQuestions: InterviewQuestion[] = []

    // Select 5 sections randomly from Sections 1-10
    // Only select sections that actually have questions
    const availableSections: number[] = []
    for (let i = 1; i <= 10; i++) {
      if (questionsBySection.has(i) && (questionsBySection.get(i)?.length || 0) > 0) {
        availableSections.push(i)
      }
    }

    console.log('[Junior Interview Service] Available sections with questions:', availableSections)

    if (availableSections.length < 5) {
      throw new Error(`Not enough sections with questions. Found ${availableSections.length} sections, need at least 5.`)
    }

    const selectedSections = this.shuffleArray(availableSections).slice(0, 5)
    console.log('[Junior Interview Service] Selected sections:', selectedSections)

    // Select one question from each selected section (prefer unused questions)
    for (const sectionNumber of selectedSections) {
      const sectionQuestions = questionsBySection.get(sectionNumber) || []
      const availableQuestions = sectionQuestions.filter(q => !this.usedQuestions.has(q.id))

      const questionPool = availableQuestions.length > 0 ? availableQuestions : sectionQuestions

      if (questionPool.length === 0) {
        console.error(`[Junior Interview Service] No questions available for section ${sectionNumber}`)
        continue
      }

      const selectedQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]

      if (!selectedQuestion) {
        console.error(`[Junior Interview Service] Failed to select question from section ${sectionNumber}`)
        continue
      }

      this.usedQuestions.add(selectedQuestion.id)

      selectedQuestions.push({
        id: selectedQuestion.id,
        englishQuestion: selectedQuestion.englishQuestion,
        chineseTranslation: selectedQuestion.chineseTranslation,
        stage: this.getStageBySection(selectedQuestion.sectionNumber),
        sectionNumber: selectedQuestion.sectionNumber,
        sectionName: this.getSectionName(selectedQuestion.sectionNumber),
        englishAnswer: selectedQuestion.englishAnswer,
        chineseAnswer: selectedQuestion.chineseAnswer
      })
    }

    // Select 1 question from Section 11 (Soft Skills & Career)
    const section11Questions = questionsBySection.get(11) || []
    const availableSection11 = section11Questions.filter(q => !this.usedQuestions.has(q.id))
    const section11Pool = availableSection11.length > 0 ? availableSection11 : section11Questions

    if (section11Pool.length === 0) {
      throw new Error('No questions available in Section 11 (Soft Skills & Career)')
    }

    const selectedSection11Question = section11Pool[Math.floor(Math.random() * section11Pool.length)]

    if (!selectedSection11Question) {
      throw new Error('Failed to select question from Section 11')
    }

    this.usedQuestions.add(selectedSection11Question.id)

    selectedQuestions.push({
      id: selectedSection11Question.id,
      englishQuestion: selectedSection11Question.englishQuestion,
      chineseTranslation: selectedSection11Question.chineseTranslation,
      stage: '反问环节',
      sectionNumber: 11,
      sectionName: this.getSectionName(11),
      englishAnswer: selectedSection11Question.englishAnswer,
      chineseAnswer: selectedSection11Question.chineseAnswer
    })

    console.log(`[Junior Interview Service] Generated ${selectedQuestions.length} questions`)
    return selectedQuestions
  }

  /**
   * Evaluate answers based on standard answers from MD document
   */
  async evaluateAnswers(
    questions: InterviewQuestion[],
    answers: Array<{ question: string; answer: string }>
  ): Promise<EvaluationResult> {
    console.log('[Junior Interview] evaluateAnswers called')
    console.log('[Junior Interview] Questions:', questions.length)
    console.log('[Junior Interview] Answers:', answers.length)

    // Create a map of questions to their standard answers
    const answerMap = new Map<string, { englishAnswer: string; chineseAnswer: string }>()
    for (const q of questions) {
      answerMap.set(q.englishQuestion, {
        englishAnswer: q.englishAnswer,
        chineseAnswer: q.chineseAnswer
      })
    }

    console.log('[Junior Interview] Answer map size:', answerMap.size)
    console.log('[Junior Interview] Answer map keys:', Array.from(answerMap.keys()).map(k => k.substring(0, 40)))

    let totalEnglishScore = 0
    let totalFicoScore = 0
    let totalInterviewScore = 0
    const allStrengths: string[] = []
    const allWeaknesses: string[] = []
    const allSuggestions: string[] = []
    const referenceAnswers: Array<{ question: string; englishAnswer: string; chineseAnswer: string }> = []

    for (let i = 0; i < answers.length; i++) {
      const answerObj = answers[i]
      const standardAnswer = answerMap.get(answerObj.question)
      const userAnswer = answerObj.answer.trim()

      console.log(`[Junior Interview] Answer ${i + 1}:`, {
        question: answerObj.question,
        questionLength: answerObj.question.length,
        userAnswer: userAnswer,
        userAnswerLength: userAnswer.length,
        hasStandardAnswer: !!standardAnswer,
        isSkipped: userAnswer === '[跳过]' || userAnswer === '[Skipped]' || userAnswer === '[语音回答]' || userAnswer === ''
      })

      // Try to find a matching question by substring if exact match fails
      let matchedStandardAnswer = standardAnswer
      if (!standardAnswer && userAnswer.trim() && userAnswer !== '[跳过]' && userAnswer !== '[Skipped]' && userAnswer !== '[语音回答]') {
        console.log('[Junior Interview] No exact match, trying substring match...')
        for (const [key, value] of answerMap.entries()) {
          if (answerObj.question.includes(key.substring(0, 30)) || key.includes(answerObj.question.substring(0, 30))) {
            console.log('[Junior Interview] Found substring match:', key.substring(0, 40))
            matchedStandardAnswer = value
            break
          }
        }
      }

      referenceAnswers.push({
        question: answerObj.question,
        englishAnswer: matchedStandardAnswer?.englishAnswer || 'No reference answer available',
        chineseAnswer: matchedStandardAnswer?.chineseAnswer || '暂无参考答案'
      })

      // Handle voice answers separately - give encouraging baseline score
      if (userAnswer === '[语音回答]') {
        const voiceBaselineScore = 60 // Encouraging baseline for voice answers
        totalEnglishScore += voiceBaselineScore
        totalFicoScore += voiceBaselineScore
        totalInterviewScore += voiceBaselineScore

        allStrengths.push('Used voice to answer - good practice for communication')
        allSuggestions.push('Consider adding text notes to key points for better evaluation')

        console.log(`[Junior Interview] Answer ${i + 1} was voice answer, given baseline score of ${voiceBaselineScore}`)
        continue
      }

      if (!matchedStandardAnswer || userAnswer === '[跳过]' || userAnswer === '[Skipped]' || userAnswer === '') {
        // Skipped answers get a neutral score
        console.log(`[Junior Interview] Answer ${i + 1} skipped or no standard answer`)
        continue
      }

      // Evaluate based on keyword matching and length
      const evaluation = this.evaluateSingleAnswer(userAnswer, matchedStandardAnswer.englishAnswer)
      console.log(`[Junior Interview] Answer ${i + 1} evaluation:`, evaluation)

      totalEnglishScore += evaluation.englishScore
      totalFicoScore += evaluation.ficoScore
      totalInterviewScore += evaluation.interviewScore

      allStrengths.push(...evaluation.strengths)
      allWeaknesses.push(...evaluation.weaknesses)
      allSuggestions.push(...evaluation.suggestions)
    }

    // Count different types of answers
    const textAnswerCount = answers.filter(a =>
      a.answer.trim() &&
      a.answer !== '[跳过]' &&
      a.answer !== '[Skipped]' &&
      a.answer !== '[语音回答]'
    ).length

    const voiceAnswerCount = answers.filter(a =>
      a.answer === '[语音回答]'
    ).length

    const skippedCount = answers.filter(a =>
      !a.answer.trim() ||
      a.answer === '[跳过]' ||
      a.answer === '[Skipped]'
    ).length

    const answeredCount = textAnswerCount + voiceAnswerCount

    console.log('[Junior Interview] Answer breakdown:', {
      total: answers.length,
      textAnswers: textAnswerCount,
      voiceAnswers: voiceAnswerCount,
      skipped: skippedCount,
      answeredCount
    })

    // If all questions were skipped (no text or voice answers), provide encouraging baseline feedback
    if (answeredCount === 0) {
      console.log('[Junior Interview] All questions skipped, providing baseline feedback')
      return {
        englishExpression: {
          score: 0,
          strengths: ['You took the first step by starting this practice'],
          suggestions: ['Try answering at least one question next time', 'Even a brief answer helps you learn', 'Don\'t worry about being perfect - just start practicing']
        },
        ficoProfessionalism: {
          score: 0,
          strengths: ['You\'re on the right track by exploring FICO interview practice'],
          suggestions: ['Review basic FICO concepts before your next practice', 'Study the reference answers provided below to understand what\'s expected']
        },
        interviewSkills: {
          score: 0,
          strengths: ['Starting the practice is the first step to improvement'],
          suggestions: ['Begin with brief answers if you feel uncertain', 'Practice explaining concepts in simple terms', 'Regular practice builds confidence']
        },
        overallScore: 0,
        aiInsights: {
          overallAssessment: 'Welcome to your SAP FICO learning journey! You\'ve taken an important first step by starting this practice session. Don\'t be discouraged - every expert was once a beginner. The key is to start small. Try answering just one or two questions in your next practice session. Remember that progress comes from practice, not perfection. Review the reference answers below to understand what\'s expected, and you\'ll do better next time!',
          careerRecommendations: [
            'Begin with foundational FICO concepts: Company Code, Chart of Accounts, Document Types',
            'Set a small goal: answer 1-2 questions in your next practice',
            'Review the reference answers to understand the expected format',
            'Focus on learning rather than scoring - each attempt helps you improve'
          ],
          skillGaps: [
            'Ready to start practicing - no prior attempt yet',
            'Encouraged to begin with simple, brief answers',
            'Will benefit from reviewing reference answers before attempting'
          ]
        },
        referenceAnswers
      }
    }

    console.log('[Junior Interview] Processing partial/completed answers')
    console.log(`[Junior Interview] Answered: ${answeredCount}/${answers.length} (Text: ${textAnswerCount}, Voice: ${voiceAnswerCount}), Skipped: ${skippedCount}/${answers.length}`)

    // Special handling for all voice answers
    if (voiceAnswerCount > 0 && textAnswerCount === 0) {
      allStrengths.push('Used voice to answer all questions - good practice for oral communication!')
      allSuggestions.push('Consider adding text notes or key points to help evaluate your FICO knowledge')
      if (voiceAnswerCount === answers.length) {
        allStrengths.push('Completed all questions using voice - excellent commitment to practice!')
      }
    }

    // If some questions were skipped, add encouraging feedback
    if (skippedCount > 0) {
      allStrengths.push(`Attempted ${answeredCount} question${answeredCount > 1 ? 's' : ''}`)
      if (skippedCount > answeredCount) {
        allSuggestions.push('Try to answer more questions next time - even brief answers help you learn')
        allWeaknesses.push(`${skippedCount} question${skippedCount > 1 ? 's were' : ' was'} skipped`)
      } else {
        allSuggestions.push('Good effort attempting the questions - keep it up!')
        allStrengths.push(`Completed ${answeredCount} out of ${answers.length} questions`)
      }
    } else if (textAnswerCount > 0 || voiceAnswerCount === answers.length) {
      allStrengths.push('Completed all questions - excellent effort!')
    }

    const divisor = answeredCount > 0 ? answeredCount : 1

    // Calculate completion ratio and apply score adjustment for skipped questions
    const completionRatio = answeredCount / answers.length
    let scoreAdjustment = 1.0
    if (skippedCount > answeredCount) {
      // More skipped than answered - apply 15% penalty
      scoreAdjustment = 0.85
    } else if (skippedCount > 0) {
      // Some skipped - apply 5% penalty
      scoreAdjustment = 0.95
    }

    const finalEnglishScore = Math.round((totalEnglishScore / divisor) * scoreAdjustment)
    const finalFicoScore = Math.round((totalFicoScore / divisor) * scoreAdjustment)
    const finalInterviewScore = Math.round((totalInterviewScore / divisor) * scoreAdjustment)

    console.log('[Junior Interview] Scoring summary:', {
      totalQuestions: answers.length,
      answeredCount,
      skippedCount,
      completionRatio: `${Math.round(completionRatio * 100)}%`,
      scoreAdjustment,
      divisor,
      rawAvgEnglish: Math.round(totalEnglishScore / divisor),
      rawAvgFico: Math.round(totalFicoScore / divisor),
      rawAvgInterview: Math.round(totalInterviewScore / divisor),
      finalEnglishScore,
      finalFicoScore,
      finalInterviewScore,
      overallScore: Math.round((finalEnglishScore + finalFicoScore + finalInterviewScore) / 3)
    })
    console.log('[Junior Interview] All strengths:', allStrengths)
    console.log('[Junior Interview] All weaknesses:', allWeaknesses)

    console.log('[Junior Interview] Scoring summary:', {
      totalQuestions: answers.length,
      answeredCount,
      skippedCount,
      completionRatio: `${Math.round(completionRatio * 100)}%`,
      scoreAdjustment,
      divisor,
      rawAvgEnglish: Math.round(totalEnglishScore / divisor),
      rawAvgFico: Math.round(totalFicoScore / divisor),
      rawAvgInterview: Math.round(totalInterviewScore / divisor),
      finalEnglishScore,
      finalFicoScore,
      finalInterviewScore,
      overallScore: Math.round((finalEnglishScore + finalFicoScore + finalInterviewScore) / 3)
    })
    console.log('[Junior Interview] All strengths:', allStrengths)
    console.log('[Junior Interview] All weaknesses:', allWeaknesses)

    // Categorize feedback by dimension
    const englishStrengths: string[] = []
    const englishSuggestions: string[] = []
    const ficoStrengths: string[] = []
    const ficoSuggestions: string[] = []
    const interviewStrengths: string[] = []
    const interviewSuggestions: string[] = []

    for (const item of allStrengths) {
      const lower = item.toLowerCase()
      if (lower.includes('voice') || lower.includes('oral') || lower.includes('communication')) {
        interviewStrengths.push(item)
      } else if (lower.includes('fico') || lower.includes('term') || lower.includes('concept') || lower.includes('technical')) {
        ficoStrengths.push(item)
      } else if (lower.includes('answer') || lower.includes('practice') || lower.includes('effort') || lower.includes('attempt')) {
        interviewStrengths.push(item)
      } else {
        englishStrengths.push(item)
      }
    }

    for (const item of allSuggestions) {
      const lower = item.toLowerCase()
      if (lower.includes('voice') || lower.includes('oral') || lower.includes('text notes')) {
        interviewSuggestions.push(item)
      } else if (lower.includes('fico') || lower.includes('term') || lower.includes('reference answer') || lower.includes('study')) {
        ficoSuggestions.push(item)
      } else if (lower.includes('elaborate') || lower.includes('detailed') || lower.includes('word')) {
        englishSuggestions.push(item)
      } else {
        interviewSuggestions.push(item)
      }
    }

    // Add dimension-specific feedback
    if (voiceAnswerCount > 0) {
      interviewStrengths.push('Used voice response - practicing verbal communication is valuable')
      interviewSuggestions.push('Consider summarizing key points in text to reinforce learning')
    }

    if (textAnswerCount > 0) {
      englishStrengths.push('Provided written answers - helps clarify thinking')
    }

    // Ensure each dimension has at least some feedback
    if (englishStrengths.length === 0) {
      englishStrengths.push('Participated in the interview practice')
      englishSuggestions.push('Continue practicing to improve English expression')
    }
    if (ficoStrengths.length === 0) {
      ficoStrengths.push('Engaged with FICO interview questions')
      ficoSuggestions.push('Review reference answers to learn key FICO terminology')
    }
    if (interviewStrengths.length === 0) {
      interviewStrengths.push('Took part in the mock interview session')
      interviewSuggestions.push('Regular practice builds confidence and improves performance')
    }

    return {
      englishExpression: {
        score: finalEnglishScore,
        strengths: this.filterUnique(englishStrengths),
        suggestions: this.filterUnique(englishSuggestions)
      },
      ficoProfessionalism: {
        score: finalFicoScore,
        strengths: this.filterUnique(ficoStrengths),
        suggestions: this.filterUnique(ficoSuggestions)
      },
      interviewSkills: {
        score: finalInterviewScore,
        strengths: this.filterUnique(interviewStrengths),
        suggestions: this.filterUnique(interviewSuggestions)
      },
      overallScore: Math.round((finalEnglishScore + finalFicoScore + finalInterviewScore) / 3),
      aiInsights: {
        overallAssessment: this.generateOverallAssessment(finalFicoScore, answeredCount, answers.length),
        careerRecommendations: this.generateCareerRecommendations(finalFicoScore),
        skillGaps: this.generateSkillGaps(allWeaknesses)
      },
      referenceAnswers
    }
  }

  /**
   * Extract key terms from the standard answer
   * This identifies important FICO terminology that should appear in the user's answer
   */
  private extractKeyTermsFromAnswer(standardAnswer: string): string[] {
    // Common FICO terminology patterns
    const ficoPatterns = [
      /\b(SAP|FICO|FI|CO|MM|SD|PP)\b/gi,
      /\b(company code|chart of accounts|document type|posting period|fiscal year)\b/gi,
      /\b(general ledger|sub-ledger|reconciliation account|balance sheet)\b/gi,
      /\b(accounts payable|accounts receivable|asset accounting|controlling)\b/gi,
      /\b(vendor|customer|master data|transaction|posting|document)\b/gi,
      /\b(cost center|profit center|internal order|cost element)\b/gi,
      /\b(depreciation|asset|valuation|configuration|integration)\b/gi,
      /\b(invoice|payment|dunning|credit memo|debit memo)\b/gi,
      /\b(reporting|closing|accrual|deferral|clearing)\b/gi
    ]

    const keyTerms = new Set<string>()

    // Extract terms using patterns
    for (const pattern of ficoPatterns) {
      const matches = standardAnswer.match(pattern)
      if (matches) {
        matches.forEach(match => keyTerms.add(match.toLowerCase()))
      }
    }

    // Also extract words that are 4+ characters and appear to be technical terms
    // (capitalized words or words with specific endings)
    const words = standardAnswer.toLowerCase().split(/\s+/)
    for (const word of words) {
      // Clean the word
      const cleanWord = word.replace(/[.,;:!?()]/g, '')
      if (cleanWord.length >= 4 && /^[a-z]+$/.test(cleanWord)) {
        // Check if it might be a technical term
        if (
          cleanWord.includes('account') ||
          cleanWord.includes('code') ||
          cleanWord.includes('report') ||
          cleanWord.includes('system') ||
          cleanWord.includes('process') ||
          cleanWord.includes('management') ||
          cleanWord.includes('ledger') ||
          cleanWord.includes('document') ||
          cleanWord.includes('fiscal') ||
          cleanWord.includes('period')
        ) {
          keyTerms.add(cleanWord)
        }
      }
    }

    return Array.from(keyTerms)
  }

  /**
   * Evaluate a single answer against the standard answer
   */
  private evaluateSingleAnswer(userAnswer: string, standardAnswer: string) {
    const userWords = userAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const userAnswerLower = userAnswer.toLowerCase()

    console.log('[Junior Interview] Evaluating answer:', {
      userWords: userWords.length,
      answer: userAnswer.substring(0, 50)
    })

    // Extract key terms from the standard answer for this specific question
    const keyTermsFromStandard = this.extractKeyTermsFromAnswer(standardAnswer)
    console.log('[Junior Interview] Key terms extracted from standard answer:', keyTermsFromStandard.slice(0, 10), `(${keyTermsFromStandard.length} total)`)

    // Check which key terms the user used
    const foundKeyTerms = keyTermsFromStandard.filter(term =>
      userAnswerLower.includes(term.toLowerCase())
    )

    console.log('[Junior Interview] Found key terms in user answer:', foundKeyTerms.length, '/', keyTermsFromStandard.length)

    // Calculate keyword matching ratio
    const keywordRatio = keyTermsFromStandard.length > 0
      ? foundKeyTerms.length / keyTermsFromStandard.length
      : 0

    // Calculate scores with better baseline
    const lengthScore = Math.min(100, Math.max(40, (userWords.length / 15) * 70)) // Min 40, max 100
    const keywordScore = Math.min(100, Math.max(50, keywordRatio * 100)) // 0-100 based on matching ratio

    // English Expression Score: baseline 60 + length bonus
    const englishScore = Math.min(100, Math.max(50, 60 + (lengthScore - 40) * 0.4))

    // FICO Professionalism Score: baseline 50 + keyword matching bonus
    // Higher weight on keyword matching since this measures FICO knowledge
    const ficoScore = Math.min(100, Math.max(50, 50 + keywordScore * 0.5))

    // Interview Skills Score: baseline 60 + length and completeness bonus
    const interviewScore = Math.min(100, Math.max(50, 60 + (lengthScore - 40) * 0.4))

    console.log('[Junior Interview] Scores:', {
      englishScore,
      ficoScore,
      interviewScore,
      keywordRatio: Math.round(keywordRatio * 100) + '%'
    })

    const strengths: string[] = []
    const weaknesses: string[] = []
    const suggestions: string[] = []

    // Generate feedback for English Expression
    if (userWords.length >= 15) {
      strengths.push('Provided a detailed response', 'Good answer length')
    } else if (userWords.length >= 8) {
      strengths.push('Provided a reasonable response')
      weaknesses.push('Could provide more detail in answer')
      suggestions.push('Try to provide more elaborate answers (aim for 15+ words)')
    } else {
      weaknesses.push('Response was too brief')
      suggestions.push('Provide more detailed answers (aim for 15+ words)')
    }

    // Generate feedback for FICO Professionalism
    if (keywordRatio >= 0.5) {
      strengths.push(`Used relevant FICO terminology from the question context`, 'Good understanding of key concepts')
    } else if (keywordRatio > 0) {
      strengths.push('Used some relevant terminology')
      weaknesses.push('Could include more key terms from the question topic')
      suggestions.push('Review the reference answer to identify important terms')
    } else {
      weaknesses.push('Did not use key FICO terminology from the question')
      suggestions.push('Study the reference answer and incorporate key terms in your response')
    }

    if (foundKeyTerms.length > 0) {
      strengths.push(`Used ${foundKeyTerms.length} relevant term${foundKeyTerms.length > 1 ? 's' : ''}`)
    }

    // Generate feedback for Interview Skills
    if (userAnswer.split('.').length >= 2) {
      strengths.push('Answer had good sentence structure')
    }

    if (userWords.length > 0) {
      strengths.push('Attempted to answer the question')
    }

    return {
      englishScore: Math.round(englishScore),
      ficoScore: Math.round(ficoScore),
      interviewScore: Math.round(interviewScore),
      strengths,
      weaknesses,
      suggestions
    }
  }

  /**
   * Generate overall assessment
   */
  private generateOverallAssessment(ficoScore: number, answeredCount: number, totalQuestions: number): string {
    if (answeredCount === 0) {
      return 'Welcome to your SAP FICO learning journey! You\'ve taken an important first step by starting this practice. Don\'t be discouraged - every expert was once a beginner. The key is to keep trying and learning from each practice session. Start small, be patient with yourself, and remember that progress takes time.'
    }

    if (ficoScore >= 80) {
      return 'Excellent performance! You demonstrate strong FICO knowledge and good communication skills. Your answers show solid understanding of key concepts.'
    } else if (ficoScore >= 70) {
      return 'Good effort! You have a solid foundation in FICO concepts. With continued practice and study, you will become a confident consultant.'
    } else if (ficoScore >= 60) {
      return 'You show potential as a FICO consultant. Focus on studying the core concepts and practicing your answers. Remember that this is a learning journey.'
    } else if (ficoScore >= 50) {
      return 'You\'re at the beginning of your SAP FICO journey, which is completely okay! Everyone starts somewhere. The important thing is that you\'re practicing. Focus on learning the basic terminology first, and don\'t be afraid to give brief answers - every attempt helps you improve.'
    } else {
      return 'Keep practicing! Learning SAP FICO takes time and effort. Focus on mastering the basics first - things like Company Code, Chart of Accounts, and Document Types. Review the reference answers and try again. You\'re on the right track!'
    }
  }

  /**
   * Generate career recommendations
   */
  private generateCareerRecommendations(ficoScore: number): string[] {
    if (ficoScore >= 80) {
      return [
        'Consider taking SAP FICO certification exams',
        'Look for opportunities to work on real implementation projects',
        'Mentor junior consultants to reinforce your knowledge'
      ]
    } else if (ficoScore >= 70) {
      return [
        'Continue studying FICO configuration topics',
        'Practice explaining technical concepts to non-technical users',
        'Gain more hands-on experience with SAP transactions'
      ]
    } else {
      return [
        'Focus on mastering basic FICO concepts (GL, AP, AR)',
        'Study the Chart of Accounts and Document Principle',
        'Practice common SAP transaction codes',
        'Take online FICO courses to build foundational knowledge'
      ]
    }
  }

  /**
   * Generate skill gaps
   */
  private generateSkillGaps(weaknesses: string[]): string[] {
    const gapSet = new Set<string>()

    for (const weakness of weaknesses) {
      if (weakness.includes('technical') || weakness.includes('concept')) {
        gapSet.add('Technical knowledge depth')
      }
      if (weakness.includes('terminology') || weakness.includes('terms')) {
        gapSet.add('FICO terminology usage')
      }
      if (weakness.includes('detailed') || weakness.includes('elaborate')) {
        gapSet.add('Answer completeness and detail')
      }
      if (weakness.includes('grammar') || weakness.includes('expression')) {
        gapSet.add('English communication skills')
      }
    }

    return Array.from(gapSet)
  }

  /**
   * Filter to unique strings
   */
  private filterUnique(arr: string[]): string[] {
    const result = Array.from(new Set(arr))
    console.log('[Junior Interview] filterUnique:', {
      inputLength: arr.length,
      outputLength: result.length,
      sample: arr.slice(0, 3)
    })
    return result
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  /**
   * Clear used questions cache
   */
  clearUsedQuestions(): void {
    this.usedQuestions.clear()
  }

  /**
   * Reset the entire service
   */
  reset(): void {
    this.questionsCache = null
    this.usedQuestions.clear()
  }
}

export const juniorInterviewService = new JuniorInterviewService()
export type { InterviewQuestion, EvaluationResult }
