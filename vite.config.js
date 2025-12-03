import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use '/Babu-Media/' for GitHub Pages, '/' for local dev
  base: process.env.NODE_ENV === 'production' ? '/Babu-Media/' : '/',
  server: {
    port: 5003
  }
})

