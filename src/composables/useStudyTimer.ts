import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useProgressStore } from '@/stores/progress'

// Global timer state (shared across all components)
let globalTimer: number | null = null
let activeSessions = 0
let accumulatedSeconds = 0
let lastSaveTime = Date.now()

export function useStudyTimer() {
  const progressStore = useProgressStore()

  // Format seconds to minutes display
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }

  // Get current study time in minutes
  function getCurrentStudyTime(): number {
    return progressStore.getProgress().todayStudyTime
  }

  // Start the study timer
  function startTimer() {
    activeSessions++

    // If this is the first active session, start the global timer
    if (activeSessions === 1 && !globalTimer) {
      lastSaveTime = Date.now()
      globalTimer = window.setInterval(() => {
        const now = Date.now()
        const elapsedSeconds = Math.floor((now - lastSaveTime) / 1000)
        accumulatedSeconds += elapsedSeconds
        lastSaveTime = now

        // Save to progress every 60 seconds (1 minute)
        if (accumulatedSeconds >= 60) {
          const minutes = Math.floor(accumulatedSeconds / 60)
          progressStore.addStudyTime(minutes)
          accumulatedSeconds = accumulatedSeconds % 60
        }
      }, 1000) // Update every second
    }
  }

  // Stop the study timer
  function stopTimer() {
    activeSessions--

    // If no more active sessions, stop the global timer and save remaining time
    if (activeSessions <= 0 && globalTimer) {
      clearInterval(globalTimer)
      globalTimer = null

      // Save any remaining accumulated time
      if (accumulatedSeconds > 0) {
        const minutes = Math.ceil(accumulatedSeconds / 60)
        if (minutes > 0) {
          progressStore.addStudyTime(minutes)
        }
        accumulatedSeconds = 0
      }

      activeSessions = 0
    }
  }

  // Auto-start timer on mount
  onMounted(() => {
    startTimer()
  })

  // Auto-stop timer on unmount (beforeUnmount is more reliable)
  onBeforeUnmount(() => {
    stopTimer()
  })

  return {
    getCurrentStudyTime,
    formatTime,
    startTimer,
    stopTimer
  }
}
