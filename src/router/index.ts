import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/authorization'
    },
    {
      path: '/authorization',
      name: 'Authorization',
      component: () => import('@/views/Authorization.vue'),
      meta: { requiresAuth: false, isAuthPage: true }
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vocabulary',
      name: 'Vocabulary',
      component: () => import('@/views/Vocabulary.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/communication',
      name: 'Communication',
      component: () => import('@/views/Communication.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/interview',
      name: 'InterviewContent',
      component: () => import('@/views/InterviewContent.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mock-interview',
      name: 'MockInterview',
      component: () => import('@/views/MockInterview.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/bookmarks',
      name: 'Bookmarks',
      component: () => import('@/views/Bookmarks.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/authorization'
    }
  ]
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already initialized
  if (!authStore.state.loginTime) {
    await authStore.initialize()
  }

  // Check session validity
  authStore.checkSession()

  const requiresAuth = to.meta.requiresAuth !== false
  const isAuthPage = to.meta.isAuthPage === true
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    // Redirect to authorization page if not authenticated
    next('/authorization')
  } else if (isAuthPage && isAuthenticated) {
    // Redirect to home if already authenticated
    next('/home')
  } else {
    next()
  }
})

export default router
