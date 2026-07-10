<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import GaugeChart from '../components/GaugeChart.vue'
import MacroBars from '../components/MacroBars.vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'
import { dashboardImage } from '../data/images'

const store = useProfileStore()
const profile = computed(() => store.profile!)
const result = computed(() => store.result!)
const programme = computed(() => store.programme!)

function dayDone(day: number) {
  const p = store.dayProgress(day)
  return p.total > 0 && p.done === p.total
}
</script>

<template>
  <div v-if="profile && result && programme" class="dashboard">
    <section class="hero-banner">
      <img :src="dashboardImage.url" :alt="dashboardImage.alt" class="hero-img" />
      <div class="hero-overlay"></div>
      <div class="hero">
        <p class="eyebrow">{{ programme.name }} programme</p>
        <h1>Welcome back, {{ profile.name }}</h1>
        <p class="lede">{{ programme.description }}</p>
      </div>
    </section>

    <section class="progress-banner" v-reveal>
      <div class="progress-head">
        <span>Week progress</span>
        <span class="mono">{{ store.completedCount }} / {{ store.totalExercises }} exercises</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: store.weekProgressPct + '%' }"></div>
      </div>
    </section>

    <section class="grid" v-reveal>
      <div class="card gauge-card">
        <h3>Calorie target</h3>
        <GaugeChart :target-calories="result.targetCalories" :tdee="result.tdee" :delta="result.calorieDelta" />
      </div>

      <div class="card">
        <h3>Macro split</h3>
        <MacroBars :protein="result.macros.protein" :carbs="result.macros.carbs" :fats="result.macros.fats" />
        <p class="footnote">{{ result.proteinPerKg }}g protein / kg bodyweight — {{ programme.macros.generalRule || 'programme guideline' }}</p>
      </div>

      <div class="card stats-card">
        <h3>Body stats</h3>
        <dl class="stats">
          <div><dt>BMI</dt><dd class="mono">{{ result.bmi }}</dd></div>
          <div><dt>BMR</dt><dd class="mono"><AnimatedNumber :value="result.bmr" /> kcal</dd></div>
          <div><dt>TDEE</dt><dd class="mono"><AnimatedNumber :value="result.tdee" /> kcal</dd></div>
          <div><dt>Current → Target</dt><dd class="mono">{{ profile.currentWeightKg }}kg → {{ profile.targetWeightKg }}kg</dd></div>
        </dl>
      </div>
    </section>

    <section class="week" v-reveal>
      <div class="section-head">
        <h2>7-day schedule</h2>
        <span class="days-available">{{ profile.daysAvailable }} days/week available</span>
      </div>
      <div class="days-grid">
        <RouterLink
          v-for="day in programme.days"
          :key="day.day"
          :to="`/day/${day.day}`"
          class="day-card"
          :class="{ rest: day.isRestDay, done: dayDone(day.day) }"
        >
          <span class="day-num mono">{{ String(day.day).padStart(2, '0') }}</span>
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-title">{{ day.title }}</span>
          <span v-if="day.isRestDay" class="rest-tag">Rest</span>
          <span v-else-if="dayDone(day.day)" class="done-tag">✓ Done</span>
        </RouterLink>
      </div>
    </section>

    <section class="diet-cta" v-reveal>
      <div>
        <h2>Diet plan</h2>
        <p>Full daily meal plan, foods to avoid, and snack options for {{ programme.name }}.</p>
      </div>
      <RouterLink to="/diet" class="btn primary">View diet plan</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1080px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) 20px 100px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.hero-banner {
  position: relative;
  margin: -1px -20px 0;
  min-height: 260px;
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
  animation: dash-kenburns 20s ease-in-out infinite alternate;
}

@keyframes dash-kenburns {
  from { transform: scale(1.04); }
  to { transform: scale(1); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 22, 26, 0.35) 0%, rgba(20, 22, 26, 0.8) 65%, var(--bg) 100%);
}

.hero {
  position: relative;
  padding: 32px 20px 28px;
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
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin-bottom: 10px;
}

.lede {
  color: var(--text-dim);
  max-width: 60ch;
  line-height: 1.5;
}

.progress-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.progress-track {
  height: 8px;
  border-radius: 5px;
  background: var(--surface-2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ember-dim), var(--ember));
  transition: width 0.5s ease;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; }
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.card h3 {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 18px;
}

.gauge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footnote {
  margin-top: 16px;
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.4;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
}

.stats > div {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.stats dt {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.stats dd {
  margin: 0;
  font-weight: 600;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

h2 {
  font-size: 1.4rem;
}

.days-available {
  font-size: 0.8rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .days-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 560px) {
  .days-grid { grid-template-columns: repeat(2, 1fr); }
}

.day-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s, transform 0.15s;
  position: relative;
  min-height: 110px;
}

.day-card:hover {
  border-color: var(--ember);
  transform: translateY(-2px);
}

.day-card.rest {
  background: var(--surface-2);
  opacity: 0.75;
}

.day-num {
  color: var(--ember-soft);
  font-size: 0.75rem;
}

.day-name {
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
}

.day-title {
  font-size: 0.72rem;
  color: var(--text-dim);
  line-height: 1.3;
}

.rest-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.6rem;
  text-transform: uppercase;
  color: var(--steel-light);
  letter-spacing: 0.05em;
}

.day-card.done {
  border-color: var(--ember-dim);
}

.done-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.6rem;
  text-transform: uppercase;
  color: var(--ember-soft);
  letter-spacing: 0.05em;
}

.card {
  transition: transform 0.15s, border-color 0.15s;
}

.card:hover {
  border-color: var(--ember-dim);
}

.diet-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px clamp(20px, 4vw, 36px);
  gap: 20px;
  flex-wrap: wrap;
}

.diet-cta p {
  color: var(--text-dim);
  margin-top: 6px;
}

.btn.primary {
  background: var(--ember);
  color: #14161a;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>
