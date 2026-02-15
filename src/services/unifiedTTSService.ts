import type { TTSAccent, TTSGender, TTSSettings } from '@/types'
import { ttsService as webTTSService } from './ttsService'
import { googleTTSService } from './googleTTSService'

export type TTSEngine = 'web' | 'google'

class UnifiedTTSService {
  private engine: TTSEngine = 'google'

  setEngine(engine: TTSEngine) {
    this.engine = engine
    console.log('TTS Engine switched to:', engine)
  }

  getEngine(): TTSEngine {
    return this.engine
  }

  async speak(text: string, settings: TTSSettings): Promise<void> {
    if (this.engine === 'google') {
      return googleTTSService.speak(text, settings)
    } else {
      // For Web Speech API, convert settings
      const webSettings = {
        ...settings,
        rate: settings.rate * (settings.gender === 'male' ? 0.9 : 1.0)
      }
      return webTTSService.speak(text, webSettings)
    }
  }

  pause(): void {
    if (this.engine === 'google') {
      googleTTSService.pause()
    } else {
      webTTSService.pause()
    }
  }

  resume(): void {
    if (this.engine === 'google') {
      googleTTSService.resume()
    } else {
      webTTSService.resume()
    }
  }

  stop(): void {
    if (this.engine === 'google') {
      googleTTSService.stop()
    } else {
      webTTSService.stop()
    }
  }

  isPlaying(): boolean {
    if (this.engine === 'google') {
      return googleTTSService.isPlaying()
    } else {
      return webTTSService.isSpeaking()
    }
  }

  isPaused(): boolean {
    if (this.engine === 'google') {
      return googleTTSService.isPaused()
    } else {
      return webTTSService.isPaused()
    }
  }

  // Get available voices (only for Web Speech API)
  getVoices() {
    if (this.engine === 'web') {
      return webTTSService.getVoices()
    }
    return []
  }

  // Get engine info
  getEngineInfo(): { name: string; description: string } {
    if (this.engine === 'google') {
      return {
        name: 'Google Cloud TTS',
        description: '高质量云端语音合成，真实口音效果'
      }
    } else {
      return {
        name: '浏览器内置 TTS',
        description: '使用系统语音包，可能需要安装额外语音'
      }
    }
  }
}

export const unifiedTTSService = new UnifiedTTSService()
