import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import global CSS (Tailwind directives will be in this file)
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // When a new SW finishes activating (new deploy), reload so the fresh
      // assets are served instead of the old cached ones.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            window.location.reload()
          }
        })
      })
    }).catch((error) => {
      console.log('Échec de l\'enregistrement du Service Worker:', error);
    });
  });
}
