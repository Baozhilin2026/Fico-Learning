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
  // Indian: Slower rate for clarity, especially for female voices
  // Singapore: Use en-AU or en-GB with adjusted rate
  // Western: Standard en-US
  private accentSettings: Record<TTSAccent, { rate: number; lang?: string }> = {
    indian: { rate: 0.95, lang: 'en-IN' },
    singapore: { rate: 0.98, lang: 'en-AU' },
    western: { rate: 1.0, lang: 'en-US' }
  }

  // Gender settings for browser TTS
  // Male: Lower pitch (0.8-0.85 range) - masculine but not too deep
  // Female: Higher pitch (1.1-1.15 range) - feminine but natural
  private genderSettings: Record<TTSGender, { pitch: number; rateMultiplier?: number }> = {
    male: { pitch: 0.82, rateMultiplier: 1.0 },
    female: { pitch: 1.12, rateMultiplier: 0.95 }
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

  // Comprehensive voice name to gender mapping for Microsoft, Apple, and other TTS providers
  // iOS/iPadOS uses different voice names than desktop
  private femaleVoiceNames = [
    // Microsoft female voices (Indian English)
    'neerja', 'heera', 'shruti', 'veda', 'anitha', 'padma', 'roshni', 'tara',
    'priya', 'anita', 'laxmi', 'sheela', 'kalpana', 'geeta', 'rani', 'meena', 'kavita',
    'sonia', 'pooja', 'deepa', 'reena', 'savita', 'sunita',
    // Microsoft female voices (other English)
    'ava', 'zira', 'susan', 'fiona', 'victoria', 'jasm', 'shreyas', 'shyla',
    'natalia', 'nana',
    // Apple iOS/iPadOS female voices (Compact/Enhanced)
    'samantha', 'karen', 'moira', 'tessa', 'veena', 'nora', 'elle', 'fiona',
    'kyoko', 'sin-ji', 'tingting', 'meijia', 'xiao', 'yu-sheng', 'liza', 'juli',
    'ellen', 'filiz', 'aurelie', 'amelie', 'carmen', 'monica', 'paulina',
    'ioana', 'joana', 'sara', 'luciana', 'marlene', 'penelope', 'mari', 'damayanti',
    // Google female voices
    'google uk english female',
    // Generic labels
    'female'
  ]

  private maleVoiceNames = [
    // Microsoft male voices (Indian English)
    'ravi', 'raj', 'amit', 'sunil', 'arun', 'vikram', 'rahul', 'deepak', 'pradeep',
    'suresh', 'mahesh', 'naresh', 'ramesh', 'dinesh', 'mohan', 'krishna', 'balu',
    // Microsoft male voices (other English)
    'william', 'david', 'james', 'robert', 'mark', 'fred', 'junior',
    'ralph', 'bruce', 'steve', 'tony', 'mike', 'richard', 'george', 'henry', 'ronald',
    // Apple iOS/iPadOS male voices (Compact/Enhanced)
    'daniel', 'alex', 'lee', 'aaron', 'raju', 'ji-ho',
    'yuna', 'lenka', 'ozlem', 'rohit', 'rishi', 'satu', 'arjun',
    'spencer', 'diego', 'alvaro', 'guillermo', 'jorge', 'carlos', 'alberto',
    'juan', 'marco', 'renzo', 'andres', 'felipe', 'ricardo', 'raul', 'luca',
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

    // Special handling for western accent male voices
    if (accent === 'western' && gender === 'male') {
      // First, try to find exact "Male" labeled voices
      const exactMaleVoice = matchedVoices.find(v => v.name.includes('Male'))
      if (exactMaleVoice) {
        console.log('Selected exact Male voice for western:', exactMaleVoice.name)
        return exactMaleVoice
      }

      // For iOS/iPadOS, prefer specific male voice names
      const iosMaleVoice = matchedVoices.find(v =>
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('alex') ||
        v.name.toLowerCase().includes('lee') ||
        v.name.toLowerCase().includes('aaron') ||
        v.name.toLowerCase().includes('david')
      )
      if (iosMaleVoice) {
        console.log('Selected iOS male voice for western:', iosMaleVoice.name)
        return iosMaleVoice
      }

      // For Microsoft, prefer William or other known male voices
      const msMaleVoice = matchedVoices.find(v =>
        v.name.toLowerCase().includes('william') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('james') ||
        v.name.toLowerCase().includes('mark')
      )
      if (msMaleVoice) {
        console.log('Selected Microsoft male voice for western:', msMaleVoice.name)
        return msMaleVoice
      }
    }

    // Special handling for indian accent
    if (accent === 'indian') {
      if (gender === 'male') {
        // For Indian male voices, prefer voices with Indian male names
        const indianMaleVoice = matchedVoices.find(v =>
          v.name.toLowerCase().includes('ravi') ||
          v.name.toLowerCase().includes('raj') ||
          v.name.toLowerCase().includes('amit') ||
          v.name.toLowerCase().includes('arun') ||
          v.name.toLowerCase().includes('rahul')
        )
        if (indianMaleVoice) {
          console.log('Selected Indian male voice:', indianMaleVoice.name)
          return indianMaleVoice
        }

        // If no Indian male voice found, try to exclude obvious female voices
        const nonFemaleVoice = matchedVoices.find(v =>
          !this.femaleVoiceNames.some(name => v.name.toLowerCase().includes(name))
        )
        if (nonFemaleVoice) {
          console.log('Selected non-female voice for Indian male:', nonFemaleVoice.name)
          return nonFemaleVoice
        }
      } else {
        // For Indian female voices
        const indianFemaleVoice = matchedVoices.find(v =>
          v.name.toLowerCase().includes('neerja') ||
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('shruti') ||
          v.name.toLowerCase().includes('priya') ||
          v.name.toLowerCase().includes('anita')
        )
        if (indianFemaleVoice) {
          console.log('Selected Indian female voice:', indianFemaleVoice.name)
          return indianFemaleVoice
        }
      }
    }

    // Separate voices by gender using scoring system
    const scoredVoices = matchedVoices.map(voice => {
      let maleScore = 0
      let femaleScore = 0
      const voiceNameLower = voice.name.toLowerCase()

      // Check against known voice name patterns
      for (const name of this.maleVoiceNames) {
        if (voiceNameLower.includes(name)) {
          maleScore += 10
        }
      }
      for (const name of this.femaleVoiceNames) {
        if (voiceNameLower.includes(name)) {
          femaleScore += 10
        }
      }

      // Check for exact "Male"/"Female" in name (case-sensitive)
      if (voice.name.includes('Male')) maleScore += 20
      if (voice.name.includes('Female')) femaleScore += 20

      // Check for common gender indicators
      if (voiceNameLower.includes(' mr ') || voiceNameLower.includes(' mr.')) maleScore += 5
      if (voiceNameLower.includes(' mrs ') || voiceNameLower.includes(' mrs.')) femaleScore += 5
      if (voiceNameLower.includes(' miss ') || voiceNameLower.includes(' ms.')) femaleScore += 5

      return { voice, maleScore, femaleScore }
    })

    // Select voice based on gender preference
    if (gender === 'male') {
      // Prefer voices with high male score and low female score
      const maleVoices = scoredVoices.filter(v => v.maleScore > v.femaleScore)
      if (maleVoices.length > 0) {
        // Sort by male score descending, female score ascending
        maleVoices.sort((a, b) => (b.maleScore - a.femaleScore) - (a.maleScore - a.femaleScore))
        const selected = maleVoices[0].voice
        console.log('Selected male voice:', selected.name, '(Male score:', maleVoices[0].maleScore, 'Female score:', maleVoices[0].femaleScore, ')')
        return selected
      }
      // Fallback: voice with lowest female score
      const neutralVoices = scoredVoices.filter(v => v.femaleScore === 0)
      if (neutralVoices.length > 0) {
        const selected = neutralVoices[0].voice
        console.log('Selected neutral voice for male:', selected.name)
        return selected
      }
    } else {
      // Prefer voices with high female score and low male score
      const femaleVoices = scoredVoices.filter(v => v.femaleScore > v.maleScore)
      if (femaleVoices.length > 0) {
        // Sort by female score descending, male score ascending
        femaleVoices.sort((a, b) => (b.femaleScore - a.maleScore) - (a.femaleScore - a.maleScore))
        const selected = femaleVoices[0].voice
        console.log('Selected female voice:', selected.name, '(Female score:', femaleVoices[0].femaleScore, 'Male score:', femaleVoices[0].maleScore, ')')
        return selected
      }
      // Fallback: voice with lowest male score
      const neutralVoices = scoredVoices.filter(v => v.maleScore === 0)
      if (neutralVoices.length > 0) {
        const selected = neutralVoices[0].voice
        console.log('Selected neutral voice for female:', selected.name)
        return selected
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
