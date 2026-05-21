import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.loca.lt', '.ngrok-free.dev'],
  },


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
