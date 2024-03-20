<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  HeartIcon,
  MagnifyingGlassPlusIcon,
  FaceFrownIcon,
  FaceSmileIcon
} from '@heroicons/vue/24/outline'
import type { harvardObject, paginationObject } from '@/interfaces/harvard.interfaces'
import { useUserStore } from '@/stores/user'
import { useArtworkStore } from '@/stores/artworks'
import ZoomModal from '@/components/ZoomModal.vue'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'

const userStore = useUserStore()
const artworkStore = useArtworkStore()
const loading = ref(true)

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

const router = useRouter()
const api = import.meta.env.VITE_APP_API
const harvardApi = import.meta.env.VITE_HARVARD_API_KEY
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const hover: Record<string, boolean> = reactive({})
const harvardData = ref<harvardObject[]>([])
const imageLoadCount = ref(0)
const imageErrorCount = ref(0)
const isSubmitting = ref(false)
const savedArtworks = ref<number[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const loadingNext = ref(false)
const pagination = ref({} as paginationObject)
let nextUrl = ref('')

const getHarvardData = async (searchTerm: string) => {
  imageLoadCount.value = 0
  imageErrorCount.value = 0
  loading.value = true
  if (searchTerm !== '') {
    setTimeout(() => {
      loading.value = false
    }, 3000)
  }

  try {
    const response = await axios.get(`https://api.harvardartmuseums.org/object`, {
      params: {
        apikey: harvardApi,
        q: searchTerm, // Search term
        fields:
          'title,dated,people,primaryimageurl,culture,colors,color,images,classification,medium,period,division,url,rank',
        sort: 'rank', // Sort by relevance
        size: 50, // Number of results,
        classification: 'Paintings'
      }
    })
    const objectsWithPrimaryImageUrl = response.data.records.filter(
      (object: harvardObject) =>
        object.primaryimageurl && object.images[0] && object.images[0].width >= 600
    )
    harvardData.value = objectsWithPrimaryImageUrl
    pagination.value = response.data.info
    nextUrl.value = response.data.info.next
    if (harvardData.value.length === 0) {
      loading.value = false
    }
  } catch (error) {
    console.error(error)
  }
}

const loadMoreHarvardData = async () => {
  if (nextUrl.value) {
    loadingNext.value = true
    try {
      const response = await axios.get(nextUrl.value)
      const objectsWithPrimaryImageUrl = response.data.records.filter(
        (object: harvardObject) =>
          object.primaryimageurl && object.images[0] && object.images[0].width >= 600
      )
      harvardData.value = [...harvardData.value, ...objectsWithPrimaryImageUrl] // Append the new data
      pagination.value = response.data.info
      nextUrl.value = response.data.info.next // Update the "next" URL
      loadingNext.value = false
    } catch (error) {
      console.error(error)
    }
  }
}

const saveArtwork = (artwork: harvardObject) => {
  const data = {
    museum_id: 1,
    artwork_id: artwork.id,
    title: artwork.title,
    artist: artwork.people && artwork.people.length > 0 ? artwork.people[0].displayname : '',
    date: artwork.dated,
    culture: artwork.culture,
    medium: artwork.medium,
    colors: JSON.stringify({
      hex: artwork.colors,
      hsl: null
    }),
    classification: JSON.stringify({
      period: artwork.period,
      division: artwork.division,
      type: artwork.classification
    }),
    image: {
      artwork_id: artwork.id,
      imageUrl: artwork.primaryimageurl,
      imageAlt: artwork.images[0].alttext || artwork.title,
      imageWidth: artwork.images[0].width,
      imageHeight: artwork.images[0].height
    }
  }
  isSubmitting.value = true
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .post(`${api}/artworks/${userStore.user?.id}`, data, config)
    .then(() => {
      isSubmitting.value = false
      savedArtworks.value.push(artwork.id)
      useArtworkStore().addHarvardArtwork(artwork.id)
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

const mapArtworks = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artworks/map/${userStore.user?.id}`, config)
    .then((response) => {
      savedArtworks.value = response.data
      useArtworkStore().setHarvardArtworks(response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

const handleImageLoad = (url: string) => {
  imageLoadCount.value++
  checkAllImagesLoaded()
}

const handleImageError = (url: string) => {
  imageErrorCount.value++
  checkAllImagesLoaded()
}

const checkAllImagesLoaded = () => {
  if (imageLoadCount.value + imageErrorCount.value === harvardData.value.length) {
    loading.value = false
  }
}

// METHODS AND UTILS
const gradientStyle = (item: harvardObject) => {
  let gradient = 'linear-gradient(to right, '
  gradient += item.colors
    .map((color, index) => `${color.color} ${(index / (item.colors.length - 1)) * 100}%`)
    .join(', ')
  gradient += ')'
  return { background: gradient }
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
      <div v-show="harvardData.length > 0">
        <div class="gallery">
          <div
            v-for="item in harvardData"
            :key="item.id"
            :class="{
              'wide-image': item.images[0].width > item.images[0].height,
              'full-span': item.images[0].width > 2 * item.images[0].height,
              'rounded-lg, relative hover:cursor-help rounded-lg overflow-hidden': true
            }"
            @mouseover="hover[item.id] = true"
            @mouseleave="hover[item.id] = false"
          >
            <img
              :src="item.primaryimageurl"
              :alt="item.images[0].alttext"
              :class="{
                'opacity-50': hover[item.id]
              }"
              @load="handleImageLoad(item.primaryimageurl)"
              @error="handleImageError(item.primaryimageurl)"
            />
            <button
              :disabled="artworkStore.harvard.includes(item.id) || savedArtworks.includes(item.id)"
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
                    artworkStore.harvard.includes(item.id) || savedArtworks.includes(item.id),
                  'text-white':
                    !artworkStore.harvard.includes(item.id) || !savedArtworks.includes(item.id)
                }"
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
            <button
              v-show="hover[item.id]"
              @click="
                toggleModal(
                  item.primaryimageurl,
                  item.images[0].alttext,
                  item.images[0].width > item.images[0].height
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
                {{ `${item.title}, ${item.dated}` }}
              </li>
              <li class="p-1 rounded-lg">
                {{
                  item.people && item.people.length > 0
                    ? item.people[0].displayname
                    : 'Fallback value'
                }}
              </li>
              <li class="p-1 rounded-lg">
                {{ item.medium }}
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
        <div class="flex items-center justify-center mt-4">
          <button
            v-if="nextUrl"
            @click="loadMoreHarvardData"
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
      <div v-show="harvardData.length === 0" class="flex flex-col items-center justify-center h-52">
        <FaceFrownIcon class="h-8 w-auto text-gray-400" />
        <p class="text-center text-sm font-semibold mt-4">
          No results found for search term <span class="italic">'{{ searchTerm }}'</span>
          <br />
          <br />
          <router-link
            class="text-indigo-600 hover:text-indigo-500"
            :to="`/chicago?searchTerm=${searchTerm}`"
            >Search with the Chicago Art Institute API</router-link
          >
          <br />
          <br />
          <span class="flex items-center gap-x-2 justify-center">
            or change your search term. <FaceSmileIcon class="h-5 w-5"></FaceSmileIcon
          ></span>
        </p>
      </div>
    </div>
    <div v-show="loading" class="flex flex-col gap-y-4 items-center justify-center mt-10">
      <BlackGlyph class="animate-bounce h-8 w-auto" />
      <p class="text-sm italic">Fetching Art ...</p>
    </div>
  </main>
</template>
