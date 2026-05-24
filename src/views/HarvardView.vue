<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
import LoadingState from '@/components/LoadingState.vue'
import ArtworkHoverInfo from '@/components/gallery/ArtworkHoverInfo.vue'
import TumblrMasonryGallery from '@/components/gallery/TumblrMasonryGallery.vue'
import {
  deleteArtworkBySource,
  fetchHarvardNextPage,
  fetchSavedArtworkMap,
  saveArtwork as saveArtworkRequest,
  searchHarvardArtworks
} from '@/services/artworkApi'
import { isCanceledRequest, isUnauthorizedError } from '@/services/apiClient'

const userStore = useUserStore()
const artworkStore = useArtworkStore()
const loading = ref(true)

onMounted(() => {
  userStore.hydrateSession()
  if (userStore.user) {
    mapArtworks()
  }
})

const router = useRouter()
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const harvardData = ref<harvardObject[]>([])
const isSubmitting = ref(false)
const savedArtworks = ref<string[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const loadingNext = ref(false)
const pagination = ref({} as paginationObject)
let nextUrl = ref('')
let searchController: AbortController | null = null

const galleryItems = computed(() =>
  harvardData.value.map((item) => ({
    ...item,
    id: String(item.id),
    imageUrl: item.primaryimageurl,
    imageAlt: item.images[0]?.alttext || item.title
  }))
)

const getHarvardData = async (searchTerm: string) => {
  searchController?.abort()
  searchController = new AbortController()
  loading.value = true

  try {
    const data = await searchHarvardArtworks(searchTerm, { signal: searchController.signal })
    const objectsWithPrimaryImageUrl = data.records.filter(
      (object: harvardObject) =>
        object.primaryimageurl && object.images[0] && object.images[0].width >= 600
    )
    harvardData.value = objectsWithPrimaryImageUrl
    pagination.value = data.info
    nextUrl.value = data.info.next ?? ''
  } catch (error) {
    if (isCanceledRequest(error)) return
    console.error(error)
    harvardData.value = []
    nextUrl.value = ''
  } finally {
    loading.value = false
  }
}

const loadMoreHarvardData = async () => {
  if (nextUrl.value && !loadingNext.value) {
    loadingNext.value = true
    try {
      const data = await fetchHarvardNextPage(nextUrl.value)
      const objectsWithPrimaryImageUrl = data.records.filter(
        (object: harvardObject) =>
          object.primaryimageurl && object.images[0] && object.images[0].width >= 600
      )
      harvardData.value = [...harvardData.value, ...objectsWithPrimaryImageUrl] // Append the new data
      pagination.value = data.info
      nextUrl.value = data.info.next ?? '' // Update the "next" URL
      loadingNext.value = false
    } catch (error) {
      console.error(error)
      loadingNext.value = false
    }
  }
}

const saveArtwork = (artwork: harvardObject) => {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  const externalId = String(artwork.id)
  const isSaved =
    artworkStore.harvard.includes(externalId) || savedArtworks.value.includes(externalId)
  isSubmitting.value = true

  const request = isSaved
    ? deleteArtworkBySource('HARVARD', externalId)
    : saveArtworkRequest({ source: 'HARVARD', artwork })

  request
    .then(() => {
      if (isSaved) {
        savedArtworks.value = savedArtworks.value.filter((id) => id !== externalId)
        artworkStore.removeArtwork('HARVARD', externalId)
      } else {
        savedArtworks.value.push(externalId)
        artworkStore.addHarvardArtwork(externalId)
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
      savedArtworks.value = savedMap.harvard
      useArtworkStore().setHarvardArtworks(savedMap.harvard)
    })
    .catch((error) => {
      console.error(error)
    })
}

const getHoverItems = (item: harvardObject) =>
  [
    `${item.title}${item.dated ? `, ${item.dated}` : ''}`,
    item.people?.[0]?.displayname,
    item.medium,
    item.culture
  ].filter(Boolean) as string[]

const getColorInfo = (item: harvardObject) => {
  if (!item.colors?.length) {
    return {
      values: [],
      gradient: null
    }
  }

  const gradient = `linear-gradient(to right, ${item.colors
    .map((color, index) => `${color.color} ${(index / (item.colors.length - 1)) * 100}%`)
    .join(', ')})`

  return {
    values: item.colors.map((color) => color.color),
    gradient
  }
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
        <TumblrMasonryGallery
          :items="galleryItems"
          :can-load-more="Boolean(nextUrl)"
          :loading-more="loadingNext"
          require-scroll-before-load-more
          @load-more="loadMoreHarvardData"
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
                    artworkStore.harvard.includes(String(item.id)) ||
                    savedArtworks.includes(String(item.id)),
                  'text-white':
                    !artworkStore.harvard.includes(String(item.id)) &&
                    !savedArtworks.includes(String(item.id))
                }"
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
            <button
              @click="
                toggleModal(
                  item.primaryimageurl,
                  item.images[0]?.alttext || item.title,
                  item.images[0]?.width > item.images[0]?.height
                )
              "
              type="button"
              class="absolute bottom-2 right-2 hidden items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
            >
              <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
            </button>
            <ArtworkHoverInfo
              source-label="Harvard Art Museums"
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
      <div v-show="harvardData.length === 0" class="flex flex-col items-center justify-center h-52">
        <FaceFrownIcon class="h-8 w-auto text-gray-400" />
        <p class="text-center text-sm font-semibold mt-4">
          No results found for search term <span class="italic">'{{ searchTerm }}'</span>
          <br />
          <br />
          <router-link
            class="text-indigo-600 hover:text-indigo-500"
            :to="`/museum/chicago?searchTerm=${searchTerm}`"
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
    <LoadingState v-show="loading" />
  </main>
</template>
