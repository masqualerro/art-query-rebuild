<script setup lang="ts">
defineProps<{
  sourceLabel?: string
  items: string[]
  colorInfo?: {
    values: string[]
    gradient: string | null
  } | null
}>()
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 top-0 hidden bg-black/90 text-right text-sm text-red-500 group-hover:block group-focus-within:block"
  >
    <div
      v-if="sourceLabel"
      class="border-b border-white/10 px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-white"
    >
      {{ sourceLabel }}
    </div>
    <ul class="max-h-56 overflow-hidden">
      <li v-for="item in items" :key="item" class="truncate px-2 py-1" :title="item">
        {{ item }}
      </li>
      <li v-if="colorInfo" class="px-2 py-1">
        <template v-if="colorInfo.values.length > 0">
          <span
            v-for="(value, index) in colorInfo.values"
            :key="`${value}-${index}`"
            :style="{ color: value.startsWith('#') ? value : colorInfo.gradient || undefined }"
          >
            {{ value }}<span v-if="index < colorInfo.values.length - 1">, </span>
          </span>
        </template>
        <span v-else class="text-white">No color data available</span>
      </li>
      <li
        v-if="colorInfo?.gradient"
        :style="{ background: colorInfo.gradient }"
        class="h-5 px-2 py-1"
        aria-hidden="true"
      />
    </ul>
  </div>
</template>
