import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/src/data/')) return 'app-data';
            if (!id.includes('node_modules')) return;
            if (id.includes('/node_modules/xlsx/')) return 'vendor-xlsx';
            if (id.includes('/node_modules/jspdf/') || id.includes('/node_modules/html2canvas/')) return 'vendor-pdf';
            if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) return 'vendor-firebase';
            if (id.includes('/node_modules/recharts/') || id.includes('/node_modules/d3')) return 'vendor-charts';
            if (id.includes('/node_modules/lucide-react/')) return 'vendor-icons';
            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router')
            ) {
              return 'vendor-react';
            }
          },
        },
      },
    },
  };
});
