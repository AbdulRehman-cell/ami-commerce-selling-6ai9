import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Force a SINGLE React instance — prevents 'Invalid hook call' /
  // 'Cannot read properties of null (reading useEffect)' from a duplicate React copy.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { proxy: { '/api': 'http://localhost:4000' } },
})
