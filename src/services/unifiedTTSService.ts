import type { TTSSettings } from '@/types'
import { ttsService } from './ttsService'

class UnifiedTTSService {
  async speak(text: string, settings: TTSSettings): Promise<void> {
    return ttsService.speak(text, settings)
  }

  pause(): void {
    ttsService.pause()
  }

  resume(): void {
    ttsService.resume()
  }

  stop(): void {
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

  getEngineInfo(): { name: string; description: string } {
    return {
      name: '浏览器内置 TTS',
      description: '使用系统语音包'
    }
  }
}

export const unifiedTTSService = new UnifiedTTSService()
