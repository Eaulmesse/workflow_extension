import { defineConfig } from 'vite';
import { resolve } from 'path';
import webExtension from 'vite-plugin-web-extension';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './manifest.json',
      browser: 'chrome',
      htmlViteConfig: { base: './' },
      // Ouvre Chrome avec l'extension chargée depuis dist et recharge à chaque modification
      disableAutoLaunch: false,
      // Rebuild + reload quand le manifest ou ces fichiers changent
      watchFilePaths: [resolve(__dirname, 'manifest.json')],
    }),
  ],
  publicDir: 'src/public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    watch: {
      // Active le polling pour Windows
      chokidar: {
        usePolling: true,
        interval: 1000
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
