<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import type { harvardObject } from '@/interfaces/harvard.interfaces'
const harvardData = ref<harvardObject[]>([])
const harvardApi = import.meta.env.VITE_HARVARD_API_KEY
const searchTerm = ref('expressionism')

const getHarvardData = async () => {
  try {
    const response = await axios.get(`https://api.harvardartmuseums.org/object`, {
      params: {
        apikey: harvardApi,
        // title: searchTerm.value,
        // classification: 'Paintings',
        q: searchTerm.value, // Search term
        fields: 'title,dated,people,primaryimageurl,culture,colors,images',
        sort: 'rank', // Sort by relevance
        // facets: ['classification', 'culture'], // Aggregations on classification and culture
        size: 100, // Number of results,
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
getHarvardData()
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

img.four-grid-cells {
  grid-row: span 2 / auto;
  grid-column: span 2 / auto;
}

img.wide-image {
  grid-column: span 2 / auto;
}
img.full-span {
  grid-column: span 4 / auto;
}
</style>
<template>
  <main>
    <!-- input for searchTerm -->
    <input class="text-black" type="text" v-model="searchTerm" />
    <button @click="getHarvardData">Search</button>
    <div class="gallery">
      <img
        v-for="(item, index) in harvardData"
        :key="item.id"
        :class="{
          'four-grid-cells': index === 0,
          'wide-image': item.images[0].width > item.images[0].height,
          'full-span': item.images[0].width > 2 * item.images[0].height,
          'rounded-lg': true
        }"
        :src="item.primaryimageurl"
        alt=""
      />
    </div>
  </main>
</template>
