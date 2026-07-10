<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    decimals?: number
  }>(),
  { duration: 900, decimals: 0 }
)

const display = ref(0)
let raf = 0

function animateTo(target: number) {
  cancelAnimationFrame(raf)
  const start = display.value
  const startTime = performance.now()
  const step = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / props.duration)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = start + (target - start) * eased
    if (t < 1) raf = requestAnimationFrame(step)
    else display.value = target
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => animateTo(props.value))
watch(() => props.value, (v) => animateTo(v))
</script>

<template>
  <span>{{ display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }}</span>
</template>
