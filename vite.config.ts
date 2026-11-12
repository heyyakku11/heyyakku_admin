import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // The app only ever calls /api on its own origin, so the admin session cookie is first-party. In development
      // the dev server forwards /api to VITE_API_BASE_URL (from .env); in production api/[...path].ts does the same
      // using the VITE_API_BASE_URL set in the Vercel project.
      proxy: env.VITE_API_BASE_URL ? { '/api': env.VITE_API_BASE_URL } : undefined,
    },
  }
})
