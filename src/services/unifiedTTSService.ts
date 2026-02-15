import type { TTSAccent, TTSGender, TTSSettings } from '@/types'
import { ttsService as webTTSService } from './ttsService'
import { googleTTSService } from './googleTTSService'

type TTSEngine = 'web' | 'google'

const ENGINE_STORAGE_KEY = 'fico_tts_engine'

class UnifiedTTSService {
  // Default to Google Cloud TTS
  private engine: TTSEngine = 'google'

  constructor() {
    // Load saved engine preference
    this.loadEnginePreference()
  }

  // Load engine preference from localStorage
  private loadEnginePreference(): void {
    try {
      const saved = localStorage.getItem(ENGINE_STORAGE_KEY)
      if (saved === 'web' || saved === 'google') {
        this.engine = saved
      }
    } catch (error) {
      console.error('Failed to load engine preference:', error)
    }
  }

  // Save engine preference to localStorage
  private saveEnginePreference(): void {
    try {
      localStorage.setItem(ENGINE_STORAGE_KEY, this.engine)
    } catch (error) {
      console.error('Failed to save engine preference:', error)
    }
  }

  // Set engine type
  setEngine(engine: TTSEngine): void {
    this.engine = engine
    this.saveEnginePreference()
    console.log('TTS Engine switched to:', engine)
  }

  // Get current engine
  getEngine(): TTSEngine {
    return this.engine
  }

  async speak(text: string, settings: TTSSettings): Promise<void> {
    if (this.engine === 'google') {
      return googleTTSService.speak(text, settings)
    }
    return webTTSService.speak(text, settings)
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
      return googleTTSService.isSpeaking()
    }
    return webTTSService.isSpeaking()
  }

  isPaused(): boolean {
    if (this.engine === 'google') {
      return googleTTSService.isPaused()
    }
    return webTTSService.isPaused()
  }

  // Get available voices (only for web engine)
  getVoices() {
    if (this.engine === 'web') {
      return webTTSService.getVoices()
    }
    return []
  }

  // Get engine info
  getEngineInfo(): { name: string; description: string } {
    if (this.engine === 'google') {
      return googleTTSService.getEngineInfo()
    }
    return {
      name: '浏览器内置 TTS',
      description: '使用系统语音包，支持多种语言和口音'
    }
  }
}

export const unifiedTTSService = new UnifiedTTSService()
