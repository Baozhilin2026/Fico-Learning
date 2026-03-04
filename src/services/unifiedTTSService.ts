import type { TTSSettings } from '@/types'
import { cloudflareTTSService } from './cloudflareTTSService'
import { ttsService } from './ttsService'

class UnifiedTTSService {
  private useCloudTTS = true
  private cloudTTSAvailable = true

  async speak(text: string, settings: TTSSettings): Promise<void> {
    // Try Cloudflare Worker proxy first (if enabled and available)
    if (this.useCloudTTS && this.cloudTTSAvailable) {
      try {
        return await cloudflareTTSService.speak(text, settings)
      } catch (error) {
        console.warn('[Unified TTS] Cloud TTS failed, falling back to browser TTS:', error)
        this.cloudTTSAvailable = false
        // Fall through to browser TTS
      }
    }

    // Fallback to browser TTS
    return ttsService.speak(text, settings)
  }

  pause(): void {
    cloudflareTTSService.pause()
    ttsService.pause()
  }

  resume(): void {
    cloudflareTTSService.resume()
    ttsService.resume()
  }

  stop(): void {
    cloudflareTTSService.stop()
    ttsService.stop()
  }

  isPlaying(): boolean {
    return ttsService.isSpeaking()
  }

  isPaused(): boolean {
    return ttsService.isPaused()
  }

  getVoices() {
    return ttsService.getVoices()
  }

  async initialize(): Promise<void> {
    return ttsService.initialize()
  }

  getEngineInfo(): { name: string; description: string } {
    if (this.useCloudTTS && this.cloudTTSAvailable) {
      return cloudflareTTSService.getEngineInfo()
    }
    return ttsService.getEngineInfo()
  }

  setUseCloudTTS(use: boolean): void {
    this.useCloudTTS = use
  }

  setCloudTTSAvailable(available: boolean): void {
    this.cloudTTSAvailable = available
  }
}

export const unifiedTTSService = new UnifiedTTSService()
