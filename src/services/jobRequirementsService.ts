import { dataLoader } from './dataLoader'
import type { FICOJobLevel, FICOIndustry, JobLevelConfig } from '@/types'

class JobRequirementsService {
  private cache: Map<string, any> = new Map()

  async getJobLevelConfig(jobLevel: FICOJobLevel): Promise<JobLevelConfig | null> {
    const cacheKey = `jobLevel-${jobLevel}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const config = await dataLoader.loadConfig()
      const jobLevels = (config as any).jobLevels

      if (!jobLevels || !jobLevels[jobLevel]) {
        console.warn(`Job level config not found for: ${jobLevel}`)
        return null
      }

      const jobLevelConfig = jobLevels[jobLevel]
      this.cache.set(cacheKey, jobLevelConfig)

      return jobLevelConfig
    } catch (error) {
      console.error('Failed to load job level config:', error)
      return null
    }
  }

  async getAllJobLevels(): Promise<Record<FICOJobLevel, JobLevelConfig>> {
    const cacheKey = 'allJobLevels'

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const config = await dataLoader.loadConfig()
      const jobLevels = (config as any).jobLevels || {}

      this.cache.set(cacheKey, jobLevels)
      return jobLevels
    } catch (error) {
      console.error('Failed to load job levels:', error)
      return {} as Record<FICOJobLevel, JobLevelConfig>
    }
  }

  async getAllIndustries(): Promise<Record<FICOIndustry, string>> {
    const cacheKey = 'allIndustries'

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const config = await dataLoader.loadConfig()
      const industries = (config as any).industries || {}

      this.cache.set(cacheKey, industries)
      return industries
    } catch (error) {
      console.error('Failed to load industries:', error)
      return {} as Record<FICOIndustry, string>
    }
  }

  getIndustryName(industry: FICOIndustry): string {
    const industryNames: Record<FICOIndustry, string> = {
      manufacturing: '制造业',
      retail: '零售/电商',
      finance: '金融服务',
      energy: '能源与化工',
      pharma: '医药与生命科学',
      technology: '高科技与互联网',
      logistics: '物流与运输',
      public: '公共部门与教育',
      realestate: '房地产与建筑',
      other: '其他'
    }
    return industryNames[industry] || industry
  }

  getIndustryEnglishName(industry: FICOIndustry): string {
    const industryNames: Record<FICOIndustry, string> = {
      manufacturing: 'Manufacturing',
      retail: 'Retail/E-commerce',
      finance: 'Financial Services',
      energy: 'Energy & Chemical',
      pharma: 'Pharmaceutical & Life Sciences',
      technology: 'High-Tech & Internet',
      logistics: 'Logistics & Transportation',
      public: 'Public Sector & Education',
      realestate: 'Real Estate & Construction',
      other: 'Other'
    }
    return industryNames[industry] || industry
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const jobRequirementsService = new JobRequirementsService()
