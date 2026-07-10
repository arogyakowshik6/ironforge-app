<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  protein: number
  carbs: number
  fats: number
}>()

const proteinKcal = computed(() => props.protein * 4)
const carbsKcal = computed(() => props.carbs * 4)
const fatsKcal = computed(() => props.fats * 9)
const total = computed(() => proteinKcal.value + carbsKcal.value + fatsKcal.value)

const rows = computed(() => [
  { label: 'Protein', grams: props.protein, kcal: proteinKcal.value, pct: (proteinKcal.value / total.value) * 100, color: 'var(--ember)' },
  { label: 'Carbs', grams: props.carbs, kcal: carbsKcal.value, pct: (carbsKcal.value / total.value) * 100, color: 'var(--steel-light)' },
  { label: 'Fats', grams: props.fats, kcal: fatsKcal.value, pct: (fatsKcal.value / total.value) * 100, color: 'var(--ember-dim)' },
])
</script>

<template>
  <div class="macro-bars">
    <div class="stacked">
      <div
        v-for="row in rows"
        :key="row.label"
        class="segment"
        :style="{ width: row.pct + '%', background: row.color }"
      ></div>
    </div>
    <div class="rows">
      <div v-for="row in rows" :key="row.label" class="row">
        <span class="swatch" :style="{ background: row.color }"></span>
        <span class="label">{{ row.label }}</span>
        <span class="grams mono">{{ row.grams }}g</span>
        <span class="pct mono">{{ Math.round(row.pct) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.macro-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stacked {
  display: flex;
  height: 10px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-2);
}

.segment {
  transition: width 0.3s ease;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.label {
  color: var(--text-dim);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.grams {
  font-weight: 600;
}

.pct {
  color: var(--text-dim);
  font-size: 0.8rem;
}
</style>
