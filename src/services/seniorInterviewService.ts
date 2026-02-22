/**
 * Senior Consultant Interview Service
 *
 * For senior level (高级顾问), we use a fixed set of 5 questions:
 * - 5 questions from different sections (randomly selected from available sections)
 *
 * Questions are selected from the FICO 高级顾问.md document.
 * Evaluation uses AI (Zhipu AI) with reference answers from the document.
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

class SeniorInterviewService {
  private questionsCache: Question[] | null = null
  private usedQuestions: Set<string> = new Set()
  private sectionsMap: Map<string, number> = new Map()

  /**
   * Parse the MD file and extract all questions
   */
  private parseMarkdownFile(content: string): Question[] {
    const questions: Question[] = []

    // Split content into question blocks
    // Each question starts with ### QXX.
    const questionBlocks = content.split(/###\s*Q\d+\.\s*/)
      .filter(block => block.trim())
      .slice(1) // Skip first empty block

    console.log(`[Senior Interview Service] Found ${questionBlocks.length} question blocks`)

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i]
      const lines = block.split('\n').filter(l => l.trim())

      if (lines.length < 5) continue // Skip incomplete blocks

      let section = ''
      let chineseQuestion = ''
      let englishQuestion = ''
      let chineseAnswer = ''
      let englishAnswer = ''

      // Parse each block
      for (let j = 0; j < lines.length; j++) {
        const line = lines[j]

        // Extract section: ## Section Name | English Name
        const sectionMatch = line.match(/^##\s*(.+?)\s*\|\s*(.+)$/)
        if (sectionMatch) {
          section = sectionMatch[1].trim()
          continue
        }

        // Extract Chinese question: **中文问题**
        const chineseQMatch = line.match(/^\*\*(.+?)\*\*$/)
        if (chineseQMatch && !chineseQuestion) {
          chineseQuestion = chineseQMatch[1]
          continue
        }

        // Extract English question (plain text, not bold)
        if (!englishQuestion && line.trim() && !line.startsWith('**') && !line.startsWith('##')) {
          englishQuestion = line.trim()
          continue
        }

        // Extract Chinese answer: starts with **答案：**
        if (line.match(/^\*\*答案[：:]\*\*$/)) {
          // Read all following lines until **Answer:** or separator
          for (let k = j + 1; k < lines.length; k++) {
            const ansLine = lines[k]
            if (ansLine.match(/^\*\*Answer:\*\*$/) || ansLine.startsWith('---') || ansLine.startsWith('###')) {
              break
            }
            if (ansLine.trim()) {
              chineseAnswer += (chineseAnswer ? ' ' : '') + ansLine.trim()
            }
          }
          continue
        }

        // Extract English answer: starts with **Answer:**
        if (line.match(/^\*\*Answer:\*\*$/)) {
          // Read all following lines until separator or next question
          for (let k = j + 1; k < lines.length; k++) {
            const ansLine = lines[k]
            if (ansLine.startsWith('---') || ansLine.startsWith('###')) {
              break
            }
            if (ansLine.trim()) {
              englishAnswer += (englishAnswer ? ' ' : '') + ansLine.trim()
            }
          }
          continue
        }
      }

      // Only add complete questions
      if (englishQuestion && section) {
        const questionId = `Q${i + 1}`
        questions.push({
          id: questionId,
          section,
          sectionNumber: 0, // Will be assigned later
          englishQuestion,
          chineseTranslation: chineseQuestion || englishQuestion,
          englishAnswer: englishAnswer || 'No English answer available',
          chineseAnswer: chineseAnswer || '无中文答案'
        })
      }
    }

    // Assign section numbers
    const uniqueSections = Array.from(new Set(questions.map(q => q.section)))
    const sectionNumberMap = new Map<string, number>()
    uniqueSections.forEach((s, idx) => sectionNumberMap.set(s, idx + 1))

    questions.forEach(q => {
      q.sectionNumber = sectionNumberMap.get(q.section) || 1
      this.sectionsMap.set(q.section, q.sectionNumber)
    })

    console.log(`[Senior Interview Service] Parsed ${questions.length} questions from ${uniqueSections.length} sections`)

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
      const urls = [
        '/FICO 高级顾问.md',
        '/FICO%20高级顾问.md',
        encodeURIComponent('/FICO 高级顾问.md'),
        '/fico-senior-consultant.md'
      ]

      let response: Response | null = null
      let lastError: Error | null = null

      for (const url of urls) {
        try {
          console.log(`[Senior Interview Service] Trying URL: ${url}`)
          response = await fetch(url)
          if (response.ok) {
            console.log(`[Senior Interview Service] Successfully loaded from: ${url}`)
            break
          }
        } catch (e) {
          lastError = e as Error
          console.log(`[Senior Interview Service] Failed to fetch ${url}:`, e)
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to load MD file from all URLs. Last error: ${lastError?.message}`)
      }

      content = await response.text()
      console.log('[Senior Interview Service] MD file content length:', content.length)

    } catch (error) {
      console.error('[Senior Interview Service] Failed to load questions from MD file:', error)
      console.log('[Senior Interview Service] Using fallback questions...')

      this.questionsCache = this.getFallbackQuestions()
      return this.questionsCache
    }

    this.questionsCache = this.parseMarkdownFile(content)

    if (this.questionsCache.length === 0) {
      console.warn('[Senior Interview Service] No questions parsed from MD file, using fallback')
      this.questionsCache = this.getFallbackQuestions()
    }

    console.log(`[Senior Interview Service] Loaded ${this.questionsCache.length} questions`)
    return this.questionsCache
  }

  /**
   * Fallback questions if MD file cannot be loaded
   */
  private getFallbackQuestions(): Question[] {
    return [
      {
        id: 'Q1',
        section: 'FI基础 | FI Fundamentals',
        sectionNumber: 1,
        englishQuestion: 'What is the SAP FI module? What are its main functions?',
        chineseTranslation: '什么是SAP FI模块？它的主要功能是什么？',
        englishAnswer: 'SAP FI (Financial Accounting) is a core SAP ERP module. Key functions include: General Ledger (GL), Accounts Receivable (AR), Accounts Payable (AP), Asset Accounting (AA), and Bank Accounting (BA). It records all financial transactions, generates statutory financial statements, supports external reporting, and integrates with other modules like MM and SD.',
        chineseAnswer: 'SAP FI（财务会计）模块是SAP ERP的核心模块之一，主要功能包括：总账管理（GL）、应收账款（AR）、应付账款（AP）、资产会计（AA）、银行会计（BA）。它负责记录企业所有财务交易，生成法定财务报告，支持外部财务报告需求，并与其他模块（MM、SD等）高度集成。'
      },
      {
        id: 'Q2',
        section: 'S/4HANA变化 | S/4HANA Changes',
        sectionNumber: 2,
        englishQuestion: 'What are the key differences between SAP ECC and SAP S/4HANA from a FICO perspective?',
        chineseTranslation: '从FICO角度来看，SAP ECC和S/4HANA的主要区别是什么？',
        englishAnswer: 'Key differences include: Universal Journal (ACDOCA) combining FI and CO into a single table, elimination of reconciliation accounts, real-time integration between FI and CO, Material Ledger mandatory, simplified data model, and advanced features like cash management integrated with liquidity management. S/4HANA also introduces Fiori apps for better user experience.',
        chineseAnswer: '主要区别包括：通用分类账（ACDOCA）将FI和CO合并到单个表中，消除对账账户，FI和CO实时集成，物料分类账强制执行，简化的数据模型，以及与流动性管理集成的现金管理等高级功能。S/4HANA还引入了Fiori应用以提供更好的用户体验。'
      },
      {
        id: 'Q3',
        section: '实施经验 | Implementation Experience',
        sectionNumber: 3,
        englishQuestion: 'What are the key steps in SAP FICO implementation?',
        chineseTranslation: 'SAP FICO实施的关键步骤是什么？',
        englishAnswer: 'Key steps include: 1) Blueprint phase - requirement gathering and design, 2) Configuration - setting up organizational structures, master data, and business processes, 3) Testing - unit testing, integration testing, and user acceptance testing, 4) Data migration - migrating legacy data, 5) Training - training end users, 6) Go-live support and cutover activities.',
        chineseAnswer: '关键步骤包括：1）蓝图阶段 - 需求收集和设计，2）配置 - 设置组织结构、主数据和业务流程，3）测试 - 单元测试、集成测试和用户验收测试，4）数据迁移 - 迁移遗留数据，5）培训 - 培训最终用户，6）上线支持和切换活动。'
      },
      {
        id: 'Q4',
        section: '高级配置 | Advanced Configuration',
        sectionNumber: 4,
        englishQuestion: 'What is document splitting in SAP New G/L and why is it important?',
        chineseTranslation: 'SAP新总账中的文档分割是什么，为什么它很重要？',
        englishAnswer: 'Document splitting is a feature in SAP New G/L that splits a single accounting document into multiple line items based on defined splitting criteria (e.g., profit center, segment, business area). It enables true parallel accounting, supports detailed segment reporting, and provides accurate financial statements at any level of the organization. This is essential for modern enterprise reporting and compliance requirements.',
        chineseAnswer: '文档分割是SAP新总账中的一项功能，它根据定义的分割标准（如利润中心、段、业务范围）将单个会计凭证分割成多个行项目。它实现了真正的并行会计，支持详细的分段报告，并提供组织任何级别的准确财务报表。这对于现代企业报告和合规要求至关重要。'
      },
      {
        id: 'Q5',
        section: '场景问题 | Scenario Questions',
        sectionNumber: 5,
        englishQuestion: 'A user reports that they cannot post to a G/L account. What are the possible reasons and how would you troubleshoot?',
        chineseTranslation: '用户报告他们无法向总账科目过账。可能的原因是什么，您会如何故障排除？',
        englishAnswer: 'Possible reasons include: 1) G/L account is not created for the specific company code, 2) Posting period is closed, 3) Field status group prohibits posting to that account, 4) Account is marked for deletion, 5) User lacks authorization, 6) Document type does not allow that account type. Troubleshooting should check these configurations systematically, using transaction codes FS00 (account master), OB52 (posting periods), and OBYC (automatic account determination).',
        chineseAnswer: '可能的原因包括：1）总账科目未为特定公司代码创建，2）过账期间已关闭，3）字段状态组禁止向该科目过账，4）科目标记为删除，5）用户缺乏授权，6）凭证类型不允许该科目类型。故障排除应系统地检查这些配置，使用事务代码FS00（科目主数据）、OB52（过账期间）和OBYC（自动科目确定）。'
      }
    ]
  }

  /**
   * Get section name by number
   */
  private getSectionName(sectionNumber: number): string {
    for (const [name, num] of this.sectionsMap.entries()) {
      if (num === sectionNumber) {
        return name
      }
    }
    return `Section ${sectionNumber}`
  }

  /**
   * Get stage name based on section
   */
  private getStageBySection(sectionNumber: number): string {
    return '技术问题'
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Generate 5 questions for senior level interview
   * - 5 questions from different sections (randomly selected)
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
    console.log('[Senior Interview Service] Questions per section:')
    for (const [sectionNum, questions] of questionsBySection.entries()) {
      console.log(`  Section ${sectionNum} (${this.getSectionName(sectionNum)}): ${questions.length} questions`)
    }

    const selectedQuestions: InterviewQuestion[] = []

    // Get all available sections
    const availableSections = Array.from(questionsBySection.keys())
    console.log('[Senior Interview Service] Available sections:', availableSections.length)

    if (availableSections.length < 5) {
      throw new Error(`Not enough sections with questions. Found ${availableSections.length} sections, need at least 5.`)
    }

    // Randomly select 5 different sections
    const selectedSections = this.shuffleArray(availableSections).slice(0, 5)
    console.log('[Senior Interview Service] Selected sections:', selectedSections.map(s => this.getSectionName(s)))

    // Select one question from each selected section
    for (const sectionNumber of selectedSections) {
      const sectionQuestions = questionsBySection.get(sectionNumber) || []
      const availableQuestions = sectionQuestions.filter(q => !this.usedQuestions.has(q.id))

      const questionPool = availableQuestions.length > 0 ? availableQuestions : sectionQuestions

      if (questionPool.length === 0) {
        console.error(`[Senior Interview Service] No questions available for section ${sectionNumber}`)
        continue
      }

      const selectedQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]

      if (!selectedQuestion) {
        console.error(`[Senior Interview Service] Failed to select question from section ${sectionNumber}`)
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

    console.log(`[Senior Interview Service] Generated ${selectedQuestions.length} questions`)

    // Return questions in the order they were selected (by section order, not shuffled)
    return selectedQuestions
  }

  /**
   * Reset used questions cache (for new interview session)
   */
  resetUsedQuestions(): void {
    this.usedQuestions.clear()
  }
}

// Export singleton instance
export const seniorInterviewService = new SeniorInterviewService()

// Export types for use in other files
export type { Question, InterviewQuestion }
