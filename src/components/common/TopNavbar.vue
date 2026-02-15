<template>
  <nav class="top-navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <img src="/logo.svg" alt="FICO Learning" class="logo" />
        <span class="brand-text">SAP FICO English Learning</span>
      </div>

      <div class="navbar-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <div class="navbar-actions">
        <el-button
          type="danger"
          :icon="SwitchButton"
          size="small"
          @click="handleLogout"
        >
          {{ t('common.logout') }}
        </el-button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { SwitchButton, House, Reading, ChatDotSquare, QuestionFilled, VideoCamera, Star } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const menuItems = computed(() => [
  { name: 'Home', path: '/home', label: t('nav.home'), icon: House },
  { name: 'Vocabulary', path: '/vocabulary', label: t('nav.vocabulary'), icon: Reading },
  { name: 'Communication', path: '/communication', label: t('nav.communication'), icon: ChatDotSquare },
  { name: 'Interview', path: '/interview', label: t('nav.interview'), icon: QuestionFilled },
  { name: 'MockInterview', path: '/mock-interview', label: t('nav.mockInterview'), icon: VideoCamera },
  { name: 'Bookmarks', path: '/bookmarks', label: t('nav.bookmarks'), icon: Star }
])

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      t('auth.logoutConfirm'),
      t('auth.logoutTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    authStore.logout()
    router.push('/authorization')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
.top-navbar {
  height: $navbar-height;
  background-color: $bg-primary;
  border-bottom: 1px solid $border-color;
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
}

.navbar-container {
  max-width: $max-content-width;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  cursor: pointer;

  .logo {
    width: 32px;
    height: 32px;
  }

  .brand-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $primary;
  }
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition: all $transition-fast;
  cursor: pointer;

  &:hover {
    color: $primary;
    background-color: rgba($primary, 0.05);
  }

  &.active {
    color: $primary;
    background-color: rgba($primary, 0.1);
  }

  .el-icon {
    font-size: $font-size-base;
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

@media (max-width: 1024px) {
  .navbar-menu {
    display: none;
  }
}
</style>
