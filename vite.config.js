import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      // vitePluginImp({
      //   libList: [
      //     {
      //       libName: 'antd',
      //       style: (name) => `antd/es/${name}/style/css`,
      //     },
      //   ],
      // }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 3000,
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
  }
})
