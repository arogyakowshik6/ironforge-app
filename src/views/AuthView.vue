<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { ApiError } from '../lib/api'

const router = useRouter()
const auth = useAuthStore()
const profileStore = useProfileStore()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({ email: '', password: '', name: '' })

const heading = computed(() => (mode.value === 'login' ? 'Sign in' : 'Create an account'))

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(form.email, form.password)
    } else {
      await auth.register(form.email, form.password, form.name)
    }
    await profileStore.syncFromServer()
    router.push(profileStore.isOnboarded ? '/dashboard' : '/')
  } catch (err) {
    if (err instanceof ApiError) {
      errorMsg.value = err.message || 'Something went wrong — try again.'
    } else {
      errorMsg.value = 'Could not reach the server. Is the API running?'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="panel" v-reveal>
      <p class="eyebrow">Account</p>
      <h1>{{ heading }}</h1>
      <p class="lede">
        {{
          mode === 'login'
            ? 'Sign in to sync your plan and progress across devices.'
            : 'Create an account to save your plan and progress to the cloud.'
        }}
      </p>

      <form class="fields" @submit.prevent="submit">
        <label v-if="mode === 'register'" class="field">
          <span>Name</span>
          <input v-model="form.name" type="text" required autocomplete="name" />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="form.email" type="email" required autocomplete="email" />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="form.password" type="password" required autocomplete="current-password" minlength="8" />
        </label>

        <p v-if="errorMsg" class="error-msg" role="alert">{{ errorMsg }}</p>

        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? 'Please wait…' : heading }}
        </button>
      </form>

      <button class="switch-mode" type="button" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in' }}
      </button>

      <RouterLink to="/" class="skip-link">Continue without an account →</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  max-width: 460px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 80px) 20px 80px;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: clamp(24px, 5vw, 40px);
}

.eyebrow {
  color: var(--ember-soft);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.lede {
  color: var(--text-dim);
  line-height: 1.5;
  margin-bottom: 28px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 12px 14px;
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: var(--font-body);
}

input:focus {
  border-color: var(--ember);
}

.error-msg {
  background: rgba(255, 90, 31, 0.08);
  border: 1px solid var(--ember-dim);
  padding: 10px 14px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--ember-soft);
  margin: 0;
}

.btn.primary {
  background: var(--ember);
  color: #14161a;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 90, 31, 0.25);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-mode {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.82rem;
  margin-top: 20px;
  cursor: pointer;
  text-align: center;
}

.switch-mode:hover {
  color: var(--ember-soft);
}

.skip-link {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--text-dim);
  text-decoration: none;
}

.skip-link:hover {
  color: var(--text);
}
</style>
