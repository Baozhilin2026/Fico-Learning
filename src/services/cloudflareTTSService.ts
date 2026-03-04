import { audioCacheService } from './audioCache'
import type { TTSSettings } from '@/types'

interface TTSAudioConfig {
  codec?: string
  sampleRate?: number
  rate?: number
  volume?: number
}

class CloudflareTTSService {
  private workerUrl: string
  private audioElements: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // Update this URL after deploying your Cloudflare Worker
    // Format: https://your-worker-name.your-subdomain.workers.dev
    this.workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://fico-tts-proxy.your-subdomain.workers.dev'
  }

  async speak(text: string, settings: TTSSettings & TTSAudioConfig): Promise<void> {
    console.log('[Cloudflare TTS] speak called with text:', text)

    // Check cache first
    const cachedUrl = await audioCacheService.get(text)
    if (cachedUrl) {
      console.log('[Cloudflare TTS] Using cached audio')
      return this.playAudio(cachedUrl, text)
    }

    // Not cached, fetch from API
    console.log('[Cloudflare TTS] Fetching from Cloudflare Worker')
    return this.fetchAndPlay(text, settings)
  }

  private async fetchAndPlay(text: string, settings: TTSSettings & TTSAudioConfig): Promise<void> {
    try {
      const response = await fetch(`${this.workerUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          rate: settings.rate || 1.0,
          volume: 5
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch audio from Cloudflare Worker')
      }

      const data = await response.json()

      if (!data.audioContent) {
        throw new Error('No audio content returned')
      }

      // Convert base64 to blob
      const audioBlob = this.base64ToBlob(data.audioContent, 'audio/mpeg')

      // Cache the audio
      await audioCacheService.set(text, audioBlob)

      // Create URL and play
      const audioUrl = URL.createObjectURL(audioBlob)
      return this.playAudio(audioUrl, text)

    } catch (error) {
      console.error('[Cloudflare TTS] Error:', error)
      throw error
    }
  }

  private playAudio(url: string, text: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Stop any existing audio with the same text
      this.stop(text)

      const audio = new Audio(url)
      this.audioElements.set(text, audio)

      audio.onended = () => {
        console.log('[Cloudflare TTS] Audio ended')
        this.audioElements.delete(text)
        URL.revokeObjectURL(url)
        resolve()
      }

      audio.onerror = (event) => {
        console.error('[Cloudflare TTS] Audio error:', event)
        this.audioElements.delete(text)
        URL.revokeObjectURL(url)
        reject(new Error('音频播放失败'))
      }

      audio.oncanplay = () => {
        console.log('[Cloudflare TTS] Audio ready, starting playback')
      }

      console.log('[Cloudflare TTS] Starting audio playback')
      audio.play().catch((err) => {
        console.error('[Cloudflare TTS] Play failed:', err)
        reject(err)
      })
    })
  }

  stop(text?: string): void {
    if (text) {
      const audio = this.audioElements.get(text)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        this.audioElements.delete(text)
      }
    } else {
      this.audioElements.forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
      this.audioElements.clear()
    }
  }

  pause(): void {
    this.audioElements.forEach((audio) => {
      audio.pause()
    })
  }

  resume(): void {
    this.audioElements.forEach((audio) => {
      audio.play().catch(console.error)
    })
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  async isPlaying(): Promise<boolean> {
    const audioArray = Array.from(this.audioElements.values())
    for (const audio of audioArray) {
      if (!audio.paused && audio.currentTime > 0) {
        return true
      }
    }
    return false
  }

  getEngineInfo(): { name: string; description: string } {
    return {
      name: '腾讯云 TTS (Cloudflare 代理)',
      description: '高质量在线语音合成'
    }
  }

  // Set worker URL (for dynamic configuration)
  setWorkerUrl(url: string): void {
    this.workerUrl = url
  }
}

export const cloudflareTTSService = new CloudflareTTSService()
