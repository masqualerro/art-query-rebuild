<script setup lang="ts">
import axios from 'axios'
import { ref, computed } from 'vue'
import type { chicagoObject, imageObject } from '@/interfaces/chicago.interfaces'
const chicagoData = ref<chicagoObject[]>([])

const images = ref<imageObject>({
  iiif_url: 'https://www.artic.edu/iiif/2',
  website_url: 'http://www.artic.edu'
})
const searchTerm = ref('renaissance')

const getChicagoData = async () => {
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm.value}&limit=100&&fields=id,title,image_id,artist_title,classification_titles,dimensions,color,style_titles,artwork_type_title`
    )
    chicagoData.value = response.data.data.filter((item: chicagoObject) => item.dimensions !== null)
    images.value = response.data.config
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}
getChicagoData()

let wideImages = ref<number[]>([])

const handleImageLoad = (id: number, event: any) => {
  const img = event.target
  if (img.naturalWidth > img.naturalHeight) {
    wideImages.value.push(id)
  }
}

const handleImageError = (event: any) => {
  event.target.style.display = 'none'
}
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
</style>
<template>
  <main>
    <!-- input for searchTerm -->
    <input class="text-black" type="text" v-model="searchTerm" />
    <button @click="getChicagoData">Search</button>
    <div class="gallery">
      <img
        v-for="(item, index) in chicagoData"
        :key="item.id"
        :class="{
          'four-grid-cells': index === 0,
          'wide-image': wideImages.includes(item.id),
          'rounded-lg': true
        }"
        :src="images.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg'"
        @error="handleImageError"
        @load="handleImageLoad(item.id, $event)"
        alt=""
      />
    </div>
  </main>
</template>
