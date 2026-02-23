import type { TTSSettings } from '@/types'

interface TTSState {
  speaking: boolean
  paused: boolean
  currentUtterance: SpeechSynthesisUtterance | null
  initialized: boolean
}

class TTSService {
  private synth: SpeechSynthesis
  private state: TTSState = {
    speaking: false,
    paused: false,
    currentUtterance: null,
    initialized: false
  }
  private voices: SpeechSynthesisVoice[] = []
  private voicesLoaded = false

  constructor() {
    this.synth = window.speechSynthesis

    // Handle browser unload to stop speech
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop()
      })
    }

    // Load voices - handle Safari's async loading
    this.loadVoices()
  }

  // Load voices with Safari support
  private loadVoices(): void {
    // Try to get voices immediately
    this.voices = this.synth.getVoices()

    if (this.voices.length > 0) {
      this.voicesLoaded = true
      console.log('[TTS] Voices loaded immediately:', this.voices.length)
    } else {
      // For Safari, voices are loaded asynchronously
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices()
        this.voicesLoaded = true
        console.log('[TTS] Voices loaded via voiceschanged:', this.voices.length)
      }
    }
  }

  // Initialize TTS with user interaction - required for Safari
  async initialize(): Promise<void> {
    if (this.state.initialized) return

    // Wait for voices to be loaded
    if (!this.voicesLoaded) {
      await new Promise<void>(resolve => {
        const checkVoices = () => {
          if (this.voicesLoaded) {
            resolve()
          } else {
            setTimeout(checkVoices, 100)
          }
        }
        checkVoices()
      })
    }

    // For Safari, speak a silent utterance to "wake up" the audio
    // This must be triggered by user interaction
    const silentUtterance = new SpeechSynthesisUtterance('')
    silentUtterance.volume = 0

    return new Promise((resolve) => {
      silentUtterance.onend = () => {
        this.state.initialized = true
        console.log('[TTS] Initialized successfully')
        resolve()
      }

      silentUtterance.onerror = () => {
        // Even if error, consider initialized (some browsers don't support silent)
        this.state.initialized = true
        console.log('[TTS] Initialized (with error, but proceeding)')
        resolve()
      }

      this.synth.speak(silentUtterance)

      // Fallback timeout in case onend doesn't fire
      setTimeout(() => {
        if (!this.state.initialized) {
          this.state.initialized = true
          resolve()
        }
      }, 100)
    })
  }

  // Get all available voices
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.voicesLoaded) {
      this.voices = this.synth.getVoices()
      if (this.voices.length > 0) {
        this.voicesLoaded = true
      }
    }
    return this.voices
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
    // Initialize if not already done (required for Safari)
    if (!this.state.initialized) {
      return this.initialize().then(() => this.speak(text, settings))
    }

    // Cancel any ongoing speech
    this.stop()

    // Additional Safari fix: cancel and speak again to ensure it's not in paused state
    this.synth.cancel()

    return new Promise<void>((resolve, reject) => {
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
