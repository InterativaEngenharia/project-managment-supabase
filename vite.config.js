import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // O @base44/vite-plugin removido também fornecia essa resolução de
      // alias (usada em ~170 arquivos do projeto: import x from "@/...").
      // Sem isso, o build quebra inteiro — mantido aqui manualmente.
      '@': path.resolve(__dirname, './src'),
    },
  },
});
