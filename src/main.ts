import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installReveal } from './directives/reveal'

// Self-hosted fonts (no external Google Fonts request at runtime)
import '@fontsource/anton/400.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
installReveal(app)
app.mount('#app')
