import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /url requests backend (port 8001) par proxy hoti hain, isliye CORS ki zaroorat nahi.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/url': 'http://localhost:8001' } },
})
