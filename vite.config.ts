import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Determine base path based on platform
  // Vercel: use '/' (default)
  // GitHub Pages: use '/Fico-Learning/' when VERCEL_ENV is not set
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV
  const base = mode === 'production' && !isVercel ? '/Fico-Learning/' : '/'

  return {
    plugins: [vue()],
    base,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    }
  }
})
