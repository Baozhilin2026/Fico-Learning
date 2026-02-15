import type { TTSAccent, TTSGender, TTSSettings } from '@/types'

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

  private accentSettings: Record<TTSAccent, { rate: number; lang?: string }> = {
    indian: { rate: 1.1, lang: 'en-IN' },
    singapore: { rate: 0.95, lang: 'en-SG' },
    western: { rate: 1.0, lang: 'en-US' }
  }

  private genderSettings: Record<TTSGender, { pitch: number; rateMultiplier?: number }> = {
    male: { pitch: 0.55, rateMultiplier: 0.9 },
    female: { pitch: 1.3, rateMultiplier: 1.0 }
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

  // Get voice that matches accent and gender preferences
  selectVoice(accent: TTSAccent, gender: TTSGender): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    if (voices.length === 0) return null

    const accentLang = this.accentSettings[accent].lang || 'en-US'

    // Try to find exact match
    let matchedVoices = voices.filter(v => v.lang.startsWith(accentLang))

    // If no exact match, try English voices
    if (matchedVoices.length === 0) {
      matchedVoices = voices.filter(v => v.lang.startsWith('en'))
    }

    // Log for debugging
    console.log('Available voices for', accent, ':', matchedVoices.map(v => v.name))

    // Prefer voices that indicate gender if available
    if (gender === 'male') {
      // First try to find explicitly male voices (Windows: Microsoft David, Google US English, etc.)
      const maleVoiceNames = [
        'male', 'david', 'daniel', 'james', 'robert', 'mark',
        'microsoft david', 'google us english', 'english us',
        'alex', 'fred', 'junior', 'ralph', 'bruce',
        'google usa', 'microsoft desktop'
      ]

      for (const name of maleVoiceNames) {
        const voice = matchedVoices.find(v => v.name.toLowerCase().includes(name))
        if (voice) {
          console.log('Selected male voice:', voice.name)
          return voice
        }
      }

      // Then try to avoid explicitly female voices
      const femaleVoiceNames = [
        'female', 'zira', 'samantha', 'karen', 'susan', 'fiona',
        'victoria', 'microsoft zira', 'microsoft samantha',
        'google uk english female', 'siri'
      ]

      const nonFemaleVoice = matchedVoices.find(v =>
        !femaleVoiceNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (nonFemaleVoice) {
        console.log('Selected non-female voice:', nonFemaleVoice.name)
        return nonFemaleVoice
      }
    } else {
      // First try to find explicitly female voices
      const femaleVoiceNames = [
        'female', 'zira', 'samantha', 'karen', 'susan', 'fiona',
        'victoria', 'microsoft zira', 'microsoft samantha',
        'google uk english female', 'siri', 'siri female'
      ]

      for (const name of femaleVoiceNames) {
        const voice = matchedVoices.find(v => v.name.toLowerCase().includes(name))
        if (voice) {
          console.log('Selected female voice:', voice.name)
          return voice
        }
      }
    }

    const fallback = matchedVoices[0] || voices[0]
    console.log('Using fallback voice:', fallback?.name)
    return fallback
  }

  // Speak text with specified settings
  speak(text: string, settings: TTSSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)

      // Apply accent settings
      const accentConfig = this.accentSettings[settings.accent]
      const genderConfig = this.genderSettings[settings.gender]

      utterance.rate = accentConfig.rate * settings.rate * (genderConfig.rateMultiplier || 1.0)
      utterance.pitch = genderConfig.pitch
      utterance.lang = accentConfig.lang || 'en-US'

      console.log('TTS Settings - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Gender:', settings.gender)

      // Select appropriate voice
      const voice = this.selectVoice(settings.accent, settings.gender)
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
