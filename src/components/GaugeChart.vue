<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

const props = defineProps<{
  targetCalories: number
  tdee: number
  delta: number
}>()

const RANGE = 1000

function targetAngle(target: number, tdee: number) {
  const pct = (target - (tdee - RANGE)) / (RANGE * 2)
  const clamped = Math.min(1, Math.max(0, pct))
  return -90 + clamped * 180
}

// Animated angle: sweeps from -90 (empty) to the real target angle on mount / change
const animatedAngle = ref(-90)
let raf = 0

function animateAngle(to: number) {
  cancelAnimationFrame(raf)
  const from = animatedAngle.value
  const startTime = performance.now()
  const duration = 1100
  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    animatedAngle.value = from + (to - from) * eased
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => animateAngle(targetAngle(props.targetCalories, props.tdee)))
watch(
  () => [props.targetCalories, props.tdee],
  () => animateAngle(targetAngle(props.targetCalories, props.tdee))
)

const cx = 100
const cy = 100
const r = 74

function toPoint(a: number) {
  const rad = (a * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

const needlePoint = computed(() => toPoint(animatedAngle.value))

const arcPath = computed(() => {
  const p0 = toPoint(0)
  const p1 = toPoint(animatedAngle.value)
  const largeArc = Math.abs(animatedAngle.value - 0) > 180 ? 1 : 0
  const sweep = animatedAngle.value > 0 ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${p1.x} ${p1.y}`
})

const isSurplus = computed(() => props.delta > 0)
</script>

<template>
  <div class="gauge">
    <svg viewBox="0 0 200 116" class="gauge-svg" aria-hidden="true">
      <path d="M 26 100 A 74 74 0 0 1 174 100" fill="none" stroke="var(--surface-2)" stroke-width="10" stroke-linecap="round" />
      <path
        :d="arcPath"
        fill="none"
        :stroke="isSurplus ? 'var(--ember)' : 'var(--steel-light)'"
        stroke-width="10"
        stroke-linecap="round"
      />
      <line x1="100" y1="100" :x2="needlePoint.x" :y2="needlePoint.y" stroke="var(--text)" stroke-width="2" />
      <circle cx="100" cy="100" r="4" fill="var(--text)" />
      <circle cx="26" cy="100" r="2" fill="var(--border)" />
      <circle cx="174" cy="100" r="2" fill="var(--border)" />
    </svg>
    <div class="gauge-readout">
      <span class="value mono"><AnimatedNumber :value="targetCalories" /></span>
      <span class="unit">kcal / day target</span>
      <span class="delta mono" :class="isSurplus ? 'up' : 'down'">
        {{ isSurplus ? '+' : '' }}{{ delta }} kcal vs TDEE ({{ tdee.toLocaleString() }})
      </span>
    </div>
  </div>
</template>

<style scoped>
.gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.gauge-svg {
  width: 100%;
  max-width: 260px;
}

.gauge-readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: -8px;
}

.value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text);
}

.unit {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.delta {
  font-size: 0.85rem;
  margin-top: 6px;
}

.delta.up {
  color: var(--ember-soft);
}

.delta.down {
  color: var(--steel-light);
}
</style>
