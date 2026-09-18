// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Uvozimo ruter

createApp(App).use(router).mount('#app') // Dodajemo .use(router)
