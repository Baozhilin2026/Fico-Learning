import { ref, onUnmounted } from 'vue'

interface RecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
}

export function useRecorder() {
  const state = ref<RecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  })

  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let timerInterval: number | null = null
  let startTime: number = 0

  // Request microphone permission and start recording
  async function startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)

        state.value.audioBlob = audioBlob
        state.value.audioUrl = audioUrl
      }

      mediaRecorder.start(100) // Collect data every 100ms
      state.value.isRecording = true
      state.value.isPaused = false
      startTime = Date.now()

      // Start timer
      timerInterval = window.setInterval(() => {
        state.value.duration = Math.floor((Date.now() - startTime) / 1000)
      }, 100)
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('无法访问麦克风，请检查权限设置')
    }
  }

  // Pause recording
  function pauseRecording(): void {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      state.value.isPaused = true

      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }

  // Resume recording
  function resumeRecording(): void {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      state.value.isPaused = false

      // Adjust start time to account for pause duration
      startTime = Date.now() - (state.value.duration * 1000)

      timerInterval = window.setInterval(() => {
        state.value.duration = Math.floor((Date.now() - startTime) / 1000)
      }, 100)
    }
  }

  // Stop recording
  function stopRecording(): void {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    state.value.isRecording = false
    state.value.isPaused = false
  }

  // Reset recorder state
  function resetRecording(): void {
    stopRecording()

    if (state.value.audioUrl) {
      URL.revokeObjectURL(state.value.audioUrl)
    }

    state.value = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null
    }

    audioChunks = []
    mediaRecorder = null
  }

  // Get audio duration as formatted string
  function formattedDuration(): string {
    const minutes = Math.floor(state.value.duration / 60)
    const seconds = state.value.duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Check if browser supports recording
  function isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    resetRecording()
  })

  return {
    state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formattedDuration,
    isSupported
  }
}
