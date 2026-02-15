import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TTSAccent, TTSGender } from '@/types'

const STORAGE_KEY = 'fico_settings'

interface SettingsState {
  ttsAccent: TTSAccent
  ttsGender: TTSGender
  ttsRate: number
  autoPlay: boolean
  showChinese: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  ttsAccent: 'western',
  ttsGender: 'female',
  ttsRate: 1.0,
  autoPlay: false,
  showChinese: true
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsState>({ ...DEFAULT_SETTINGS })

  // Load settings from localStorage
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Migrate old rate values to new ones for better speed differentiation
        if (parsed.ttsRate === 0.8 || parsed.ttsRate === 0.75) {
          parsed.ttsRate = 0.6
        } else if (parsed.ttsRate === 1.2 || parsed.ttsRate === 1.4) {
          parsed.ttsRate = 1.6
        }
        settings.value = { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // Update individual settings
  function setTTSAccent(accent: TTSAccent) {
    settings.value.ttsAccent = accent
    saveSettings()
  }

  function setTTSGender(gender: TTSGender) {
    settings.value.ttsGender = gender
    saveSettings()
  }

  function setTTSRate(rate: number) {
    settings.value.ttsRate = rate
    saveSettings()
  }

  function setAutoPlay(value: boolean) {
    settings.value.autoPlay = value
    saveSettings()
  }

  function setShowChinese(value: boolean) {
    settings.value.showChinese = value
    saveSettings()
  }

  // Reset to defaults
  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveSettings()
  }

  // Initialize on store creation
  loadSettings()

  return {
    settings,
    ttsAccent: computed(() => settings.value.ttsAccent),
    ttsGender: computed(() => settings.value.ttsGender),
    ttsRate: computed(() => settings.value.ttsRate),
    autoPlay: computed(() => settings.value.autoPlay),
    showChinese: computed(() => settings.value.showChinese),
    setTTSAccent,
    setTTSGender,
    setTTSRate,
    setAutoPlay,
    setShowChinese,
    resetSettings,
    saveSettings
  }
})

import { computed } from 'vue'
