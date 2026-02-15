// Vercel API Route for Google Cloud TTS
// This route proxies TTS requests to hide the API key

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TTSRequest {
  text: string
  languageCode?: string
  name?: string
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL'
  speakingRate?: number
  pitch?: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, languageCode = 'en-US', name, ssmlGender = 'NEUTRAL', speakingRate = 1.0, pitch = 0 } = req.body as TTSRequest

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    // Build voice selection based on accent and gender
    let selectedVoice = name

    // Default voices based on language code and gender
    if (!selectedVoice) {
      const voiceMap: Record<string, Record<string, string>> = {
        'en-IN': {
          'MALE': 'en-IN-Standard-A',
          'FEMALE': 'en-IN-Standard-B',
          'NEUTRAL': 'en-IN-Wavenet-A'
        },
        'en-AU': {
          'MALE': 'en-AU-Standard-B',
          'FEMALE': 'en-AU-Standard-A',
          'NEUTRAL': 'en-AU-Wavenet-A'
        },
        'en-GB': {
          'MALE': 'en-GB-Standard-B',
          'FEMALE': 'en-GB-Standard-A',
          'NEUTRAL': 'en-GB-Wavenet-A'
        },
        'en-US': {
          'MALE': 'en-US-Standard-B',
          'FEMALE': 'en-US-Standard-C',
          'NEUTRAL': 'en-US-Wavenet-A'
        }
      }

      const voices = voiceMap[languageCode] || voiceMap['en-US']
      selectedVoice = voices[ssmlGender] || voices['NEUTRAL']
    }

    // Call Google Cloud TTS API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: selectedVoice,
          ssmlGender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate,
          pitch
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Google TTS API error:', errorData)
      return res.status(response.status).json({
        error: 'Google TTS API error',
        details: errorData
      })
    }

    const data = await response.json()

    // Return the audio content as base64
    res.status(200).json({
      audioContent: data.audioContent,
      voice: selectedVoice
    })

  } catch (error) {
    console.error('TTS API error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
