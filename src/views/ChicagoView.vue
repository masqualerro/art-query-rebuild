<script setup lang="ts">
import axios from 'axios'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { chicagoObject, imageObject, colorObject } from '@/interfaces/chicago.interfaces'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useArtworkStore } from '@/stores/artworks'
import ZoomModal from '@/components/ZoomModal.vue'
import {
  HeartIcon,
  MagnifyingGlassPlusIcon,
  FaceFrownIcon,
  FaceSmileIcon
} from '@heroicons/vue/24/outline'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'

const userStore = useUserStore()
const artworkStore = useArtworkStore()

onMounted(() => {
  if (!userStore.user) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const noPassword = JSON.parse(storedUser)
      delete noPassword.password
      userStore.setUser(noPassword)
      mapArtworks()
    }
  } else {
    mapArtworks()
  }
})

const api = import.meta.env.VITE_APP_API
const router = useRouter()
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const hover: Record<string, boolean> = reactive({})
const isSubmitting = ref(false)
const savedArtworks = ref<number[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const loading = ref(true)
const loadingNext = ref(false)
const imageLoadCount = ref(0)
const imageErrorCount = ref(0)
const currentPage = ref(1)
const totalPages = ref(0) // Initialize totalPages to 0
import nationalities from '@/json/nationalities.json'

const chicagoData = ref<chicagoObject[]>([])
const images = ref<imageObject>({
  iiif_url: 'https://www.artic.edu/iiif/2',
  website_url: 'http://www.artic.edu'
})

// API CALLS
const getChicagoData = async (searchTerm: string) => {
  imageLoadCount.value = 0
  imageErrorCount.value = 0
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 3000)
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&limit=50&page=1&fields=id,title,image_id,artist_title,classification_titles,color,style_titles,artwork_type_title,medium_display,date_display,artist_display,thumbnail`
    )
    chicagoData.value = response.data.data.filter((item: chicagoObject) => item.thumbnail !== null)
    images.value = response.data.config
    currentPage.value = 1
    totalPages.value = response.data.pagination.total_pages
    if (chicagoData.value.length === 0) {
      loading.value = false
    }
  } catch (error) {
    console.error(error)
  }
}

const loadMoreChicagoData = async (searchTerm: string) => {
  loadingNext.value = true
  try {
    currentPage.value++ // Increment the page number
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&limit=50&page=${currentPage.value}&fields=id,title,image_id,artist_title,classification_titles,color,style_titles,artwork_type_title,medium_display,date_display,artist_display,thumbnail`
    )
    const newChicagoData = response.data.data.filter(
      (item: chicagoObject) => item.thumbnail !== null
    )
    chicagoData.value = [...chicagoData.value, ...newChicagoData] // Append the new data
    images.value = response.data.config
    totalPages.value = response.data.pagination.total_pages // Store total_pages
    loadingNext.value = false
  } catch (error) {
    console.error(error)
  }
}

const saveArtwork = (artwork: chicagoObject) => {
  const data = {
    museum_id: 1,
    artwork_id: artwork.id,
    title: artwork.title,
    artist: artwork.artist_title ? artwork.artist_title : 'Unknown Artist',
    date: artwork.date_display,
    medium: artwork.medium_display,
    artwork_type: artwork.artwork_type_title,
    colors: JSON.stringify({
      hex: null,
      hsl: createHSLColor(artwork.color)
    }),
    styles: JSON.stringify(
      [...artwork.classification_titles, ...artwork.style_titles].filter(Boolean)
    ),
    image: {
      artwork_id: artwork.id,
      imageUrl: images.value.iiif_url + '/' + artwork.image_id + '/full/843,/0/default.jpg',
      imageAlt: (artwork.thumbnail.alt_text || artwork.title).substring(0, 300),
      imageWidth: artwork.thumbnail.width,
      imageHeight: artwork.thumbnail.height
    },
    culture: extractCulture(artwork.artist_display, artwork.title)
  }
  // isSubmitting.value = true
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .post(`${api}/artworks/${userStore.user?.id}`, data, config)
    .then(() => {
      isSubmitting.value = false
      savedArtworks.value.push(artwork.id)
      useArtworkStore().addChicagoArtwork(artwork.id)
    })
    .catch((error) => {
      if (error.response.status === 401) {
        router.push('/login')
        isSubmitting.value = false
      } else {
        console.error(error)
        isSubmitting.value = false
      }
    })
}

