<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  HeartIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/vue/24/outline'
import LoadingState from '@/components/LoadingState.vue'
import ArtworkHoverInfo from '@/components/gallery/ArtworkHoverInfo.vue'
import TumblrMasonryGallery from '@/components/gallery/TumblrMasonryGallery.vue'
import ZoomModal from '@/components/ZoomModal.vue'
import type { smithsonianObject } from '@/interfaces/smithsonian.interfaces'
import { useArtworkStore } from '@/stores/artworks'
import { useUserStore } from '@/stores/user'
import {
  deleteArtworkBySource,
  fetchSavedArtworkMap,
  saveArtwork as saveArtworkRequest,
  searchSmithsonianArtworks
} from '@/services/artworkApi'
import { isCanceledRequest, isUnauthorizedError } from '@/services/apiClient'

const router = useRouter()
const userStore = useUserStore()
const artworkStore = useArtworkStore()

const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const smithsonianData = ref<smithsonianObject[]>([])
const savedArtworks = ref<string[]>([])
const loading = ref(true)
const loadingNext = ref(false)
const isSubmitting = ref(false)
const nextStart = ref<number | null>(null)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const isWideModal = ref(false)
let searchController: AbortController | null = null

const galleryItems = computed(() =>
  smithsonianData.value.map((item) => ({
    ...item,
    imageAlt: item.imageAlt || item.title
  }))
)

onMounted(() => {
  userStore.hydrateSession()
  if (userStore.user) {
    mapArtworks()
  }
})

async function getSmithsonianData(term: string) {
  searchController?.abort()
  searchController = new AbortController()
  loading.value = true

  try {
    const data = await searchSmithsonianArtworks(term, 0, { signal: searchController.signal })
    smithsonianData.value = data.rows
    nextStart.value = data.nextStart
  } catch (error) {
    if (isCanceledRequest(error)) return
    console.error(error)
    smithsonianData.value = []
    nextStart.value = null
  } finally {
    loading.value = false
  }
}

async function loadMoreSmithsonianData() {
  if (nextStart.value === null) return

  loadingNext.value = true

  try {
    const data = await searchSmithsonianArtworks(searchTerm.value, nextStart.value)
    smithsonianData.value = [...smithsonianData.value, ...data.rows]
    nextStart.value = data.nextStart
  } catch (error) {
    console.error(error)
  } finally {
    loadingNext.value = false
  }
}

function saveArtwork(artwork: smithsonianObject) {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  const isSaved =
    artworkStore.smithsonian.includes(artwork.id) || savedArtworks.value.includes(artwork.id)
  isSubmitting.value = true

  const request = isSaved
    ? deleteArtworkBySource('SMITHSONIAN', artwork.id)
    : saveArtworkRequest({ source: 'SMITHSONIAN', artwork })

  request
    .then(() => {
      if (isSaved) {
        savedArtworks.value = savedArtworks.value.filter((id) => id !== artwork.id)
        artworkStore.removeArtwork('SMITHSONIAN', artwork.id)
      } else {
        savedArtworks.value.push(artwork.id)
        artworkStore.addSmithsonianArtwork(artwork.id)
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

function mapArtworks() {
  if (!userStore.user) return

  fetchSavedArtworkMap()
    .then((savedMap) => {
      savedArtworks.value = savedMap.smithsonian
      artworkStore.setSmithsonianArtworks(savedMap.smithsonian)
    })
    .catch((error) => {
      console.error(error)
    })
}

function openModal(artwork: smithsonianObject) {
  const imageWidth = artwork.imageWidth
  const imageHeight = artwork.imageHeight

  isWideModal.value = imageWidth !== null && imageHeight !== null && imageWidth > imageHeight
  imgUrl.value = artwork.imageUrl
  imgAlt.value = artwork.imageAlt
  modalOpen.value = true
}

function getHoverItems(artwork: smithsonianObject) {
  return [
    artwork.title,
    artwork.artistName,
    artwork.dateText,
    artwork.medium,
    artwork.classification
  ].filter(Boolean) as string[]
}

watch(
  searchTerm,
  (newVal) => {
    getSmithsonianData(newVal)
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
      @close="modalOpen = false"
    />

    <div v-show="!loading">
      <div v-show="smithsonianData.length > 0">
        <TumblrMasonryGallery
          :items="galleryItems"
          :can-load-more="nextStart !== null"
          :loading-more="loadingNext"
          require-scroll-before-load-more
          @load-more="loadMoreSmithsonianData"
        >
          <template #default="{ item }">
            <button
              :disabled="isSubmitting"
              @click="saveArtwork(item)"
              type="button"
              :aria-label="`Save ${item.title} to your collection`"
              class="absolute bottom-2 left-2 hidden items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70 group-hover:inline-flex group-focus-within:inline-flex"
            >
              <svg
                v-if="isSubmitting"
                class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <HeartIcon
                v-else
                :class="{
                  'fill-red-600 text-red-600':
                    artworkStore.smithsonian.includes(item.id) || savedArtworks.includes(item.id),
                  'text-white':
                    !artworkStore.smithsonian.includes(item.id) && !savedArtworks.includes(item.id)
                }"
                class="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
            <button
              @click="openModal(item)"
              type="button"
              :aria-label="`Zoom ${item.title}`"
              class="absolute bottom-2 right-2 hidden items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
            >
              <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
            </button>
            <ArtworkHoverInfo source-label="Smithsonian" :items="getHoverItems(item)" />
          </template>
        </TumblrMasonryGallery>

        <LoadingState
          v-if="loadingNext"
          label="Loading more art ..."
          class-name="py-8 text-zinc-500"
        />
      </div>

      <div
        v-show="smithsonianData.length === 0"
        class="flex h-52 flex-col items-center justify-center"
      >
        <FaceFrownIcon class="h-8 w-auto text-gray-400" />
        <p class="mt-4 text-center text-sm font-semibold">
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
          <span class="flex items-center justify-center gap-x-2">
            or change your search term. <FaceSmileIcon class="h-5 w-5" />
          </span>
        </p>
      </div>
    </div>

    <LoadingState v-show="loading" />
  </main>
</template>
