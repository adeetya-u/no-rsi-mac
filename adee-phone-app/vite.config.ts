import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Standby',
        short_name: 'Standby',
        description: 'Apple Standby Mode for Android – Time, Calendar, Flight Tracker',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'landscape',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['productivity'],
        screenshots: [
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg,jpeg}'],
        globIgnores: ['**/node_modules/**/*', '**/.git/**/*'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/calendar\.google\.com\/calendar\/ical\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'calendar-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/api\.spotify\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spotify-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.+\.(woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
        navigateFallback: '/',
        suppressWarnings: true,
        type: 'module',
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/flights': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/calendar-personal': {
        target: 'https://calendar.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/calendar/ical/adeetya.upadhyay%40gmail.com/private-6ba470ba8e43962700c206a8b6dcf4e2/basic.ics',
      },
      '/api/calendar-university': {
        target: 'https://calendar.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/calendar/ical/adeeu2%40illinois.edu/private-01b52c18754323a77283be3de1adda69/basic.ics',
      },
      '/api/calendar-classes': {
        target: 'https://calendar.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/calendar/ical/5cabb9b3ec6ac2dbb3ae24c46ad81377e1e92c08e445b763b063e7684a814eb6%40group.calendar.google.com/private-b3c76e216ca9c62de3a44f4a9926573c/basic.ics',
      },
    },
  },
})
