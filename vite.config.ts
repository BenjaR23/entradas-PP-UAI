import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Esto está bien para React 19
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
