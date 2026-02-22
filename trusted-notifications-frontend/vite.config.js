import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: repo name must match exactly
export default defineConfig({
  plugins: [react()],
  base: '/Trusted-notifications/',
})