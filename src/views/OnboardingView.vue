<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profile'
import type { UserProfile } from '../types'
import { heroImage } from '../data/images'
import EquipmentIcon from '../components/EquipmentIcon.vue'

const router = useRouter()
const store = useProfileStore()

const step = ref(0)

const form = reactive({
  name: '',
  age: 28,
  gender: 'undisclosed' as UserProfile['gender'],
  heightCm: 175,
  currentWeightKg: 80,
  targetWeightKg: 75,
  bodyType: 'mesomorph' as UserProfile['bodyType'],
  experience: 'beginner' as UserProfile['experience'],
  goal: 'weight-loss' as UserProfile['goal'],
  daysAvailable: 4,
  equipment: 'gym' as UserProfile['equipment'],
  healthFlag: 'none' as UserProfile['healthFlag'],
})

const steps = [
  { key: 'identity', title: 'Who are you' },
  { key: 'body', title: 'Body stats' },
  { key: 'type', title: 'Body type & experience' },
  { key: 'goal', title: 'Your goal' },
  { key: 'schedule', title: 'Training schedule' },
  { key: 'health', title: 'Health check' },
]

const isLast = computed(() => step.value === steps.length - 1)
const canProceed = computed(() => {
  if (step.value === 0) return form.name.trim().length > 0 && form.age >= 16 && form.age <= 70
  if (step.value === 1) return form.heightCm > 0 && form.currentWeightKg > 0 && form.targetWeightKg > 0
  return true
})

function next() {
  if (isLast.value) {
    submit()
  } else if (canProceed.value) {
    step.value++
  }
}

function back() {
  if (step.value > 0) step.value--
}

function submit() {
  store.setProfile({ ...form })
  router.push('/dashboard')
}
</script>

<template>
  <div class="onboarding">
    <div class="hero-banner">
      <img :src="heroImage.url" :alt="heroImage.alt" class="hero-img" />
      <div class="hero-overlay"></div>
      <div class="intro">
        <p class="eyebrow">First login</p>
        <h1>Build your plan</h1>
        <p class="lede">Twelve questions. One personalised programme — calories, macros, and a full 7-day schedule, forged for your goal.</p>
      </div>
    </div>

    <div class="wizard" v-reveal>
      <div class="progress">
        <div
          v-for="(s, i) in steps"
          :key="s.key"
          class="progress-step"
          :class="{ done: i < step, active: i === step }"
        >
          <span class="dot"></span>
          <span class="label">{{ s.title }}</span>
        </div>
      </div>

      <div class="panel">
        <!-- Step 0: identity -->
        <div v-if="step === 0" class="fields">
          <label class="field">
            <span>Name / nickname</span>
            <input v-model="form.name" type="text" placeholder="e.g. Sam" />
          </label>
          <label class="field">
            <span>Age</span>
            <input v-model.number="form.age" type="number" min="16" max="70" />
          </label>
          <label class="field">
            <span>Gender</span>
            <select v-model="form.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="undisclosed">Prefer not to say</option>
            </select>
          </label>
        </div>

        <!-- Step 1: body stats -->
        <div v-else-if="step === 1" class="fields">
          <label class="field">
            <span>Height (cm)</span>
            <input v-model.number="form.heightCm" type="number" min="100" max="230" />
          </label>
          <label class="field">
            <span>Current weight (kg)</span>
            <input v-model.number="form.currentWeightKg" type="number" min="30" max="250" />
          </label>
          <label class="field">
            <span>Target weight (kg)</span>
            <input v-model.number="form.targetWeightKg" type="number" min="30" max="250" />
          </label>
        </div>

        <!-- Step 2: body type & experience -->
        <div v-else-if="step === 2" class="fields">
          <label class="field">
            <span>Body type</span>
            <select v-model="form.bodyType">
              <option value="ectomorph">Ectomorph — naturally slim</option>
              <option value="mesomorph">Mesomorph — athletic build</option>
              <option value="endomorph">Endomorph — naturally heavier</option>
            </select>
          </label>
          <label class="field">
            <span>Gym experience</span>
            <select v-model="form.experience">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        <!-- Step 3: goal -->
        <div v-else-if="step === 3" class="fields goal-fields">
          <label
            v-for="g in [
              { v: 'weight-loss', t: 'Weight Loss', d: 'Reduce body fat with cardio and circuits', icon: 'flame' },
              { v: 'bulking', t: 'Bulking', d: 'Build maximum muscle with heavy compound lifts', icon: 'barbell' },
              { v: 'cutting', t: 'Cutting', d: 'Lose fat, retain muscle, high protein', icon: 'dumbbell' },
              { v: 'shredding', t: 'Shredding', d: 'Competition-level leanness, carb cycling', icon: 'kettlebell' },
            ]"
            :key="g.v"
            class="goal-card"
            :class="{ selected: form.goal === g.v }"
          >
            <input v-model="form.goal" type="radio" name="goal" :value="g.v" />
            <EquipmentIcon :kind="g.icon as any" />
            <span class="goal-title">{{ g.t }}</span>
            <span class="goal-desc">{{ g.d }}</span>
          </label>
        </div>

        <!-- Step 4: schedule -->
        <div v-else-if="step === 4" class="fields">
          <label class="field">
            <span>Days available per week</span>
            <select v-model.number="form.daysAvailable">
              <option v-for="d in [3, 4, 5, 6, 7]" :key="d" :value="d">{{ d }} days</option>
            </select>
          </label>
          <label class="field">
            <span>Equipment access</span>
            <select v-model="form.equipment">
              <option value="home">Home only</option>
              <option value="gym">Full gym</option>
              <option value="both">Both</option>
            </select>
          </label>
        </div>

        <!-- Step 5: health -->
        <div v-else class="fields">
          <label class="field">
            <span>Health conditions</span>
            <select v-model="form.healthFlag">
              <option value="none">None</option>
              <option value="injury">Injury</option>
              <option value="medical">Medical condition</option>
            </select>
          </label>
          <p v-if="form.healthFlag !== 'none'" class="notice">
            Flagged for safety review — please consult a GP before starting, and modify exercises that aggravate your condition.
          </p>
        </div>
      </div>

      <div class="actions">
        <button v-if="step > 0" class="btn ghost" @click="back">Back</button>
        <span v-else></span>
        <button class="btn primary" :disabled="!canProceed" @click="next">
          {{ isLast ? 'Generate my plan' : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

.hero-banner {
  position: relative;
  margin: 0 -20px 40px;
  min-height: 320px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.4) contrast(1.1);
  animation: kenburns 18s ease-in-out infinite alternate;
}

@keyframes kenburns {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(20, 22, 26, 0.35) 0%, rgba(20, 22, 26, 0.75) 60%, var(--bg) 100%),
    linear-gradient(90deg, rgba(20, 22, 26, 0.55), transparent 60%);
}

