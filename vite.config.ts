import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            const normalizedId = id.replace(/\\/g, '/');
            const packagePath = normalizedId.split('node_modules/').pop();
            const packageName = packagePath?.startsWith('@')
              ? packagePath.split('/').slice(0, 2).join('/')
              : packagePath?.split('/')[0];

            if (packageName === 'react' || packageName === 'react-dom' || packageName === 'scheduler') {
              return 'vendor-react';
            }

            if (packageName === 'recharts' || packageName?.startsWith('d3-')) {
              return 'vendor-charts';
            }

            if (packageName === 'html2canvas') {
              return 'vendor-capture';
            }

            if (packageName === 'motion' || packageName === 'framer-motion') {
              return 'vendor-motion';
            }

            if (packageName === 'lucide-react') {
              return 'vendor-icons';
            }

            if (packageName?.startsWith('@supabase/')) {
              return 'vendor-supabase';
            }
          },
        },
      },
    },
  };
});
