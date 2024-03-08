<script setup lang="ts">
import axios from 'axios'
import { ref, reactive, computed, watch } from 'vue'
import type { chicagoObject, imageObject, colorObject } from '@/interfaces/chicago.interfaces'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const hover: Record<string, boolean> = reactive({})

const chicagoData = ref<chicagoObject[]>([])
const images = ref<imageObject>({
  iiif_url: 'https://www.artic.edu/iiif/2',
  website_url: 'http://www.artic.edu'
})

const getChicagoData = async (searchTerm: string) => {
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&limit=50&&fields=id,title,image_id,artist_title,classification_titles,color,style_titles,artwork_type_title,medium_display,date_display,artist_display,thumbnail`
    )
    chicagoData.value = response.data.data.filter((item: chicagoObject) => item.thumbnail !== null)
    images.value = response.data.config
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}
const handleImageError = (event: any) => {
  event.target.style.display = 'none'
}

const createHSLColor = (color: colorObject) => {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`
}

watch(
  searchTerm,
  (newVal) => {
    getChicagoData(newVal)
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
        v-for="item in chicagoData"
        :key="item.id"
        :class="{
          'wide-image': item.thumbnail.width > item.thumbnail.height,
          'full-span': item.thumbnail.width > 2 * item.thumbnail.height,
          'rounded-lg, relative hover:cursor-help': true
        }"
        @mouseover="hover[item.id] = true"
        @mouseleave="hover[item.id] = false"
      >
        <img
          :src="images.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg'"
          :class="{
            'opacity-50': hover[item.id]
          }"
          @error="handleImageError"
          :alt="item.thumbnail.alt_text"
        />
        <ul
          v-show="hover[item.id]"
          class="absolute top-0 right-0 text-right text-sm text-red-600 bg-black w-full"
        >
          <li class="p-1 rounded-lg">
            {{ item.title }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.artist_title }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.date_display }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.medium_display }}
          </li>
          <li class="p-1" v-if="item.color">
            <p :style="{ color: createHSLColor(item.color) }">
              {{ `hue: ${item.color.h}, saturation: ${item.color.s}, lightness ${item.color.l}` }}
            </p>
          </li>
          <li class="p-1" v-else>
            <p class="text-white">No color data available</p>
          </li>
          <li
            :style="{ background: createHSLColor(item.color) }"
            class="p-1"
            v-if="item.color"
          ></li>
        </ul>
      </div>
    </div>
  </main>
</template>