const extractCulture = (str: string, title: string) => {
  str = str.replace(/\n/g, ' ')
  let foundNationality = ''

  // First, check if the entire string matches any nationality
  const words = str.split(/\s+/)

  // Check each word against nationalities
  for (let word of words) {
    for (let nationality of nationalities) {
      if (word.includes(nationality)) {
        foundNationality = nationality
        return foundNationality // Return as soon as a nationality is found
      }
    }
  }

  // If no match is found, then split the string into words and check each word against nationalities
  if (!foundNationality) {
    if (title.includes('Mexico')) {
      foundNationality = 'Mexican'
      return foundNationality
    }
    if (str.includes('United States') || str.includes('Navajo') || str.includes('Osage')) {
      foundNationality = 'American'
      return foundNationality
    } else if (str.includes('Mexico')) {
      foundNationality = 'Mexican'
      return foundNationality
    } else if (str.includes('Netherlandish')) {
      foundNationality = 'Flemish'
      return foundNationality
    }
    const words = str.toLowerCase().split(/\s+/) // Split input string into words
    for (let word of words) {
      for (let nationality of nationalities) {
        if (nationality.toLowerCase().includes(word)) {
          foundNationality = nationality
          break // Exit the loop if a match is found
        }
      }
      if (foundNationality) {
        break // Exit the loop if a match is found
      }
    }
  }

  return foundNationality
}

const mapArtworks = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artworks/map/${userStore.user?.id}`, config)
    .then((response) => {
      savedArtworks.value = response.data
      useArtworkStore().setChicagoArtworks(response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

// METHODS AND UTILS

const handleImageLoad = () => {
  imageLoadCount.value++
  checkAllImagesLoaded()
}

const handleImageError = (event: any) => {
  imageErrorCount.value++
  event.target.style.display = 'none'
  checkAllImagesLoaded()
}

const checkAllImagesLoaded = () => {
  if (imageLoadCount.value + imageErrorCount.value === chicagoData.value.length) {
    loading.value = false
  }
}

const createHSLColor = (color: colorObject) => {
  if (!color) return '#fff'
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`
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
@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(1, 1fr);
  }
  .wide-image {
    grid-column: span 1 / auto;
  }
}
</style>
<template>
  <main>
    <ZoomModal
      :open="modalOpen"
      :imageUrl="imgUrl"
      :imageAlt="imgAlt"
      :isWide="isWideModal"
      @close="toggleModal"
    />
    <div v-show="!loading">
      <div v-show="chicagoData.length > 0">
        <div class="gallery">
          <div
            v-for="item in chicagoData"
            :key="item.id"
            :class="{
              'wide-image': item.thumbnail.width > item.thumbnail.height,
              'full-span': item.thumbnail.width > 2 * item.thumbnail.height,
              'rounded-lg, relative hover:cursor-help rounded-lg overflow-hidden': true
            }"
            @mouseover="hover[item.id] = true"
            @mouseleave="hover[item.id] = false"
          >
            <img
              :src="images.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg'"
              :class="{
                'opacity-50': hover[item.id]
              }"
              @load="handleImageLoad"
              @error="handleImageError"
              :alt="item.thumbnail.alt_text"
            />
            <button
              :disabled="artworkStore.chicago.includes(item.id) || savedArtworks.includes(item.id)"
              v-show="hover[item.id]"
              @click="saveArtwork(item)"
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
              <HeartIcon
                v-else
                :class="{
                  'text-red-600 fill-red-600':
                    artworkStore.chicago.includes(item.id) || savedArtworks.includes(item.id),
                  'text-white':
                    !artworkStore.chicago.includes(item.id) || !savedArtworks.includes(item.id)
                }"
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
            <button
              v-show="hover[item.id]"
              @click="
                toggleModal(
                  images.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg',
                  item.thumbnail.alt_text,
                  item.thumbnail.width > item.thumbnail.height
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
                  {{
                    `hue: ${item.color.h}, saturation: ${item.color.s}, lightness ${item.color.l}`
                  }}
                </p>
              </li>
              <li class="p-1" v-else>
                <p class="text-white">No color data available</p>
              </li>
              <li :style="{ color: createHSLColor(item.color) }" class="p-1" v-if="item.color"></li>
            </ul>
          </div>
        </div>
        <div class="flex items-center justify-center mt-4">
          <button
            v-if="currentPage < totalPages"
            @click="loadMoreChicagoData(searchTerm)"
            type="button"
            class="flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <svg
              v-if="loadingNext"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
            <span v-if="loadingNext">Loading ...</span>
            <span v-else>Load More</span>
          </button>
        </div>
      </div>
      <div v-show="chicagoData.length === 0" class="flex flex-col items-center justify-center h-52">
        <FaceFrownIcon class="h-8 w-auto text-gray-400" />
        <p class="text-center text-sm font-semibold mt-4">
          No results found for search term <span class="italic">'{{ searchTerm }}'</span>
          <br />
          <br />
          <router-link
            class="text-indigo-600 hover:text-indigo-500"
            :to="`/harvard?searchTerm=${searchTerm}`"
            >Search with the Harvard Art Museums API</router-link
          >
          <br />
          <br />
          <span class="flex items-center gap-x-2 justify-center">
            or change your search term. <FaceSmileIcon class="h-5 w-5"></FaceSmileIcon
          ></span>
        </p>
      </div>
    </div>
    <div
      v-show="loading"
      class="flex flex-col gap-y-4 items-center justify-center mt-10 min-h-full"
    >
      <BlackGlyph class="animate-bounce h-8 w-auto" />
      <p class="text-sm italic">Fetching Art ...</p>
    </div>
  </main>
</template>
