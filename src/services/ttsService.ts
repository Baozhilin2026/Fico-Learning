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
  private currentSpeakResolver: (() => void) | null = null
  private currentSpeakRejecter: ((error: Error) => void) | null = null
  private keepAliveInterval: number | null = null
  private isInitializing = false

  constructor() {
    this.synth = window.speechSynthesis

    // Handle browser unload to stop speech
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop()
        this.stopKeepAlive()
      })
    }

    // Load voices - handle Safari's async loading
    this.loadVoices()

    // Start keep alive to prevent Chrome from freezing TTS
    this.startKeepAlive()
  }

  // Start keep alive mechanism - prevents Chrome TTS from freezing
  private startKeepAlive(): void {
    if (this.keepAliveInterval !== null) return

    this.keepAliveInterval = window.setInterval(() => {
      if (this.synth.speaking && !this.state.paused) {
        // Pause and resume to keep TTS alive
        this.synth.pause()
        this.synth.resume()
      }
    }, 10000) // Every 10 seconds
  }

  // Stop keep alive mechanism
  private stopKeepAlive(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval)
      this.keepAliveInterval = null
    }
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

  // Initialize TTS - simple version without beep
  async initialize(): Promise<void> {
    if (this.state.initialized) return Promise.resolve()

    // Prevent concurrent initialization
    if (this.isInitializing) {
      return new Promise<void>(resolve => {
        const checkInit = () => {
          if (this.state.initialized || !this.isInitializing) {
            resolve()
          } else {
            setTimeout(checkInit, 50)
          }
        }
        checkInit()
      })
    }

    this.isInitializing = true

    // Wait for voices to be loaded
    if (!this.voicesLoaded) {
      await new Promise<void>(resolve => {
        const checkVoices = () => {
          if (this.voicesLoaded) {
            resolve()
          } else {
            setTimeout(checkVoices, 50)
          }
        }
        checkVoices()
      })
    }

    // Just mark as initialized - no beep needed
    this.state.initialized = true
    this.isInitializing = false
    console.log('[TTS] Initialized successfully')

    return Promise.resolve()
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

    // Debug: log ALL voices with detailed info
    console.log('[TTS] ===== ALL AVAILABLE VOICES =====')
    voices.forEach((v, i) => {
      console.log(`[${i}] ${v.name}`)
      console.log(`    lang: ${v.lang}, local: ${v.localService}, default: ${v.default}`)
    })
    console.log('[TTS] ===== END VOICE LIST =====')

    // PRIORITY 1: Local English voices (best - no network needed, correct language)
    const localEnglishVoices = voices.filter(v =>
      v.lang.startsWith('en') && v.localService === true
    )
    if (localEnglishVoices.length > 0) {
      console.log('[TTS] ✓ Using LOCAL English voice:', localEnglishVoices[0].name)
      return localEnglishVoices[0]
    }

    // PRIORITY 2: ANY local voice (fallback - works offline, pronunciation may be wrong)
    const anyLocalVoices = voices.filter(v => v.localService === true)
    if (anyLocalVoices.length > 0) {
      console.warn('[TTS] ⚠ No LOCAL English voice found!')
      console.warn('[TTS] Using local voice as fallback:', anyLocalVoices[0].name)
      console.warn('[TTS] Note: This voice may not pronounce English correctly')
      console.warn('[TTS] To fix: Install Windows English voice pack')
      console.warn('    Settings → Time & Language → Language → English → Options → Speech → Download')
      return anyLocalVoices[0]
    }

    // PRIORITY 3: Remote English voices (worst - requires internet, may be blocked)
    const remoteEnglishVoices = voices.filter(v =>
      v.lang.startsWith('en') && v.localService === false
    )
    if (remoteEnglishVoices.length > 0) {
      console.warn('[TTS] ✗ Only remote voices available - using:', remoteEnglishVoices[0].name)
      console.warn('[TTS] This requires internet access to Google TTS service')
      console.warn('[TTS] If no sound, your network may be blocking Google services')
      console.warn('[TTS] Try: Install Windows English voice pack, use VPN, or check firewall')
      return remoteEnglishVoices[0]
    }

    console.warn('[TTS] ✗ No voices found at all!')
    return voices[0]
  }

  // Speak text with specified settings
  speak(text: string, settings: TTSSettings): Promise<void> {
    console.log('[TTS] speak called with text:', text, 'rate:', settings.rate)

    // Cancel previous promise
    if (this.currentSpeakRejecter) {
      this.currentSpeakRejecter(new Error('Canceled'))
      this.currentSpeakRejecter = null
      this.currentSpeakResolver = null
    }

    // Cancel any ongoing speech and clear queue completely
    this.synth.cancel()

    // Initialize if not already done, then speak
    const initAndSpeak = async (): Promise<void> => {
      if (!this.state.initialized) {
        console.log('[TTS] Not initialized, initializing...')
        await this.initialize()
        // Add a small delay after initialization
        await new Promise<void>(resolve => setTimeout(resolve, 100))
      }
      return this.doSpeak(text, settings)
    }

    return initAndSpeak()
  }

  // Internal speak method - assumes initialized
  private doSpeak(text: string, settings: TTSSettings): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.currentSpeakResolver = resolve
      this.currentSpeakRejecter = reject

      // Double cancel to ensure queue is clear
      this.synth.cancel()

      // Small delay to ensure cancel completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        console.log('[TTS] Creating utterance for text:', text)

        // Use user-selected rate, default pitch and language
        utterance.rate = settings.rate
        utterance.pitch = 1.0
        utterance.lang = 'en-US'
        utterance.volume = 1.0

        // Select default English voice
        const voice = this.selectDefaultVoice()
        if (voice) {
          utterance.voice = voice
          console.log('[TTS] Using voice:', voice.name, voice.lang)
        } else {
          console.log('[TTS] No voice selected')
        }

        let eventReceived = false

        // Event handlers
        utterance.onstart = () => {
          console.log('[TTS] Speech started for:', text)
          eventReceived = true
          this.state.speaking = true
          this.state.currentUtterance = utterance
        }

        utterance.onend = () => {
          console.log('[TTS] Speech ended for:', text)
          eventReceived = true
          this.state.speaking = false
          this.state.currentUtterance = null
          if (this.currentSpeakResolver === resolve) {
            this.currentSpeakResolver = null
            this.currentSpeakRejecter = null
            resolve()
          }
        }

        utterance.onerror = (event) => {
          console.log('[TTS] Speech error:', event.error, 'for text:', text)
          eventReceived = true
          this.state.speaking = false
          this.state.currentUtterance = null
          if (this.currentSpeakRejecter === reject) {
            this.currentSpeakRejecter = null
            this.currentSpeakResolver = null

            // Ignore 'interrupted' and 'canceled' errors
            if (event.error === 'interrupted' || event.error === 'canceled') {
              resolve()
            } else {
              reject(new Error(`TTS error: ${event.error}`))
            }
          }
        }

        console.log('[TTS] About to call synth.speak()')
        this.synth.speak(utterance)
        console.log('[TTS] synth.speak() called, speaking:', this.synth.speaking, 'pending:', this.synth.pending)

        // Watchdog - if no event received in 8 seconds, assume something went wrong
        setTimeout(() => {
          if (!eventReceived && this.currentSpeakResolver === resolve) {
            console.log('[TTS] Watchdog timeout - no events received, forcing resolution')
            // Force cleanup
            this.state.speaking = false
            this.state.currentUtterance = null
            if (this.currentSpeakResolver === resolve) {
              this.currentSpeakResolver = null
              this.currentSpeakRejecter = null
              resolve() // Don't reject to avoid blocking UI
            }
          }
        }, 8000)
      }, 50)
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
    this.synth.cancel()
    this.state.speaking = false
    this.state.paused = false
    this.state.currentUtterance = null
    if (this.currentSpeakRejecter) {
      this.currentSpeakRejecter(new Error('Stopped'))
      this.currentSpeakRejecter = null
      this.currentSpeakResolver = null
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
