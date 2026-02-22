<template>
  <div class="interview-setup">
    <div class="setup-container">
      <div class="setup-header">
        <h2>模拟面试</h2>
        <p class="subtitle">SAP FICO 实施顾问岗位 - 全英文面试</p>
      </div>

      <div class="setup-content">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          class="info-alert"
        >
          <template #default>
            <div class="alert-content">
              <p>{{ t('mockInterview.interviewRules') }}</p>
              <ul class="rules-list">
                <li>全程英文提问，请用英文回答</li>
                <li>可以选择文字输入或语音回答</li>
                <li>每个问题建议回答时间：1-3分钟</li>
                <li>面试完成后将生成详细点评报告</li>
              </ul>
            </div>
          </template>
        </el-alert>

        <div class="settings-form">
          <div class="form-section">
            <h3>岗位与行业</h3>

            <div class="form-item">
              <label>岗位级别</label>
              <el-radio-group v-model="settings.jobLevel">
                <el-radio value="junior">
                  初级顾问 (0-2年)
                </el-radio>
                <el-radio value="middle">
                  中级顾问 (2-5年)
                </el-radio>
                <el-radio value="senior">
                  高级顾问 (5年+)
                </el-radio>
              </el-radio-group>
            </div>

            <div class="form-item">
              <label>行业方向</label>
              <el-select v-model="settings.industry" placeholder="请选择行业">
                <el-option value="manufacturing" label="制造业" />
                <el-option value="retail" label="零售/电商" />
                <el-option value="finance" label="金融服务" />
                <el-option value="energy" label="能源与化工" />
                <el-option value="pharma" label="医药与生命科学" />
                <el-option value="technology" label="高科技与互联网" />
                <el-option value="logistics" label="物流与运输" />
                <el-option value="public" label="公共部门与教育" />
                <el-option value="realestate" label="房地产与建筑" />
                <el-option value="other" label="其他" />
              </el-select>
            </div>

            <div v-if="selectedJobRequirements" class="job-requirements-preview">
              <div class="requirement-item">
                <span class="label">面试题数：</span>
                <span class="value">{{ selectedJobRequirements.questionsPerSession }}题</span>
              </div>
              <div class="requirement-item">
                <span class="label">每题时长：</span>
                <span class="value">{{ Math.floor(selectedJobRequirements.timePerQuestion / 60) }}分钟</span>
              </div>
            </div>
          </div>
        </div>

        <div class="setup-actions">
          <el-button
            type="primary"
            size="large"
            :icon="VideoPlay"
            @click="startInterview"
          >
            {{ t('mockInterview.startInterview') }}
          </el-button>

          <el-button size="large" @click="$emit('cancel')">
            取消
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import type { FICOJobLevel, FICOIndustry } from '@/types'

const { t } = useI18n()

interface Emits {
  (e: 'start', settings: InterviewSettings): void
  (e: 'cancel'): void
}

interface InterviewSettings {
  jobLevel: FICOJobLevel
  industry: FICOIndustry
}

const settings = ref<InterviewSettings>({
  jobLevel: 'junior',
  industry: 'manufacturing'
})

const jobLevels = ref<Record<string, any>>({})
const industries = ref<Record<string, string>>({})

const selectedJobRequirements = computed(() => {
  return jobLevels.value[settings.value.jobLevel]
})

const emit = defineEmits<Emits>()

onMounted(async () => {
  try {
    const { dataLoader } = await import('@/services/dataLoader')
    const config = await dataLoader.loadConfig()

    // Load job levels and industries
    if ((config as any).jobLevels) {
      jobLevels.value = (config as any).jobLevels
    }
    if ((config as any).industries) {
      industries.value = (config as any).industries
    }
  } catch (error) {
    console.error('Failed to load interview config:', error)
  }
})

function startInterview() {
  emit('start', settings.value)
}
</script>

<style scoped lang="scss">
.interview-setup {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  background: linear-gradient(135deg, $bg-secondary 0%, #e3f2fd 100%);
}

.setup-container {
  max-width: 800px;
  width: 100%;
  background-color: $bg-primary;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  padding: $spacing-2xl;
}

.setup-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  h2 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $primary;
    margin-bottom: $spacing-sm;
  }

  .subtitle {
    font-size: $font-size-lg;
    color: $text-secondary;
    margin: 0;
  }
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.info-alert {
  .alert-content {
    p {
      margin-bottom: $spacing-sm;
    }
  }

  .rules-list {
    margin: 0;
    padding-left: $spacing-lg;

    li {
      margin-bottom: $spacing-xs;
      color: $text-secondary;
    }
  }
}

.settings-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xl;
}

.form-section {
  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.form-item {
  margin-bottom: $spacing-lg;

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
}

.job-requirements-preview {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  border-left: 3px solid $primary;

  .requirement-item {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-sm;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-right: $spacing-sm;
    }

    .value {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $primary;
    }
  }
}

.setup-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  padding-top: $spacing-lg;
  border-top: 1px solid $divider;
}

@media (max-width: 768px) {
  .settings-form {
    grid-template-columns: 1fr;
  }
}
</style>
