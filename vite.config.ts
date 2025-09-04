import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pantry/',
  plugins: [react()],
  server: { port: 5173, host: true },
  publicDir: 'public',
});
