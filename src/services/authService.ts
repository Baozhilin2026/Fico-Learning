import type { AppConfig } from '@/types'
import { dataLoader } from './dataLoader'

const AUTH_TOKEN_KEY = 'fico_auth_token'
const AUTH_TIME_KEY = 'fico_auth_time'

class AuthService {
  private authorizedCodes: string[] = []
  private isAuthenticated = false

  async initialize(): Promise<void> {
    try {
      const config = await dataLoader.loadConfig()
      this.authorizedCodes = config.authorizationCodes

      // Check if user has valid session
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const storedTime = localStorage.getItem(AUTH_TIME_KEY)

      if (storedToken && storedTime) {
        const loginTime = parseInt(storedTime)
        const sessionAge = Date.now() - loginTime
        const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours

        // Session is only valid for current browser session
        if (sessionAge < maxSessionAge && sessionStorage.getItem('fico_session_active') === 'true') {
          this.isAuthenticated = true
        } else {
          this.clearAuth()
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error)
    }
  }

  // Validate authorization code (direct comparison)
  async validateCode(code: string): Promise<boolean> {
    try {
      await this.initialize()
      const trimmedCode = code.trim()
      const isValid = this.authorizedCodes.includes(trimmedCode)

      if (isValid) {
        this.setAuthSession(trimmedCode)
      }

      return isValid
    } catch (error) {
      console.error('Authorization validation failed:', error)
      return false
    }
  }

  // Set authentication session
  private setAuthSession(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_TIME_KEY, Date.now().toString())
    sessionStorage.setItem('fico_session_active', 'true')
    this.isAuthenticated = true
  }

  // Check if user is authenticated
  checkAuth(): boolean {
    return this.isAuthenticated && (
      sessionStorage.getItem('fico_session_active') === 'true'
    )
  }

  // Get current auth token
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }

  // Clear authentication
  clearAuth(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_TIME_KEY)
    sessionStorage.removeItem('fico_session_active')
    this.isAuthenticated = false
  }

  // Logout
  logout(): void {
    this.clearAuth()
  }

  // Check if session is active (for tab close detection)
  ensureSessionActive(): boolean {
    const isActive = sessionStorage.getItem('fico_session_active') === 'true'
    if (!isActive && this.isAuthenticated) {
      this.clearAuth()
    }
    return isActive
  }
}

export const authService = new AuthService()
