import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthState } from '@/types'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState>({
    isAuthenticated: false,
    authToken: null,
    loginTime: null
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => state.value.isAuthenticated)

  // Actions
  async function initialize() {
    isLoading.value = true
    error.value = null

    try {
      await authService.initialize()
      state.value.isAuthenticated = authService.checkAuth()
      state.value.authToken = authService.getToken()
      state.value.loginTime = parseInt(localStorage.getItem('fico_auth_time') || '0')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize auth'
      console.error('Auth initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function login(code: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const success = await authService.validateCode(code)

      if (success) {
        state.value.isAuthenticated = true
        state.value.authToken = authService.getToken()
        state.value.loginTime = Date.now()
        return true
      } else {
        error.value = 'Invalid authorization code'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    authService.logout()
    state.value = {
      isAuthenticated: false,
      authToken: null,
      loginTime: null
    }
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  function checkSession() {
    const isActive = authService.ensureSessionActive()
    if (!isActive && state.value.isAuthenticated) {
      logout()
    }
    return isActive
  }

  return {
    state,
    isLoading,
    error,
    isAuthenticated,
    initialize,
    login,
    logout,
    clearError,
    checkSession
  }
})
