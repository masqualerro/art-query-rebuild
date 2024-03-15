<template>
  <div class="flex justify-between items-center">
    <TabNavigation :tabs="tabs"></TabNavigation>
  </div>
  <RouterView></RouterView>
</template>
<script setup>
import TabNavigation from '@/components/TabNavigation.vue'
import { RouterView } from 'vue-router'

const tabs = [
  { name: 'Display', href: '/collection/display', current: false },
  { name: 'Insights', href: '/collection/insights', current: false }
]
</script>
