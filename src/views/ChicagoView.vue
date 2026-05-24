<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { chicagoObject, imageObject, colorObject } from '@/interfaces/chicago.interfaces'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useArtworkStore } from '@/stores/artworks'
import ZoomModal from '@/components/ZoomModal.vue'
import ArtworkHoverInfo from '@/components/gallery/ArtworkHoverInfo.vue'
import TumblrMasonryGallery from '@/components/gallery/TumblrMasonryGallery.vue'
import {
  HeartIcon,
  MagnifyingGlassPlusIcon,
  FaceFrownIcon,
  FaceSmileIcon
} from '@heroicons/vue/24/outline'
import LoadingState from '@/components/LoadingState.vue'
import {
  deleteArtworkBySource,
  fetchSavedArtworkMap,
  saveArtwork as saveArtworkRequest,
  searchChicagoArtworks
} from '@/services/artworkApi'
import { isCanceledRequest, isUnauthorizedError } from '@/services/apiClient'

const userStore = useUserStore()
const artworkStore = useArtworkStore()

onMounted(() => {
  userStore.hydrateSession()
  if (userStore.user) {
    mapArtworks()
  }
})

const router = useRouter()
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const isSubmitting = ref(false)
const savedArtworks = ref<string[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const loading = ref(true)
const loadingNext = ref(false)
const currentPage = ref(1)
const totalPages = ref(0) // Initialize totalPages to 0
const chicagoData = ref<chicagoObject[]>([])
const images = ref<imageObject>({
  iiif_url: 'https://www.artic.edu/iiif/2',
  website_url: 'http://www.artic.edu'
})
let searchController: AbortController | null = null

const galleryItems = computed(() =>
  chicagoData.value.map((item) => ({
    ...item,
    id: String(item.id),
    imageUrl: `${images.value.iiif_url}/${item.image_id}/full/843,/0/default.jpg`,
    imageAlt: item.thumbnail?.alt_text || item.title
  }))
)

// API CALLS
const getChicagoData = async (searchTerm: string) => {
  searchController?.abort()
  searchController = new AbortController()
  loading.value = true
  try {
    const data = await searchChicagoArtworks(searchTerm, 1, { signal: searchController.signal })
    chicagoData.value = data.data.filter((item: chicagoObject) => item.thumbnail !== null)
    images.value = data.config
    currentPage.value = 1
    totalPages.value = data.pagination.total_pages
  } catch (error) {
    if (isCanceledRequest(error)) return
    console.error(error)
    chicagoData.value = []
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

const loadMoreChicagoData = async (searchTerm: string) => {
  if (loadingNext.value || currentPage.value >= totalPages.value) return

  loadingNext.value = true
  try {
    currentPage.value++ // Increment the page number
    const data = await searchChicagoArtworks(searchTerm, currentPage.value)
    const newChicagoData = data.data.filter((item: chicagoObject) => item.thumbnail !== null)
    chicagoData.value = [...chicagoData.value, ...newChicagoData] // Append the new data
    images.value = data.config
    totalPages.value = data.pagination.total_pages // Store total_pages
    loadingNext.value = false
  } catch (error) {
    console.error(error)
    loadingNext.value = false
  }
}

const saveArtwork = (artwork: chicagoObject) => {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  const externalId = String(artwork.id)
  const isSaved =
    artworkStore.chicago.includes(externalId) || savedArtworks.value.includes(externalId)
  isSubmitting.value = true

  const request = isSaved
    ? deleteArtworkBySource('CHICAGO', externalId)
    : saveArtworkRequest({ source: 'CHICAGO', artwork, imageBaseUrl: images.value.iiif_url })

  request
    .then(() => {
      if (isSaved) {
        savedArtworks.value = savedArtworks.value.filter((id) => id !== externalId)
        artworkStore.removeArtwork('CHICAGO', externalId)
      } else {
        savedArtworks.value.push(externalId)
        artworkStore.addChicagoArtwork(externalId)
      }
    })
    .catch((error) => {
      if (isUnauthorizedError(error)) {
        router.push('/login')
      } else {
        console.error(error)
      }
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

const mapArtworks = () => {
  if (!userStore.user) return

  fetchSavedArtworkMap()
    .then((savedMap) => {
      savedArtworks.value = savedMap.chicago
      useArtworkStore().setChicagoArtworks(savedMap.chicago)
    })
    .catch((error) => {
      console.error(error)
    })
}

// METHODS AND UTILS

const createHSLColor = (color: colorObject) => {
  if (!color) return '#fff'
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`
}

const getHoverItems = (item: chicagoObject) =>
  [item.title, item.artist_title, item.date_display, item.medium_display].filter(
    Boolean
  ) as string[]

const getColorInfo = (item: chicagoObject) => ({
  values: item.color
    ? [`hue ${item.color.h}`, `sat ${item.color.s}%`, `light ${item.color.l}%`]
    : [],
  gradient: item.color ? createHSLColor(item.color) : null
})

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
        <TumblrMasonryGallery
          :items="galleryItems"
          :can-load-more="currentPage < totalPages"
          :loading-more="loadingNext"
          require-scroll-before-load-more
          @load-more="loadMoreChicagoData(searchTerm)"
        >
          <template #default="{ item }">
            <button
              :disabled="isSubmitting"
              @click="saveArtwork(item)"
              type="button"
              class="absolute bottom-2 left-2 hidden items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70 group-hover:inline-flex group-focus-within:inline-flex"
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
                    artworkStore.chicago.includes(String(item.id)) ||
                    savedArtworks.includes(String(item.id)),
                  'text-white':
                    !artworkStore.chicago.includes(String(item.id)) &&
                    !savedArtworks.includes(String(item.id))
                }"
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
            <button
              @click="
                toggleModal(
                  item.imageUrl,
                  item.imageAlt,
                  item.thumbnail?.width > item.thumbnail?.height
                )
              "
              type="button"
              class="absolute bottom-2 right-2 hidden items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
            >
              <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
            </button>
            <ArtworkHoverInfo
              source-label="Art Institute of Chicago"
              :items="getHoverItems(item)"
              :color-info="getColorInfo(item)"
            />
          </template>
        </TumblrMasonryGallery>
        <LoadingState
          v-if="loadingNext"
          label="Loading more art ..."
          class-name="py-8 text-zinc-500"
        />
      </div>
      <div v-show="chicagoData.length === 0" class="flex flex-col items-center justify-center h-52">
        <FaceFrownIcon class="h-8 w-auto text-gray-400" />
        <p class="text-center text-sm font-semibold mt-4">
          No results found for search term <span class="italic">'{{ searchTerm }}'</span>
          <br />
          <br />
          <router-link
            class="text-indigo-600 hover:text-indigo-500"
            :to="`/museum/harvard?searchTerm=${searchTerm}`"
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
    <LoadingState v-show="loading" />
  </main>
</template>
