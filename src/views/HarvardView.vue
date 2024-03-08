<script setup lang="ts">
import axios from 'axios'
import { ref, reactive, computed, watch } from 'vue'
import type { harvardObject } from '@/interfaces/harvard.interfaces'
import { useRouter } from 'vue-router'

const router = useRouter()
const harvardApi = import.meta.env.VITE_HARVARD_API_KEY
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const hover: Record<string, boolean> = reactive({})
const harvardData = ref<harvardObject[]>([])

const getHarvardData = async (searchTerm: string) => {
  try {
    const response = await axios.get(`https://api.harvardartmuseums.org/object`, {
      params: {
        apikey: harvardApi,
        q: searchTerm, // Search term
        fields: 'title,dated,people,primaryimageurl,culture,colors,images',
        sort: 'rank', // Sort by relevance
        size: 50, // Number of results,
        classification: 'Paintings'
      }
    })
    const objectsWithPrimaryImageUrl = response.data.records.filter(
      (object: harvardObject) =>
        object.primaryimageurl && object.images[0] && object.images[0].width >= 600
    )
    console.log(objectsWithPrimaryImageUrl)
    harvardData.value = objectsWithPrimaryImageUrl
  } catch (error) {
    console.error(error)
  }
}

const gradientStyle = (item: harvardObject) => {
  let gradient = 'linear-gradient(to right, '
  gradient += item.colors
    .map((color, index) => `${color.color} ${(index / (item.colors.length - 1)) * 100}%`)
    .join(', ')
  gradient += ')'
  return { background: gradient }
}

watch(
  searchTerm,
  (newVal) => {
    getHarvardData(newVal)
  },
  { immediate: true }
)
</script>
<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: auto;
  grid-auto-flow: dense;
  gap: 6px;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wide-image {
  grid-column: span 2 / auto;
}
.full-span {
  grid-column: span 4 / auto;
}
</style>
<template>
  <main>
    <div class="gallery">
      <div
        v-for="item in harvardData"
        :key="item.id"
        :class="{
          'wide-image': item.images[0].width > item.images[0].height,
          'full-span': item.images[0].width > 2 * item.images[0].height,
          'rounded-lg, relative hover:cursor-help': true
        }"
        @mouseover="hover[item.id] = true"
        @mouseleave="hover[item.id] = false"
      >
        <img
          :src="item.primaryimageurl"
          :alt="item.images[0].description"
          :class="{
            'opacity-50': hover[item.id]
          }"
        />
        <ul
          v-show="hover[item.id]"
          class="absolute top-0 right-0 text-right text-sm text-red-600 bg-black w-full"
        >
          <li class="p-1 rounded-lg">
            {{ item.title }}
          </li>
          <li class="p-1 rounded-lg">
            {{
              item.people && item.people.length > 0 ? item.people[0].displayname : 'Fallback value'
            }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.dated }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.culture }}
          </li>
          <li class="p-1">
            <p
              v-for="(color, index) in item.colors"
              :key="color.color"
              :style="{ color: color.color, display: 'inline' }"
            >
              {{ color.color }}<span v-if="index < item.colors.length - 1">, </span>
            </p>
          </li>
          <li :style="gradientStyle(item)" class="p-1"></li>
        </ul>
      </div>
    </div>
  </main>
</template>
