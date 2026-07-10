<script setup lang="ts">
withDefaults(defineProps<{ kind: 'dumbbell' | 'barbell' | 'kettlebell' | 'flame' }>(), {})
</script>

<template>
  <svg viewBox="0 0 40 40" class="icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <template v-if="kind === 'dumbbell'">
      <rect x="4" y="16" width="5" height="8" rx="1.5" stroke="currentColor" stroke-width="1.6" />
      <rect x="31" y="16" width="5" height="8" rx="1.5" stroke="currentColor" stroke-width="1.6" />
      <rect x="9" y="18.5" width="6" height="3" fill="currentColor" />
      <rect x="25" y="18.5" width="6" height="3" fill="currentColor" />
      <line x1="15" y1="20" x2="25" y2="20" stroke="currentColor" stroke-width="2.4" />
    </template>
    <template v-else-if="kind === 'barbell'">
      <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" stroke-width="2" />
      <rect x="7" y="13" width="3.5" height="14" rx="1" stroke="currentColor" stroke-width="1.6" />
      <rect x="12" y="15.5" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.6" />
      <rect x="29.5" y="13" width="3.5" height="14" rx="1" stroke="currentColor" stroke-width="1.6" />
      <rect x="25" y="15.5" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.6" />
    </template>
    <template v-else-if="kind === 'kettlebell'">
      <path d="M16 14c0-3 2-5 4-5s4 2 4 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="20" cy="26" r="10" stroke="currentColor" stroke-width="1.8" />
      <path d="M14 14h12v4H14z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
    </template>
    <template v-else>
      <path
        d="M20 5c2 5-3 6-3 10 0 2 1.5 3 3 3s3-1.4 3-3.2c1.6 1.6 2.5 3.6 2.5 6a5.5 5.5 0 1 1-11 0C14.5 14 20 11 20 5z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </template>
  </svg>
</template>

<style scoped>
.icon {
  width: 28px;
  height: 28px;
  color: var(--ember-soft);
}
</style>
