import type { TTSAccent, TTSGender, TTSSettings } from '@/types'
import { ttsService as webTTSService } from './ttsService'

class UnifiedTTSService {
  // Always use browser built-in Web Speech API
  private engine = 'web'

  async speak(text: string, settings: TTSSettings): Promise<void> {
    return webTTSService.speak(text, settings)
  }

  pause(): void {
    webTTSService.pause()
  }

  resume(): void {
    webTTSService.resume()
  }

  stop(): void {
    webTTSService.stop()
  }

  isPlaying(): boolean {
    return webTTSService.isSpeaking()
  }

  isPaused(): boolean {
    return webTTSService.isPaused()
  }

  // Get available voices
  getVoices() {
    return webTTSService.getVoices()
  }

  // Get engine info
  getEngineInfo(): { name: string; description: string } {
    return {
      name: '浏览器内置 TTS',
      description: '使用系统语音包，支持多种语言和口音'
    }
  }
}

export const unifiedTTSService = new UnifiedTTSService()
