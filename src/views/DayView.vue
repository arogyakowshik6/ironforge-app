<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'

const props = defineProps<{ day: string }>()
const store = useProfileStore()
const programme = computed(() => store.programme!)
const dayNum = computed(() => Number(props.day))
const day = computed(() => programme.value.days.find((d) => d.day === dayNum.value))

const prevDay = computed(() => (dayNum.value > 1 ? dayNum.value - 1 : null))
const nextDay = computed(() => (dayNum.value < 7 ? dayNum.value + 1 : null))

const progress = computed(() => store.dayProgress(dayNum.value))
const progressPct = computed(() =>
  progress.value.total > 0 ? Math.round((progress.value.done / progress.value.total) * 100) : 0
)

function exKey(si: number, ei: number) {
  return `${dayNum.value}:${si}:${ei}`
}
function isDone(si: number, ei: number) {
  return !!store.completed[exKey(si, ei)]
}
function toggle(si: number, ei: number) {
  store.toggleExercise(exKey(si, ei))
}
</script>

<template>
  <div v-if="day" class="day-view">
    <RouterLink to="/dashboard" class="back-link">← Back to dashboard</RouterLink>

    <header class="day-header">
      <p class="eyebrow mono">Day {{ String(day.day).padStart(2, '0') }} · {{ day.dayName }}</p>
      <h1>{{ day.title }}</h1>
      <div v-if="!day.isRestDay" class="day-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="mono">{{ progress.done }} / {{ progress.total }} done</span>
      </div>
    </header>

    <div v-if="day.isRestDay" class="rest-panel">
      <p>{{ day.restNote }}</p>
    </div>

    <div v-else class="sessions">
      <div v-for="(session, si) in day.sessions" :key="si" class="session" v-reveal>
        <h3 v-if="session.label" class="session-label">{{ session.label }}</h3>
        <div class="exercise-list">
          <button
            v-for="(ex, ei) in session.exercises"
            :key="ei"
            type="button"
            class="exercise"
            :class="{ done: isDone(si, ei) }"
            @click="toggle(si, ei)"
          >
            <span class="check" :class="{ checked: isDone(si, ei) }">
              <svg v-if="isDone(si, ei)" viewBox="0 0 16 16" width="11" height="11">
                <path d="M2 8.5 6 12l8-8" stroke="#14161a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="ex-body">
              <span class="ex-head">
                <span class="ex-name">{{ ex.name }}</span>
                <span class="ex-prescription mono">{{ ex.prescription }}</span>
              </span>
              <span class="ex-desc">{{ ex.description }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <nav class="day-nav">
      <RouterLink v-if="prevDay" :to="`/day/${prevDay}`" class="nav-btn">← Day {{ prevDay }}</RouterLink>
      <span v-else></span>
      <RouterLink v-if="nextDay" :to="`/day/${nextDay}`" class="nav-btn">Day {{ nextDay }} →</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.day-view {
  max-width: 760px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) 20px 100px;
}

.back-link {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-block;
  margin-bottom: 24px;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--ember-soft);
}

.eyebrow {
  color: var(--ember-soft);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.day-header {
  margin-bottom: 32px;
}

h1 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin-bottom: 16px;
}

.day-progress {
  display: flex;
  align-items: center;
  gap: 14px;
}

.day-progress .progress-track {
  flex: 1;
  height: 6px;
  border-radius: 4px;
  background: var(--surface-2);
  overflow: hidden;
}

.day-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ember-dim), var(--ember));
  transition: width 0.4s ease;
}

.day-progress span.mono {
  font-size: 0.78rem;
  color: var(--text-dim);
  white-space: nowrap;
}

.rest-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  color: var(--text-dim);
  line-height: 1.6;
}

.sessions {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.session-label {
  font-size: 0.9rem;
  color: var(--ember-soft);
  margin-bottom: 14px;
  text-transform: none;
  letter-spacing: 0;
  font-family: var(--font-body);
  font-weight: 600;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--ember);
  border-radius: var(--radius);
  padding: 16px 20px;
  cursor: pointer;
  font-family: var(--font-body);
  color: var(--text);
  transition: border-color 0.15s, transform 0.1s, opacity 0.2s;
}

.exercise:hover {
  border-color: var(--ember-soft);
}

.exercise:active {
  transform: scale(0.995);
}

.exercise.done {
  opacity: 0.55;
  border-left-color: var(--steel);
}

.exercise.done .ex-name {
  text-decoration: line-through;
  text-decoration-color: var(--text-dim);
}

.check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  margin-top: 2px;
  display: grid;
  place-items: center;
  transition: background 0.15s, border-color 0.15s;
}

.check.checked {
  background: var(--ember);
  border-color: var(--ember);
}

.ex-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.ex-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.ex-name {
  font-weight: 600;
}

.ex-prescription {
  font-size: 0.8rem;
  color: var(--ember-soft);
  white-space: nowrap;
}

.ex-desc {
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.5;
}

.day-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.nav-btn {
  color: var(--text);
  text-decoration: none;
  border: 1px solid var(--border);
  padding: 10px 18px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  transition: border-color 0.15s, transform 0.15s;
}

.nav-btn:hover {
  border-color: var(--ember);
  transform: translateY(-1px);
}
</style>
