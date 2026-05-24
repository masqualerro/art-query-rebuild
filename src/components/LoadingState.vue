<script setup lang="ts">
import BlackGlyph from '@/components/icons/BlackGlyph.vue'

withDefaults(
  defineProps<{
    label?: string
    className?: string
  }>(),
  {
    label: 'Fetching Art ...',
    className: ''
  }
)
</script>

<template>
  <div
    :class="[
      'mt-10 flex min-h-full flex-col items-center justify-center gap-y-4',
      className
    ]"
  >
    <BlackGlyph class="h-8 w-auto animate-bounce" />
    <p class="text-sm italic">{{ label }}</p>
  </div>
</template>
