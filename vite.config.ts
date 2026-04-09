import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd617-160-19-226-171.ngrok-free.app', // Host spesifik kamu
      '.ngrok-free.app' // Atau izinkan semua subdomain ngrok biar awet
    ]
  }
})