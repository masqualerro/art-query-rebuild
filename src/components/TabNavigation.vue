<template>
  <div>
    <div class="block">
      <nav class="flex space-x-4" aria-label="Tabs">
        <router-link
          v-for="tab in props.tabs"
          :key="tab.name"
          :to="tab.href"
          :class="[
            route.path === tab.href
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-500 hover:text-gray-700',
            'rounded-md px-3 py-2 text-sm font-medium'
          ]"
          :aria-current="route.path === tab.href ? 'page' : undefined"
          >{{ tab.name }}</router-link
        >
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  }
})

const navigateToTab = (event) => {
  const selectedTab = event.target.value
  const tab = props.tabs.find((t) => t.name === selectedTab)
  if (tab) {
    router.push(tab.href)
  }
}
</script>
