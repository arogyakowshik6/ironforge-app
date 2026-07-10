<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProfileStore } from '../stores/profile'
import type { Meal } from '../types'
import { goalImages } from '../data/images'

const store = useProfileStore()
const programme = computed(() => store.programme!)
const diet = computed(() => programme.value.diet)
const accentImage = computed(() => goalImages[programme.value.key])

const carbMode = ref<'training' | 'rest'>('training')
const activeMeals = computed<Meal[]>(() => {
  if (!diet.value.carbCycle) return diet.value.dailyMeals ?? []
  return carbMode.value === 'training' ? diet.value.trainingDayMeals ?? [] : diet.value.restDayMeals ?? []
})
</script>

<template>
  <div class="diet-view">
    <RouterLink to="/dashboard" class="back-link">← Back to dashboard</RouterLink>

    <header>
      <div class="accent-strip">
        <img :src="accentImage.url" :alt="accentImage.alt" />
      </div>
      <p class="eyebrow">{{ programme.name }} — diet plan</p>
      <h1>Nutrition</h1>
      <p class="lede">{{ diet.intro }}</p>
    </header>

    <div v-if="diet.carbCycle" class="toggle">
      <button :class="{ active: carbMode === 'training' }" @click="carbMode = 'training'">Training day (high carb)</button>
      <button :class="{ active: carbMode === 'rest' }" @click="carbMode = 'rest'">Rest day (low carb)</button>
    </div>

    <section class="meals" v-reveal>
      <div v-for="(meal, i) in activeMeals" :key="meal.meal + carbMode" class="meal-card" :style="{ animationDelay: i * 0.05 + 's' }">
        <span class="meal-slot">{{ meal.meal }}</span>
        <span class="meal-name">{{ meal.name }}</span>
        <p class="meal-note">{{ meal.items_note }}</p>
      </div>
    </section>

    <section class="columns" v-reveal>
      <div class="col">
        <h3>Foods to avoid</h3>
        <ul>
          <li v-for="(item, i) in diet.foodsToAvoid" :key="i">{{ item }}</li>
        </ul>
      </div>
      <div class="col" v-if="diet.healthySnacks.length">
        <h3>Healthy snack options</h3>
        <ul>
          <li v-for="(item, i) in diet.healthySnacks" :key="i">{{ item }}</li>
        </ul>
      </div>
      <div class="col" v-if="diet.supplements.length">
        <h3>Supplements</h3>
        <ul>
          <li v-for="(item, i) in diet.supplements" :key="i">{{ item }}</li>
        </ul>
      </div>
    </section>

    <p class="safety-note">Always consult a GP or healthcare professional before starting a new diet programme. These plans are general guidelines — adjust based on how your body responds.</p>
  </div>
</template>

<style scoped>
.diet-view {
  max-width: 820px;
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) 20px 100px;
}

.back-link {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-block;
  margin-bottom: 24px;
}

.back-link:hover {
  color: var(--ember-soft);
}

.eyebrow {
  color: var(--ember-soft);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.accent-strip {
  width: 100%;
  height: 130px;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
  position: relative;
}

.accent-strip::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--bg) 0%, transparent 45%, rgba(20, 22, 26, 0.5) 100%);
}

.accent-strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.5) contrast(1.05);
}

h1 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin-bottom: 12px;
}

.lede {
  color: var(--text-dim);
  line-height: 1.5;
  max-width: 65ch;
}

.toggle {
  display: flex;
  gap: 8px;
  margin: 28px 0;
}

.toggle button {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  padding: 10px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.82rem;
  transition: border-color 0.15s, color 0.15s, transform 0.15s;
}

.toggle button:hover {
  transform: translateY(-1px);
}

.toggle button.active {
  border-color: var(--ember);
  color: var(--ember-soft);
  background: rgba(255, 90, 31, 0.08);
}

.meals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 32px 0;
}

@media (max-width: 640px) {
  .meals { grid-template-columns: 1fr; }
}

.meal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s, transform 0.15s;
  animation: meal-in 0.4s ease both;
}

.meal-card:hover {
  border-color: var(--ember-dim);
  transform: translateY(-2px);
}

@keyframes meal-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.meal-slot {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ember-soft);
}

.meal-name {
  font-weight: 600;
}

.meal-note {
  color: var(--text-dim);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 4px 0 0;
}

.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}

@media (max-width: 760px) {
  .columns { grid-template-columns: 1fr; }
}

.col h3 {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 14px;
}

.col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col li {
  font-size: 0.85rem;
  line-height: 1.5;
  padding-left: 14px;
  position: relative;
  color: var(--text);
}

.col li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  background: var(--ember);
}

.safety-note {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.8rem;
  line-height: 1.5;
}
</style>
