<template>
  <footer class="bottom-info-bar">
    <div class="info-bar-container">
      <div class="info-item">
        <span>v{{ version }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const version = ref('1.0.0')

onMounted(async () => {
  try {
    const { dataLoader } = await import('@/services/dataLoader')
    const config = await dataLoader.loadConfig()
    version.value = config.version
  } catch (error) {
    console.error('Failed to load config for info bar:', error)
  }
})
</script>

<style scoped lang="scss">
.bottom-info-bar {
  height: $bottombar-height;
  background-color: $bg-primary;
  border-top: 1px solid $border-color;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-fixed;
}

.info-bar-container {
  max-width: $max-content-width;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
  padding: 0 $spacing-lg;
}

.info-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  color: $text-disabled;

  .el-icon {
    font-size: $font-size-sm;
  }
}

@media (max-width: 768px) {
  .info-bar-container {
    gap: $spacing-md;
    font-size: 10px;
  }
}
</style>
