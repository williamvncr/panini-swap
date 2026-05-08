import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
      ],
      output: {
        paths: {
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js': 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
          'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js': 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
        }
      }
    }
  }
})
