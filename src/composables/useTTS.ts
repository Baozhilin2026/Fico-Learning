import { ref, computed, onUnmounted, watch } from 'vue'
import { unifiedTTSService } from '@/services/unifiedTTSService'
import { useSettingsStore } from '@/stores/settings'

export function useTTS() {
  const settingsStore = useSettingsStore()

  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentSpeed = ref(1.0)
  const progress = ref(0)

  // Sync currentSpeed with settingsStore.ttsRate
  currentSpeed.value = settingsStore.ttsRate

  // Watch for changes in settingsStore.ttsRate
  watch(() => settingsStore.ttsRate, (newRate) => {
    currentSpeed.value = newRate
  })

  // Get current TTS settings
  const currentSettings = computed(() => ({
    rate: currentSpeed.value
  }))

  // Get engine info
  const engineInfo = computed(() => unifiedTTSService.getEngineInfo())

  // Speak text
  async function speak(text: string, options?: {
    rate?: number
  }): Promise<void> {
    try {
      // Stop any current playback before starting new one
      unifiedTTSService.stop()

      isPlaying.value = true
      isPaused.value = false
      progress.value = 0

      const settings = {
        rate: options?.rate || currentSettings.value.rate
      }

      await unifiedTTSService.speak(text, settings)

      progress.value = 100
    } catch (error) {
      console.error('TTS error:', error)
      throw error
    } finally {
      isPlaying.value = false
      isPaused.value = false
    }
  }

  // Pause playback
  function pause() {
    unifiedTTSService.pause()
    isPaused.value = true
  }

  // Resume playback
  function resume() {
    unifiedTTSService.resume()
    isPaused.value = false
  }

  // Stop playback
  function stop() {
    unifiedTTSService.stop()
    isPlaying.value = false
    isPaused.value = false
    progress.value = 0
  }

  // Set playback speed
  function setSpeed(rate: number) {
    currentSpeed.value = rate
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    isPlaying,
    isPaused,
    currentSpeed,
    progress,
    engineInfo,
    speak,
    pause,
    resume,
    stop,
    setSpeed
  }
}
