import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// letters/ is fetched at run time (through letters/index.json), not imported,
// so the build copies it next to the page as is. The dev server serves it
// from the project root.
function copyLetters() {
  return {
    name: 'eidos-copy-letters',
    apply: 'build',
    writeBundle({ dir }) {
      cpSync('letters', join(dir, 'letters'), { recursive: true });
    },
  };
}

export default defineConfig({
  // Relative URLs, so the build works at any path (GitHub Pages serves it
  // under /<repo>/)
  base: './',
  // No index.html fallback, so a missing letter file is a 404 as on GitHub Pages
  appType: 'mpa',
  plugins: [react(), copyLetters()],
  // three.js alone is about 700 kB
  build: { chunkSizeWarningLimit: 1000 },
  server: { port: 5173 },
  preview: { port: 5173 },
});
