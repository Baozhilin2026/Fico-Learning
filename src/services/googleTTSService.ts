import type { TTSAccent, TTSGender, TTSSettings } from '@/types'

interface GoogleTTSState {
  playing: boolean
  paused: boolean
  currentAudio: HTMLAudioElement | null
}

class GoogleTTSService {
  private apiKey: string
  private state: GoogleTTSState = {
    playing: false,
    paused: false,
    currentAudio: null
  }

  // Google Cloud TTS voice names for different accents and genders
  // Prioritize WaveNet voices for better quality
  private voiceMap: Record<TTSAccent, Record<TTSGender, string[]>> = {
    indian: {
      male: ['en-IN-Wavenet-B', 'en-IN-Standard-B'],
      female: ['en-IN-Wavenet-D', 'en-IN-Wavenet-A', 'en-IN-Standard-D']
    },
    singapore: {
      male: ['en-AU-Wavenet-B', 'en-AU-Standard-B'],
      female: ['en-AU-Wavenet-A', 'en-AU-Standard-A']
    },
    western: {
      male: ['en-US-Wavenet-B', 'en-US-Wavenet-D', 'en-US-Standard-B', 'en-US-Standard-D'],
      female: ['en-US-Wavenet-A', 'en-US-Wavenet-C', 'en-US-Standard-A', 'en-US-Standard-C']
    }
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Get voice name for accent and gender
  private getVoiceName(accent: TTSAccent, gender: TTSGender): string {
    const voices = this.voiceMap[accent][gender]
    return voices[0] // Use first available voice
  }

  // Convert pitch to Google TTS format (-20.0 to 20.0)
  private convertPitch(pitch: number): number {
    // Our pitch: 0.5-1.5 → Google: -20 to +20
    return (pitch - 1.0) * 40
  }

  // Convert rate to Google TTS format (0.25 to 4.0)
  private convertRate(rate: number): number {
    return Math.max(0.25, Math.min(4.0, rate))
  }

  // Convert gender to Google TTS format
  private convertGender(gender: TTSGender): 'MALE' | 'FEMALE' {
    return gender === 'male' ? 'MALE' : 'FEMALE'
  }

  // Get language code for accent
  private getLanguageCode(accent: TTSAccent): string {
    const langMap: Record<TTSAccent, string> = {
      indian: 'en-IN',
      singapore: 'en-AU', // Use Australian English code for Singapore accent
      western: 'en-US'
    }
    return langMap[accent]
  }

  // Speak text using Google Cloud TTS
  async speak(text: string, settings: TTSSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop()

      const voiceName = this.getVoiceName(settings.accent, settings.gender)
      const languageCode = this.getLanguageCode(settings.accent)

      // Build request body
      const requestBody = {
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
          ssmlGender: this.convertGender(settings.gender)
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: this.convertRate(settings.rate),
          // Optimized pitch settings for each accent and gender:
          // - Indian female: 1.0 (normal pitch for clarity)
          // - Western/Singapore female: 1.15 (more feminine)
          // - Male: 0.9 (slightly lower)
          pitch: this.convertPitch(
            settings.gender === 'male' ? 0.9 :
            settings.accent === 'indian' ? 1.0 :
            1.15
          )
        }
      }

      console.log('Google TTS Request:', {
        voice: voiceName,
        lang: languageCode,
        gender: settings.gender,
        rate: settings.rate
      })

      // Call Google Cloud TTS API
      fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(`Google TTS API error: ${JSON.stringify(err)}`)
            })
          }
          return response.json()
        })
        .then(data => {
          if (!data.audioContent) {
            throw new Error('No audio content in response')
          }

          // Convert base64 to audio and play
          const audioData = this.base64ToUint8Array(data.audioContent)
          const audioBlob = new Blob([audioData], { type: 'audio/mp3' })
          const audioUrl = URL.createObjectURL(audioBlob)

          const audio = new Audio(audioUrl)

          audio.onplay = () => {
            this.state.playing = true
            this.state.currentAudio = audio
          }

          audio.onended = () => {
            this.state.playing = false
            this.state.currentAudio = null
            URL.revokeObjectURL(audioUrl)
            resolve()
          }

          audio.onerror = (error) => {
            this.state.playing = false
            this.state.currentAudio = null
            URL.revokeObjectURL(audioUrl)
            reject(new Error('Audio playback error'))
          }

          audio.play().catch(error => {
            this.state.playing = false
            this.state.currentAudio = null
            URL.revokeObjectURL(audioUrl)
            reject(error)
          })
        })
        .catch(error => {
          this.state.playing = false
          this.state.currentAudio = null
          reject(error)
        })
    })
  }

  // Pause playback
  pause(): void {
    if (this.state.currentAudio && this.state.playing) {
      this.state.currentAudio.pause()
      this.state.paused = true
    }
  }

  // Resume playback
  resume(): void {
    if (this.state.currentAudio && this.state.paused) {
      this.state.currentAudio.play()
      this.state.paused = false
    }
  }

  // Stop playback
  stop(): void {
    if (this.state.currentAudio) {
      this.state.currentAudio.pause()
      this.state.currentAudio.currentTime = 0
      this.state.currentAudio = null
    }
    this.state.playing = false
    this.state.paused = false
  }

  // Check if currently speaking
  isPlaying(): boolean {
    return this.state.playing && !this.state.paused
  }

  // Check if paused
  isPaused(): boolean {
    return this.state.paused
  }

  // Get state
  getState(): GoogleTTSState {
    return { ...this.state }
  }

  // Helper: Convert base64 to Uint8Array
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }
}

export const googleTTSService = new GoogleTTSService('AIzaSyDQdlh_W85LbCKgtPHMQvq8t3dOx1h7mds')
