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
    class="pointer-events-none absolute inset-x-2 top-2 hidden rounded-md border border-white/50 bg-white/90 p-2 text-left text-zinc-900 shadow-[4px_4px_0_rgba(0,0,0,0.22)] backdrop-blur-md group-hover:block group-focus-within:block dark:border-white/15 dark:bg-zinc-950/82 dark:text-zinc-100"
  >
    <div
      v-if="sourceLabel"
      class="mb-1.5 flex items-center justify-between border-b border-zinc-900/10 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:text-zinc-400"
    >
      <span>{{ sourceLabel }}</span>
      <span class="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" aria-hidden="true" />
    </div>
    <ul class="space-y-1 overflow-hidden">
      <li
        v-for="(item, index) in items"
        :key="item"
        :class="{
          'font-semibold text-zinc-950 dark:text-white': index === 0,
          'text-zinc-600 dark:text-zinc-300': index !== 0
        }"
        class="truncate text-xs leading-5"
        :title="item"
      >
        {{ item }}
      </li>
      <li v-if="colorInfo" class="pt-1">
        <div v-if="colorInfo.values.length > 0" class="flex flex-wrap gap-1">
          <span
            v-for="(value, index) in colorInfo.values.slice(0, 6)"
            :key="`${value}-${index}`"
            class="inline-flex max-w-full items-center gap-1 rounded-sm border border-zinc-900/10 bg-zinc-50/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
          >
            <span
              v-if="value.startsWith('#')"
              :style="{ backgroundColor: value }"
              class="h-2.5 w-2.5 rounded-full border border-black/10"
              aria-hidden="true"
            />
            <span class="truncate">{{ value }}</span>
          </span>
        </div>
        <span v-else class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          No color data available
        </span>
      </li>
      <li
        v-if="colorInfo?.gradient"
        :style="{ background: colorInfo.gradient }"
        class="mt-1.5 h-2 rounded-full border border-black/10 dark:border-white/10"
        aria-hidden="true"
      />
    </ul>
  </div>
</template>
