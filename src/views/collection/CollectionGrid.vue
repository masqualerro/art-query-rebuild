<template>
  <div v-if="!loading" class="pt-3">
    <ZoomModal
      :open="modalOpen"
      :imageUrl="imgUrl"
      :imageAlt="imgAlt"
      :isWide="isWideModal"
      @close="toggleModal"
    />
    <div class="gallery">
      <div
        v-for="item in artworkData"
        :key="item.id"
        :class="{
          'wide-image': item.image.imageWidth > item.image.imageHeight,
          'full-span': item.image.imageWidth > 2 * item.image.imageHeight,
          'rounded-lg, relative hover:cursor-help rounded-lg overflow-hidden': true
        }"
        @mouseover="hover[item.id] = true"
        @mouseleave="hover[item.id] = false"
      >
        <img
          :src="item.image.imageUrl"
          :alt="item.image.imageAlt"
          :class="{
            'opacity-50': hover[item.id]
          }"
        />
        <button
          v-show="hover[item.id]"
          type="button"
          class="absolute bottom-2 left-2 inline-flex items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <TrashIcon />
        </button>
        <button
          v-show="hover[item.id]"
          @click="
            toggleModal(
              item.image.imageUrl,
              item.image.imageAlt,
              item.image.imageWidth > item.image.imageHeight
            )
          "
          type="button"
          class="absolute bottom-2 right-2 inline-flex items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80"
        >
          <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        </button>
        <ul
          v-show="hover[item.id]"
          class="absolute top-0 right-0 text-right text-sm text-red-600 bg-black w-full"
        >
          <li class="p-1 rounded-lg">
            {{ `${item.title}, ${item.date}` }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.artist }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.medium }}
          </li>
          <li class="p-1 rounded-lg">
            {{ item.culture }}
          </li>
          <li v-if="item.colors.hex" class="p-1">
            <p
              v-for="(color, index) in item.colors.hex"
              :key="color.color"
              :style="{ color: color.color, display: 'inline' }"
            >
              {{ color.color }}<span v-if="index < item.colors.hex.length - 1">, </span>
            </p>
          </li>
          <li v-if="item.colors.hex" :style="gradientStyle(item)" class="p-1"></li>
          <li class="p-1" v-if="item.colors.hsl">
            <p :style="{ color: item.colors.hsl }">
              {{ parseHSL(item.colors.hsl) }}
            </p>
          </li>
          <li class="p-1" v-else-if="!item.colors.hex && !item.colors.hsl">
            <p class="text-white">No color data available</p>
          </li>
          <li :style="{ background: item.colors.hsl }" class="p-1" v-if="item.colors.hsl"></li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-y-4 items-center justify-center">
    <BlackGlyph class="animate-bounce h-8 w-auto" />
    <p class="text-sm italic">Fetching saved art ...</p>
  </div>
</template>
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
@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(1, 1fr);
  }
  .wide-image {
    grid-column: span 2 / auto;
  }
}
</style>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type { artworkObject } from '@/interfaces/artworks.interfaces'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'
import ZoomModal from '@/components/ZoomModal.vue'
import { MagnifyingGlassPlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

const api = import.meta.env.VITE_APP_API
const userStore = useUserStore()
const loading = ref(true)
const isSubmitting = ref(false)
const hover: Record<string, boolean> = reactive({})
const artworkData = ref<artworkObject[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')

onMounted(() => {
  if (!userStore.user) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const noPassword = JSON.parse(storedUser)
      delete noPassword.password
      userStore.setUser(noPassword)
    }
  }
})

const fetchCollection = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artworks/user/${userStore.user?.id}`, config)
    .then((response) => {
      console.log(response)
      loading.value = false
      artworkData.value = response.data
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
      window.alert(error)
    })
}
const toggleModal = (clickedUrl: string, clickedAlt: string, isWide: boolean) => {
  isWideModal.value = isWide

  modalOpen.value = !modalOpen.value
  if (!modalOpen.value) {
    setTimeout(() => {
      imgUrl.value = clickedUrl
      imgAlt.value = clickedAlt
    }, 300)
  } else {
    imgUrl.value = clickedUrl
    imgAlt.value = clickedAlt
  }
}
// const deleteArtwork = (id: number) => {
//   isSubmitting.value = true
//   const token = localStorage.getItem('token')

//   const config = {
//     headers: { Authorization: `Bearer ${token}` }
//   }

//   axios
//     .delete(`${api}/artworks/${userStore.user?.id}`, data, config)
//     .then((response) => {
//       console.log(response)
//       isSubmitting.value = false
//       useArtworkStore().addHarvardArtwork(artwork.id)
//     })
//     .catch((error) => {
//       console.error(error)
//       isSubmitting.value = false
//     })
// }
const gradientStyle = (item: artworkObject) => {
  let gradient = 'linear-gradient(to right, '
  gradient += item.colors.hex
    .map((color, index) => `${color.color} ${(index / (item.colors.hex.length - 1)) * 100}%`)
    .join(', ')
  gradient += ')'
  return { background: gradient }
}
function parseHSL(hsl: string) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i)
  if (match) {
    return `hue: ${match[1]}, saturation: ${match[2]}, lightness: ${match[3]}`
  }
  return { hue: '', saturation: '', lightness: '' }
}
fetchCollection()
</script>
