import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El backend corre en el 8080. El proxy permite trabajar en local contra
// rutas relativas (/api/...) y asi no depender de la configuracion de CORS.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        // El stream de asistencias (SSE) es una peticion que no
        // termina, asi que no puede quedar sujeta a un tiempo limite.
        timeout: 0,
        proxyTimeout: 0,
        configure: (proxy) => {
          // Sin esto, un proxy intermedio puede acumular la respuesta
          // y los eventos llegan a rafagas en vez de en el momento.
          proxy.on('proxyRes', (respuesta) => {
            respuesta.headers['cache-control'] = 'no-cache, no-transform'
          })
        },
      },
    },
  },
})
