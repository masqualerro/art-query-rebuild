<template>
  <div :style="{ background: gradient }" class="w-full h-4 mt-5 rounded-full"></div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type { colorResponse } from '@/interfaces/insights.interfaces'

const api = import.meta.env.VITE_APP_API
const userStore = useUserStore()
const loading = ref(true)
const colorData = ref<colorResponse>()

const fetchColorInsights = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/colors/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      colorData.value = response.data
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
      window.alert(error)
    })
}

const gradient = computed(() => {
  if (colorData.value?.insights) {
    const allColors = colorData.value.insights.flatMap((insight) => insight.hex_colors)
    return `linear-gradient(to right, ${allColors.join(', ')})`
  }
  return ''
})
fetchColorInsights()
</script>
