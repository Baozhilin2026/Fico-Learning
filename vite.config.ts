import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Determine base path based on platform
  // Vercel: use '/' (default)
  // GitHub Pages: use '/Fico-Learning/' when hostname includes github.io
  // Tencent Cloud / others: use '/'
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV
  // Check for GitHub Pages at runtime (client-side check in dataLoader handles this)
  // For build time, assume root path for direct deployments (Tencent, etc.)
  const base = '/'

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
