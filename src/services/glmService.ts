import { dataLoader } from './dataLoader'

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface GLMConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

class GLMService {
  private config: GLMConfig | null = null

  private async getConfig(): Promise<GLMConfig> {
    if (!this.config) {
      const appConfig = await dataLoader.loadConfig()
      this.config = {
        apiKey: appConfig.glm?.apiKey || '',
        baseUrl: appConfig.glm?.baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: appConfig.glm?.model || 'glm-4-flash',
        maxTokens: appConfig.glm?.maxTokens || 2000,
        temperature: appConfig.glm?.temperature || 0.7
      }
    }
    return this.config
  }

  async callGLM(messages: GLMMessage[], maxTokens?: number): Promise<string> {
    const config = await this.getConfig()

    if (!config.apiKey) {
      throw new Error('GLM API key is not configured')
    }

    try {
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          max_tokens: maxTokens || config.maxTokens,
          temperature: config.temperature
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`GLM API error: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const data: GLMResponse = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('GLM API call failed:', error)
      throw error
    }
  }

  async callGLMWithRetry(messages: GLMMessage[], maxRetries = 3): Promise<string> {
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.callGLM(messages)
      } catch (error) {
        lastError = error as Error
        console.warn(`GLM API call failed (attempt ${i + 1}/${maxRetries}):`, error)

        // Exponential backoff
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError || new Error('GLM API call failed after retries')
  }

  isConfigured(): Promise<boolean> {
    return this.getConfig().then(config => !!config.apiKey && config.apiKey.length > 0)
  }
}

export const glmService = new GLMService()
