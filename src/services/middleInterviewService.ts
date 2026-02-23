/**
 * Middle Consultant Interview Service
 *
 * For middle level (中级顾问), we use a fixed set of 7 questions:
 * - 1 question from each of: 财务会计基础、应付账款、应收账款、资产会计、管理会计CO、S4/HANA专题
 * - 1 random question from either 高级主题 or 场景与实践
 *
 * Questions are selected from the FICO 中级顾问.md document.
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

class MiddleInterviewService {
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

    // Section name mapping for middle consultant
    const sectionPatterns: Record<number, RegExp> = {
      1: /^##\s*财务会计基础/,
      2: /^##\s*应付账款/,
      3: /^##\s*应收账款/,
      4: /^##\s*资产会计/,
      5: /^##\s*管理会计/,
      6: /^##\s*S\/?4HANA/,
      7: /^##\s*高级主题/,
      8: /^##\s*场景与实践/
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect section header
      for (const [sectionNum, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          // Save previous question
          if (currentQuestion && currentQuestion.englishQuestion && englishAnswerLines.length > 0) {
            questions.push({
              id: currentQuestion.id,
              section: currentSection,
              sectionNumber: currentSectionNumber,
              englishQuestion: currentQuestion.englishQuestion,
              chineseTranslation: currentQuestion.chineseTranslation,
              englishAnswer: englishAnswerLines.join(' ').trim(),
              chineseAnswer: chineseAnswerLines.join(' ').trim()
            })
          }

          currentSection = line.replace(/^##\s*/, '').split('|')[0].trim()
          currentSectionNumber = parseInt(sectionNum)
          currentQuestion = null
          englishAnswerLines = []
          chineseAnswerLines = []
          break
        }
      }

      // Detect question header
      // Format: ### Q1. What is...?
      const questionMatch = line.match(/^###\s*Q(\d+)\.\s+(.+)/)
      if (questionMatch) {
        // Save previous question
        if (currentQuestion && currentQuestion.englishQuestion && englishAnswerLines.length > 0) {
          questions.push({
            id: currentQuestion.id,
            section: currentSection,
            sectionNumber: currentSectionNumber,
            englishQuestion: currentQuestion.englishQuestion,
            chineseTranslation: currentQuestion.chineseTranslation,
            englishAnswer: englishAnswerLines.join(' ').trim(),
            chineseAnswer: chineseAnswerLines.join(' ').trim()
          })
        }

        currentQuestion = {
          id: questionMatch[1],
          englishQuestion: questionMatch[2].trim(),
          chineseTranslation: ''
        }
        englishAnswerLines = []
        chineseAnswerLines = []

        // Look for Chinese translation on next lines
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j]
          // Look for bold text that's not an answer (Answer/答案)
          if (nextLine.startsWith('**') && !nextLine.includes('Answer') && !nextLine.includes('答案')) {
            // Extract Chinese question from bold text
            const chineseMatch = nextLine.match(/^\*\*(.+?)\*\*$/)
            if (chineseMatch) {
              currentQuestion.chineseTranslation = chineseMatch[1]
              break
            }
          }
        }
        continue
      }

      // Detect English answer
      // Format: **Answer:** Answer...
      const englishAnswerMatch = line.match(/^\*\*Answer:\*\*\s*(.+)$/)
      if (englishAnswerMatch && currentQuestion) {
        englishAnswerLines = [englishAnswerMatch[1]]
        // Continue reading next lines for multi-line answers
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j]
          if (nextLine.startsWith('---') || nextLine.startsWith('### Q') || nextLine.startsWith('##')) {
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
      const chineseAnswerMatch = line.match(/^\*\*答案[：:]\*\*\s*(.+)$/)
      if (chineseAnswerMatch && currentQuestion) {
        chineseAnswerLines = [chineseAnswerMatch[1]]
        // Continue reading next lines for multi-line answers
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j]
          if (nextLine.startsWith('---') || nextLine.startsWith('### Q') || nextLine.startsWith('##')) {
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

    console.log(`[Middle Interview Service] Parsed ${questions.length} questions`)

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
        '/FICO 中级顾问.md',
        '/FICO%20中级顾问.md',
        encodeURI('/FICO 中级顾问.md'),
        '/fico-middle-consultant.md' // English fallback
      ]

      let response: Response | null = null
      let lastError: Error | null = null

      for (const url of urls) {
        try {
          console.log(`[Middle Interview Service] Trying URL: ${url}`)
          response = await fetch(url)
          if (response.ok) {
            console.log(`[Middle Interview Service] Successfully loaded from: ${url}`)
            break
          }
        } catch (e) {
          lastError = e as Error
          console.log(`[Middle Interview Service] Failed to fetch ${url}:`, e)
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to load MD file from all URLs. Last error: ${lastError?.message}`)
      }

      content = await response.text()
      console.log('[Middle Interview Service] MD file content length:', content.length)

    } catch (error) {
      console.error('[Middle Interview Service] Failed to load questions from MD file:', error)
      console.log('[Middle Interview Service] Using fallback questions...')

      // Return fallback questions if MD file cannot be loaded
      this.questionsCache = this.getFallbackQuestions()
      return this.questionsCache
    }

    this.questionsCache = this.parseMarkdownFile(content)

    // If parsing failed or returned no questions, use fallback
    if (this.questionsCache.length === 0) {
      console.warn('[Middle Interview Service] No questions parsed from MD file, using fallback')
      this.questionsCache = this.getFallbackQuestions()
    }

    console.log(`[Middle Interview Service] Loaded ${this.questionsCache.length} questions`)
    return this.questionsCache
  }

  /**
   * Fallback questions if MD file cannot be loaded
   */
  private getFallbackQuestions(): Question[] {
    return [
      // Section 1: 财务会计基础
      {
        id: 'Q1',
        section: '财务会计基础 | FI Fundamentals',
        sectionNumber: 1,
        englishQuestion: 'What does FICO stand for in SAP, and what are its main components?',
        chineseTranslation: 'SAP中FICO代表什么？它的主要组成部分是什么？',
        englishAnswer: 'FICO stands for Financial Accounting (FI) and Controlling (CO). FI handles external financial reporting including General Ledger, Accounts Payable, Accounts Receivable, Asset Accounting, and Bank Accounting. CO handles internal management accounting including Cost Center Accounting, Profit Center Accounting, Internal Orders, and Product Costing.',
        chineseAnswer: 'FICO代表财务会计（FI）和管理会计（CO）。FI负责对外财务报告，包括总账、应付账款、应收账款、资产会计和银行会计。CO负责内部管理会计，包括成本中心会计、利润中心会计、内部订单和产品成本核算。'
      },
      // Section 2: 应付账款
      {
        id: 'Q11',
        section: '应付账款 | Accounts Payable',
        sectionNumber: 2,
        englishQuestion: 'What is the three-way match in SAP and which modules are involved?',
        chineseTranslation: 'SAP中的三向匹配是什么，涉及哪些模块？',
        englishAnswer: 'The three-way match in SAP ensures that the purchase order quantity, goods receipt quantity, and invoice quantity are identical. It involves Materials Management (MM) module for purchase orders and goods receipts, and Financial Accounting (FI) module for invoice verification. The system blocks invoices for payment when there are discrepancies.',
        chineseAnswer: 'SAP中的三向匹配确保采购订单数量、收货数量和发票数量一致。它涉及物料管理（MM）模块的采购订单和收货，以及财务会计（FI）模块的发票验证。当出现差异时，系统会阻止发票付款。'
      },
      // Section 3: 应收账款
      {
        id: 'Q21',
        section: '应收账款 | Accounts Receivable',
        sectionNumber: 3,
        englishQuestion: 'Explain the dunning process in SAP AR.',
        chineseTranslation: '解释SAP应收账款中的催款流程。',
        englishAnswer: 'The dunning process in SAP AR is an automated procedure for sending payment reminders to customers with overdue invoices. It involves defining dunning areas, dunning procedures, dunning levels, and dunning forms. The system generates dunning letters based on overdue days and can block customers from further business if payments are not received.',
        chineseAnswer: 'SAP应收账款中的催款流程是向逾期发票客户发送付款提醒的自动化程序。它涉及定义催款范围、催款程序、催款等级和催款格式。系统根据逾期天数生成催款信，如果未收到付款，可以阻止客户进行进一步业务。'
      },
      // Section 4: 资产会计
      {
        id: 'Q31',
        section: '资产会计 | Asset Accounting',
        sectionNumber: 4,
        englishQuestion: 'What is a Depreciation Area in SAP Asset Accounting?',
        chineseTranslation: 'SAP资产会计中的折旧范围是什么？',
        englishAnswer: 'A Depreciation Area in SAP Asset Accounting defines a specific type of valuation for fixed assets, such as book depreciation, tax depreciation, or group currency depreciation. Each area can have different depreciation calculations and is used for different reporting purposes. A company can define multiple depreciation areas to meet various legal and internal reporting requirements.',
        chineseAnswer: 'SAP资产会计中的折旧范围定义了固定资产的特定估值类型，如账面折旧、税务折旧或集团货币折旧。每个折旧范围可以有不同的折旧计算，用于不同的报告目的。公司可以定义多个折旧范围以满足各种法律和内部报告要求。'
      },
      // Section 5: 管理会计
      {
        id: 'Q41',
        section: '管理会计 | Controlling',
        sectionNumber: 5,
        englishQuestion: 'What is the difference between Cost Center Accounting and Profit Center Accounting?',
        chineseTranslation: '成本中心会计和利润中心会计有什么区别？',
        englishAnswer: 'Cost Center Accounting tracks expenses by responsibility centers within the organization and is used for cost control and overhead allocation. Profit Center Accounting evaluates profit and loss by internal market-oriented units, focusing on both revenues and expenses. While cost centers are expense-focused, profit centers are profit-focused and provide a more comprehensive view of business performance.',
        chineseAnswer: '成本中心会计按组织内的责任中心跟踪费用，用于成本控制和间接费用分配。利润中心会计按内部市场导向单位评估损益，同时关注收入和费用。成本中心侧重于费用，而利润中心侧重于利润，并提供更全面的业务绩效视图。'
      },
      // Section 6: S/4HANA专题
      {
        id: 'Q51',
        section: 'S/4HANA与一般主题 | S/4HANA & General Topics',
        sectionNumber: 6,
        englishQuestion: 'What are the key differences between SAP ECC and SAP S/4HANA from a FICO perspective?',
        chineseTranslation: '从FICO角度来看，SAP ECC和S/4HANA的主要区别是什么？',
        englishAnswer: 'Key differences include: Universal Journal (ACDOCA) combining FI and CO into a single table, elimination of reconciliation accounts, real-time integration between FI and CO, Material Ledger mandatory, simplified data model, and advanced features like cash management integrated with liquidity management. S/4HANA also introduces Fiori apps for better user experience.',
        chineseAnswer: '主要区别包括：通用分类账（ACDOCA）将FI和CO合并到单个表中，消除对账账户，FI和CO实时集成，物料分类账强制执行，简化的数据模型，以及与流动性管理集成的现金管理等高级功能。S/4HANA还引入了Fiori应用以提供更好的用户体验。'
      },
      // Section 7: 高级主题
      {
        id: 'Q66',
        section: '高级主题 | Advanced Topics',
        sectionNumber: 7,
        englishQuestion: 'What is foreign currency revaluation in SAP FI?',
        chineseTranslation: 'SAP FI中的外币重估是什么？',
        englishAnswer: 'Foreign currency revaluation in SAP FI is the process of revaluing open items (AR/AP) and G/L account balances in foreign currencies at the current exchange rate. This is typically done at month-end to reflect exchange rate fluctuations in the financial statements. The system automatically posts revaluation gain/loss documents and can reverse them in the next period.',
        chineseAnswer: 'SAP FI中的外币重估是按当前汇率重新评估外币开放项目（应收/应付）和总账科目余额的过程。这通常在月末进行，以在财务报表中反映汇率波动。系统自动过账重估损益凭证，并可以在下一期间冲销它们。'
      },
      // Section 8: 场景与实践
      {
        id: 'Q81',
        section: '场景与实践 | Scenario-Based & Practical',
        sectionNumber: 8,
        englishQuestion: 'A user reports that they cannot post to a G/L account. What are the possible reasons?',
        chineseTranslation: '用户报告他们无法向总账科目过账。可能的原因是什么？',
        englishAnswer: 'Possible reasons include: 1) G/L account is not created for the specific company code; 2) Posting period is closed; 3) Field status group prohibits posting to that account; 4) Account is marked for deletion; 5) User lacks authorization; 6) Document type does not allow that account type. Troubleshooting should check these configurations systematically.',
        chineseAnswer: '可能的原因包括：1）总账科目未为特定公司代码创建；2）过账期间已关闭；3）字段状态组禁止向该科目过账；4）科目标记为删除；5）用户缺乏授权；6）凭证类型不允许该科目类型。故障排除应系统地检查这些配置。'
      }
    ]
  }

  /**
   * Get section name by number
   */
  private getSectionName(sectionNumber: number): string {
    const sectionNames: Record<number, string> = {
      1: '财务会计基础 | FI Fundamentals',
      2: '应付账款 | Accounts Payable',
      3: '应收账款 | Accounts Receivable',
      4: '资产会计 | Asset Accounting',
      5: '管理会计 | Controlling',
      6: 'S/4HANA与一般主题 | S/4HANA & General Topics',
      7: '高级主题 | Advanced Topics',
      8: '场景与实践 | Scenario-Based & Practical'
    }
    return sectionNames[sectionNumber] || `Section ${sectionNumber}`
  }

  /**
   * Get stage name based on section
   */
  private getStageBySection(sectionNumber: number): string {
    if (sectionNumber <= 6) return '技术问题'
    return '场景与实践'
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
   * Generate 7 questions for middle level interview
   * - 1 question from each of sections 1-6 (fixed sections)
   * - 1 random question from either section 7 or 8
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
    console.log('[Middle Interview Service] Questions per section:')
    for (const [sectionNum, questions] of questionsBySection.entries()) {
      console.log(`  Section ${sectionNum}: ${questions.length} questions`)
    }

    const selectedQuestions: InterviewQuestion[] = []

    // Select 1 question from each of sections 1-6 (fixed sections)
    for (let sectionNumber = 1; sectionNumber <= 6; sectionNumber++) {
      const sectionQuestions = questionsBySection.get(sectionNumber) || []
      const availableQuestions = sectionQuestions.filter(q => !this.usedQuestions.has(q.id))

      const questionPool = availableQuestions.length > 0 ? availableQuestions : sectionQuestions

      if (questionPool.length === 0) {
        console.error(`[Middle Interview Service] No questions available for section ${sectionNumber}`)
        continue
      }

      const selectedQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]

      if (!selectedQuestion) {
        console.error(`[Middle Interview Service] Failed to select question from section ${sectionNumber}`)
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

    // Select 1 random question from either section 7 (Advanced Topics) or 8 (Scenario-Based)
    const randomSection = Math.random() < 0.5 ? 7 : 8
    const sectionQuestions = questionsBySection.get(randomSection) || []
    const availableQuestions = sectionQuestions.filter(q => !this.usedQuestions.has(q.id))

    const questionPool = availableQuestions.length > 0 ? availableQuestions : sectionQuestions

    if (questionPool.length > 0) {
      const selectedQuestion = questionPool[Math.floor(Math.random() * questionPool.length)]

      if (selectedQuestion) {
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

        console.log(`[Middle Interview Service] Selected random question from section ${randomSection}`)
      }
    }

    console.log(`[Middle Interview Service] Generated ${selectedQuestions.length} questions`)

    // Return questions in section order (not shuffled)
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
export const middleInterviewService = new MiddleInterviewService()

// Export types for use in other files
export type { Question, InterviewQuestion }
