<script setup lang="ts">
import { useProfileStore } from './stores/profile'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import EmberField from './components/EmberField.vue'

const store = useProfileStore()
const route = useRoute()
const router = useRouter()

function restart() {
  store.reset()
  router.push('/')
}
</script>

<template>
  <div class="shell">
    <EmberField />
    <header class="topbar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 9h2v6H4V9zm3-2h2v10H7V7zm4-2h2v14h-2V5zm4 2h2v10h-2V7zm3 2h2v6h-2V9z" fill="currentColor" />
          </svg>
        </span>
        <span class="brand-name">IRONFORGE<span class="brand-sub">CROSSFIT</span></span>
      </RouterLink>
      <nav v-if="store.isOnboarded" class="nav">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/diet">Diet</RouterLink>
        <button class="reset-btn" @click="restart">Restart</button>
      </nav>
    </header>
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px clamp(20px, 5vw, 56px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(20, 22, 26, 0.9);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text);
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: var(--ember);
  color: #14161a;
  border-radius: 3px;
  clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
}

.brand-mark svg {
  width: 16px;
  height: 16px;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.03em;
  line-height: 1;
}

.brand-sub {
  display: block;
  font-size: 0.6rem;
  color: var(--ember-soft);
  letter-spacing: 0.25em;
  margin-top: 3px;
  font-family: var(--font-mono);
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 0.85rem;
}

.nav a {
  text-decoration: none;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.8rem;
  transition: color 0.15s;
}

.nav a:hover {
  color: var(--text);
}

.nav a.router-link-active {
  color: var(--ember-soft);
}

.reset-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 6px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: border-color 0.15s, color 0.15s, transform 0.15s;
}

.reset-btn:hover {
  border-color: var(--ember);
  color: var(--ember-soft);
  transform: translateY(-1px);
}

main {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>
