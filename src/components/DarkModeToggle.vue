<template>
  <button
    aria-label="Toggle Dark Mode"
    @click="toggleDark()"
    class="flex items-center justify-center rounded-full text-gray-100 dark:text-white hover:scale-105 transition-transform ease-in-out duration-200"
  >
    <SunIcon v-if="isDark" class="h-5 w-5 stroke-current fill-current" aria-hidden="true" />
    <MoonIcon v-else class="h-5 w-5 stroke-current" aria-hidden="true" />
  </button>
</template>
<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { SunIcon, MoonIcon } from '@heroicons/vue/20/solid'
import { watch } from 'vue'
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
