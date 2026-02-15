<template>
  <div class="authorization-page">
    <div class="auth-container">
      <div class="auth-logo">
        <img src="/logo.svg" alt="FICO Learning" class="logo" />
      </div>

      <h1 class="auth-title">SAP FICO English Learning Platform</h1>

      <p class="auth-description">
        {{ t('auth.description') }}
      </p>

      <div class="auth-form">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleSubmit"
        >
          <el-form-item prop="code">
            <el-input
              v-model="form.code"
              type="password"
              :placeholder="t('auth.enterCode')"
              show-password
              size="large"
              clearable
              @keyup.enter="handleSubmit"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-alert
            v-if="error"
            :title="error"
            type="error"
            :closable="false"
            show-icon
            class="auth-error"
          />

          <div class="auth-actions">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleSubmit"
            >
              {{ t('auth.validate') }}
            </el-button>

            <el-button
              size="large"
              @click="handleReset"
            >
              {{ t('auth.reset') }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const formRef = ref<FormInstance>()
const loading = ref(false)
const error = ref('')

const form = reactive({
  code: ''
})

const rules: FormRules = {
  code: [
    { required: true, message: t('auth.codeRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.codeMinLength'), trigger: 'blur' }
  ]
}

onMounted(async () => {
  // No config loading needed
})

async function handleSubmit() {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    error.value = ''

    const success = await authStore.login(form.code)

    if (success) {
      ElMessage.success(t('auth.loginSuccess'))
      router.push('/home')
    } else {
      error.value = t('auth.invalidCode')
    }
  } catch (err) {
    error.value = t('auth.loginError')
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  form.code = ''
  error.value = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
.authorization-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-tertiary 100%);
  padding: $spacing-lg;
}

.auth-container {
  width: 100%;
  max-width: 480px;
  background-color: $bg-primary;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  padding: $spacing-2xl;
  text-align: center;
}

.auth-logo {
  margin-bottom: $spacing-lg;

  .logo {
    width: 80px;
    height: 80px;
  }
}

.auth-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $primary;
  margin-bottom: $spacing-md;
}

.auth-description {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-xl;
  line-height: 1.6;
}

.auth-form {
  margin-bottom: $spacing-lg;

  .el-form-item {
    margin-bottom: $spacing-lg;
  }
}

.auth-error {
  margin-bottom: $spacing-md;
}

.auth-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;

  .el-button {
    min-width: 120px;
  }
}

.auth-footer {
  padding-top: $spacing-lg;
  border-top: 1px solid $divider;
}

@media (max-width: 480px) {
  .auth-container {
    padding: $spacing-lg;
  }

  .auth-title {
    font-size: $font-size-xl;
  }

  .auth-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
