import type { TTSAccent, TTSGender, TTSSettings } from '@/types'

interface GoogleTTSResponse {
  audioContent: string
  voice: string
}

interface GoogleTTSError {
  error: string
  details?: any
}

class GoogleTTSService {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false

  // API endpoint - will be proxied through Vercel
  private apiEndpoint = '/api/tts'

  // Accent to language code mapping
  private accentLangMap: Record<TTSAccent, string> = {
    indian: 'en-IN',
    singapore: 'en-AU',
    western: 'en-US'
  }

  // Gender to SSML gender mapping
  private genderMap: Record<TTSGender, 'MALE' | 'FEMALE' | 'NEUTRAL'> = {
    male: 'MALE',
    female: 'FEMALE'
  }

  // Voice selection based on accent and gender
  private selectVoice(accent: TTSAccent, gender: TTSGender): string {
    const voiceMap: Record<TTSAccent, Record<TTSGender, string>> = {
      indian: {
        male: 'en-IN-Standard-B',
        female: 'en-IN-Standard-A'
      },
      singapore: {
        male: 'en-AU-Standard-B',
        female: 'en-AU-Standard-A'
      },
      western: {
        male: 'en-US-Standard-B',
        female: 'en-US-Standard-C'
      }
    }

    return voiceMap[accent][gender]
  }

  // Adjust speaking rate based on user preference
  private getSpeakingRate(baseRate: number, userRate: number): number {
    return baseRate * userRate
  }

  // Adjust pitch based on user preference
  private getPitch(basePitch: number): number {
    return (basePitch - 1.0) * 40
  }

  async speak(text: string, settings: TTSSettings): Promise<void> {
    this.stop()

    const languageCode = this.accentLangMap[settings.accent]
    const ssmlGender = this.genderMap[settings.gender]
    const voice = this.selectVoice(settings.accent, settings.gender)
    const speakingRate = this.getSpeakingRate(1.0, settings.rate)
    const pitch = this.getPitch(settings.pitch || 1.0)

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode,
          name: voice,
          ssmlGender,
          speakingRate,
          pitch
        })
      })

      if (!response.ok) {
        const errorData: GoogleTTSError = await response.json()
        throw new Error(errorData.error || 'TTS request failed')
      }

      const data: GoogleTTSResponse = await response.json()

      const audioData = atob(data.audioContent)
      const arrayBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(arrayBuffer)

      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)

      return new Promise((resolve, reject) => {
        this.audio = new Audio(audioUrl)

        this.audio.onended = () => {
          this.isPlaying = false
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        this.audio.onerror = () => {
          this.isPlaying = false
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }

        this.audio.oncanplay = () => {
          this.isPlaying = true
          this.audio?.play().catch(reject)
        }

        this.audio.load()
      })

    } catch (error) {
      console.error('Google TTS error:', error)
      throw error
    }
  }

  pause(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause()
    }
  }

  resume(): void {
    if (this.audio) {
      this.audio.play()
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.isPlaying = false
    }
  }

  isSpeaking(): boolean {
    return this.isPlaying && this.audio ? !this.audio.paused : false
  }

  isPaused(): boolean {
    return this.audio ? this.audio.paused && this.isPlaying : false
  }

  getEngineInfo(): { name: string; description: string } {
    return {
      name: 'Google Cloud TTS',
      description: '高质量云端语音合成，支持多种口音和性别'
    }
  }
}

export const googleTTSService = new GoogleTTSService()
