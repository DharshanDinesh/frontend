import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split dependencies into separate chunks
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      },
    },
    chunkSizeWarningLimit: 1500, // Set the chunk size limit to 1500 KB (1.5 MB)
  },

})
