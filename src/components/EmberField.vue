<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 14 })

const embers = computed(() =>
  Array.from({ length: props.count }, (_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    delay: (Math.random() * 8).toFixed(2),
    duration: (9 + Math.random() * 8).toFixed(2),
    size: (2 + Math.random() * 3).toFixed(1),
    drift: Math.round(Math.random() * 60 - 30),
  }))
)
</script>

<template>
  <div class="ember-field" aria-hidden="true">
    <span
      v-for="e in embers"
      :key="e.id"
      class="ember"
      :style="{
        left: e.left + '%',
        width: e.size + 'px',
        height: e.size + 'px',
        animationDelay: e.delay + 's',
        animationDuration: e.duration + 's',
        '--drift': e.drift + 'px',
      }"
    ></span>
  </div>
</template>

<style scoped>
.ember-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ember {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ember-soft) 0%, var(--ember) 60%, transparent 100%);
  opacity: 0;
  animation-name: rise;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
  box-shadow: 0 0 6px 1px rgba(255, 90, 31, 0.5);
}

@keyframes rise {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.4;
  }
  100% {
    transform: translate(var(--drift), -320px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ember {
    display: none;
  }
}
</style>
