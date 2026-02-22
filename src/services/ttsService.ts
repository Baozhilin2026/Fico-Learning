import type { TTSSettings } from '@/types'

interface TTSState {
  speaking: boolean
  paused: boolean
  currentUtterance: SpeechSynthesisUtterance | null
}

class TTSService {
  private synth: SpeechSynthesis
  private state: TTSState = {
    speaking: false,
    paused: false,
    currentUtterance: null
  }

  constructor() {
    this.synth = window.speechSynthesis

    // Handle browser unload to stop speech
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop()
      })
    }
  }

  // Get all available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
  }

  // Select browser default English voice
  private selectDefaultVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    if (voices.length === 0) return null

    // Prefer English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'))
    if (englishVoices.length > 0) {
      // Prefer local service voices (better quality)
      const localVoices = englishVoices.filter(v => v.localService)
      return localVoices[0] || englishVoices[0]
    }

    return voices[0]
  }

  // Speak text with specified settings
  speak(text: string, settings: TTSSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)

      // Use user-selected rate, default pitch and language
      utterance.rate = settings.rate
      utterance.pitch = 1.0
      utterance.lang = 'en-US'

      // Select default English voice
      const voice = this.selectDefaultVoice()
      if (voice) {
        utterance.voice = voice
      }

      // Event handlers
      utterance.onstart = () => {
        this.state.speaking = true
        this.state.currentUtterance = utterance
      }

      utterance.onend = () => {
        this.state.speaking = false
        this.state.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        this.state.speaking = false
        this.state.currentUtterance = null
        reject(new Error(`TTS error: ${event.error}`))
      }

      this.synth.speak(utterance)
    })
  }

  // Pause current speech
  pause(): void {
    if (this.state.speaking && !this.state.paused) {
      this.synth.pause()
      this.state.paused = true
    }
  }

  // Resume paused speech
  resume(): void {
    if (this.state.paused) {
      this.synth.resume()
      this.state.paused = false
    }
  }

  // Stop current speech
  stop(): void {
    if (this.state.speaking) {
      this.synth.cancel()
      this.state.speaking = false
      this.state.paused = false
      this.state.currentUtterance = null
    }
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.state.speaking && !this.state.paused
  }

  // Check if paused
  isPaused(): boolean {
    return this.state.paused
  }

  // Get speech state
  getState(): TTSState {
    return { ...this.state }
  }
}

export const ttsService = new TTSService()
