import { ref, computed, onUnmounted, watch } from 'vue'
import { unifiedTTSService, type TTSEngine } from '@/services/unifiedTTSService'
import { useSettingsStore } from '@/stores/settings'
import type { TTSAccent, TTSGender } from '@/types'

export function useTTS() {
  const settingsStore = useSettingsStore()

  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentSpeed = ref(1.0)
  const progress = ref(0)

  // TTS Engine
  const currentEngine = ref<TTSEngine>('google')

  // Sync currentSpeed with settingsStore.ttsRate
  currentSpeed.value = settingsStore.ttsRate

  // Watch for changes in settingsStore.ttsRate
  watch(() => settingsStore.ttsRate, (newRate) => {
    currentSpeed.value = newRate
  })

  // Get current TTS settings
  const currentSettings = computed(() => ({
    accent: settingsStore.ttsAccent,
    gender: settingsStore.ttsGender,
    rate: currentSpeed.value
  }))

  // Get engine info
  const engineInfo = computed(() => unifiedTTSService.getEngineInfo())

  // Speak text
  async function speak(text: string, options?: {
    accent?: TTSAccent
    gender?: TTSGender
    rate?: number
  }): Promise<void> {
    try {
      isPlaying.value = true
      isPaused.value = false
      progress.value = 0

      const settings = {
        accent: options?.accent || currentSettings.value.accent,
        gender: options?.gender || currentSettings.value.gender,
        rate: options?.rate || currentSettings.value.rate
      }

      // Update engine before speaking
      unifiedTTSService.setEngine(currentEngine.value)

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

  // Update accent setting
  function setAccent(accent: TTSAccent) {
    settingsStore.setTTSAccent(accent)
  }

  // Update gender setting
  function setGender(gender: TTSGender) {
    settingsStore.setTTSGender(gender)
  }

  // Set TTS engine
  function setEngine(engine: TTSEngine) {
    currentEngine.value = engine
    unifiedTTSService.setEngine(engine)
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
    currentAccent: computed(() => currentSettings.value.accent),
    currentGender: computed(() => currentSettings.value.gender),
    currentEngine,
    engineInfo,
    speak,
    pause,
    resume,
    stop,
    setSpeed,
    setAccent,
    setGender,
    setEngine
  }
}
