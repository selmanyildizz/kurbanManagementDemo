import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // lucide-react kendi React kopyasına çözümlenirse hook'lar "Invalid hook
  // call" ile patlıyor; dedupe tek bir React instance'ı garantiler.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
})
