<template>
  <div>
    <div class="sm:hidden">
      <label for="tabs" class="sr-only">Select a tab</label>
      <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
      <select
        :onchange="navigateToTab"
        id="tabs"
        name="tabs"
        class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option v-for="tab in props.tabs" :key="tab.name" :selected="tab.current">
          {{ tab.name }}
        </option>
      </select>
    </div>
    <div class="hidden sm:block">
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
