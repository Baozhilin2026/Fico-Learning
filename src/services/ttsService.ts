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

  // Browser TTS accent settings - optimized for Web Speech API
  // Indian: Use en-IN with higher rate for characteristic rhythm
  // Singapore: Use en-AU or en-GB with adjusted rate
  // Western: Standard en-US
  private accentSettings: Record<TTSAccent, { rate: number; lang?: string }> = {
    indian: { rate: 1.15, lang: 'en-IN' },
    singapore: { rate: 0.98, lang: 'en-AU' },
    western: { rate: 1.0, lang: 'en-US' }
  }

  // Gender settings for browser TTS
  // Male: Very low pitch (0.3-0.5 range) - more masculine sound
  // Female: Higher pitch (1.1-1.3 range) - feminine but not too high
  private genderSettings: Record<TTSGender, { pitch: number; rateMultiplier?: number }> = {
    male: { pitch: 0.4, rateMultiplier: 0.92 },
    female: { pitch: 1.2, rateMultiplier: 1.0 }
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

  // Debug: Log all available voices
  debugVoices(): void {
    const allVoices = this.getVoices()
    console.log('=== All Available Voices ===')
    allVoices.forEach(v => {
      console.log(`- ${v.name} (${v.lang}) [Local: ${v.localService}]`)
    })
    console.log('============================')
  }

  // Comprehensive voice name to gender mapping for Microsoft and other TTS providers
  // Microsoft voices use gendered names rather than "Male"/"Female" labels
  private femaleVoiceNames = [
    // Microsoft female voices
    'neerja', 'ava', 'heera', 'shruti', 'veda', 'anitha', 'padma', 'roshni', 'tara', 'zira',
    'samantha', 'karen', 'susan', 'fiona', 'victoria', 'jasm', 'shreyas', 'shyla', 'chitra',
    'priya', 'anita', 'laxmi', 'sheela', 'kalpana', 'geeta', 'rani', 'meena', 'kavita',
    'sonia', 'pooja', 'deepa', 'reena', 'meena', 'savita', 'sunita',
    // Google female voices
    'google uk english female',
    // Apple female voices
    'siri', 'karen', 'moira', 'tessa', 'veena', 'samantha',
    // Generic labels
    'female'
  ]

  private maleVoiceNames = [
    // Microsoft male voices
    'william', 'david', 'daniel', 'james', 'robert', 'mark', 'alex', 'fred', 'junior',
    'ralph', 'bruce', 'steve', 'tony', 'mike', 'richard', 'george', 'henry', 'ronald',
    'ravi', 'raj', 'amit', 'sunil', 'arun', 'vikram', 'rahul', 'deepak', 'pradeep',
    'suresh', 'mahesh', 'naresh', 'ramesh', 'dinesh', 'mohan', 'krishna', 'balu',
    // Generic labels
    'male'
  ]

  // Get voice that matches accent and gender preferences
  selectVoice(accent: TTSAccent, gender: TTSGender): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    if (voices.length === 0) return null

    // Debug: Show all available voices
    this.debugVoices()

    const accentLang = this.accentSettings[accent].lang || 'en-US'

    // Try to find exact match first
    let matchedVoices = voices.filter(v => v.lang.startsWith(accentLang))

    // Fallback for Indian accent: if no en-IN, try en-GB or en-AU
    if (matchedVoices.length === 0 && accent === 'indian') {
      // Try British or Australian English as they're closer to Indian English
      matchedVoices = voices.filter(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-AU'))
    }

    // Fallback for Singapore accent: if no en-AU, try en-GB
    if (matchedVoices.length === 0 && accent === 'singapore') {
      matchedVoices = voices.filter(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-IN'))
    }

    // If no accent match, try English voices
    if (matchedVoices.length === 0) {
      matchedVoices = voices.filter(v => v.lang.startsWith('en'))
    }

    // Log for debugging
    console.log('Available voices for', accent, '(', gender, '):', matchedVoices.map(v => `${v.name} (${v.lang})`))

    // First try exact "Male"/"Female" match (case-sensitive) for Google voices
    if (gender === 'male') {
      const exactMaleVoice = matchedVoices.find(v => v.name.includes('Male'))
      if (exactMaleVoice) {
        console.log('Selected exact male voice:', exactMaleVoice.name)
        return exactMaleVoice
      }
    } else {
      const exactFemaleVoice = matchedVoices.find(v => v.name.includes('Female'))
      if (exactFemaleVoice) {
        console.log('Selected exact female voice:', exactFemaleVoice.name)
        return exactFemaleVoice
      }
    }

    // Filter voices by gender based on voice name patterns
    if (gender === 'male') {
      // Priority 1: Find known male voices
      const maleVoice = matchedVoices.find(v =>
        this.maleVoiceNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (maleVoice) {
        console.log('Selected male voice (by name):', maleVoice.name)
        return maleVoice
      }

      // Priority 2: Exclude known female voices
      const nonFemaleVoice = matchedVoices.find(v =>
        !this.femaleVoiceNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (nonFemaleVoice) {
        console.log('Selected non-female voice:', nonFemaleVoice.name)
        return nonFemaleVoice
      }
    } else {
      // Priority 1: Find known female voices
      const femaleVoice = matchedVoices.find(v =>
        this.femaleVoiceNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (femaleVoice) {
        console.log('Selected female voice (by name):', femaleVoice.name)
        return femaleVoice
      }

      // Priority 2: Exclude known male voices
      const nonMaleVoice = matchedVoices.find(v =>
        !this.maleVoiceNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (nonMaleVoice) {
        console.log('Selected non-male voice:', nonMaleVoice.name)
        return nonMaleVoice
      }
    }

    const fallback = matchedVoices[0] || voices[0]
    console.log('Using fallback voice:', fallback?.name, 'for', accent, gender)
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

      console.log('TTS Settings - Accent:', settings.accent, 'Gender:', settings.gender, 'Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Lang:', utterance.lang)

      // Select appropriate voice
      const voice = this.selectVoice(settings.accent, settings.gender)
      if (voice) {
        utterance.voice = voice
        console.log('Selected voice:', voice.name, 'Lang:', voice.lang, 'Local service:', voice.localService)
      } else {
        console.warn('No voice selected, using default')
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