.intro {
  position: relative;
  padding: 40px 20px 32px;
  animation: fade-up 0.7s ease both;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
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
  font-size: clamp(2rem, 5vw, 2.75rem);
  margin-bottom: 12px;
}

.lede {
  color: var(--text-dim);
  max-width: 46ch;
  line-height: 1.5;
}

.progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 4px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}

.progress-step.done .dot {
  background: var(--ember-dim);
  border-color: var(--ember);
}

.progress-step.active .dot {
  background: var(--ember);
  box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.18);
}

.progress-step .label {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: none;
}

.progress-step.active .label {
  color: var(--text);
  display: block;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: clamp(20px, 4vw, 36px);
  min-height: 260px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

input, select {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 12px 14px;
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: var(--font-body);
}

input:focus, select:focus {
  border-color: var(--ember);
}

.goal-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 560px) {
  .goal-fields { grid-template-columns: 1fr; }
}

.goal-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  background: var(--surface-2);
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.goal-card:hover {
  transform: translateY(-2px);
  border-color: var(--ember-dim);
}

.goal-card input {
  position: absolute;
  opacity: 0;
}

.goal-card.selected {
  border-color: var(--ember);
  box-shadow: inset 0 0 0 1px var(--ember);
  background: linear-gradient(180deg, rgba(255, 90, 31, 0.08), transparent);
}

.goal-title {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.goal-desc {
  font-size: 0.82rem;
  color: var(--text-dim);
}

.notice {
  background: rgba(255, 90, 31, 0.08);
  border: 1px solid var(--ember-dim);
  padding: 12px 14px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--ember-soft);
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.btn.primary {
  background: var(--ember);
  color: #14161a;
  font-weight: 600;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 90, 31, 0.25);
}

.btn.primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--text-dim);
}

.btn.ghost:hover {
  border-color: var(--ember);
  color: var(--ember-soft);
}
</style>
