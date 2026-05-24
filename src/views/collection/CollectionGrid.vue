<template>
  <div v-if="!loading" class="pt-3">
    <ZoomModal
      :open="modalOpen"
      :imageUrl="imgUrl"
      :imageAlt="imgAlt"
      :isWide="isWideModal"
      @close="toggleModal"
    />
    <div v-if="errorMessage" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>
    <TumblrMasonryGallery v-if="galleryItems.length > 0" :items="galleryItems">
      <template #default="{ item }">
        <button
          @click="deleteArtwork(item.id)"
          type="button"
          :aria-label="`Remove ${item.title} from your collection`"
          class="absolute bottom-2 left-2 hidden items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
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
          <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        </button>
        <button
          @click="
            toggleModal(
              item.imageUrl || '',
              item.imageAlt || item.title,
              item.imageWidth !== null &&
                item.imageHeight !== null &&
                item.imageWidth > item.imageHeight
            )
          "
          type="button"
          :aria-label="`Zoom ${item.title}`"
          class="absolute bottom-2 right-2 hidden items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
        >
          <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        </button>
        <ArtworkHoverInfo
          :source-label="sourceLabel(item.source)"
          :items="getHoverItems(item)"
          :color-info="getColorInfo(item)"
        />
      </template>
    </TumblrMasonryGallery>
    <div v-else class="flex flex-col items-center justify-center h-52">
      <CubeTransparentIcon class="h-8 w-auto text-gray-400" />
      <p class="text-center text-sm font-semibold mt-4">
        You don't have any saved art yet.
        <br />
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/museum/chicago`"
          >Browse the Chicago Art Institute API</router-link
        >
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/museum/harvard`"
          >Browse the Harvard Art Museums API</router-link
        >
        <br />
        <br />
        <span class="flex items-center gap-x-2 justify-center">
          or search for anything. <FaceSmileIcon class="h-5 w-5"></FaceSmileIcon
        ></span>
      </p>
    </div>
  </div>
  <LoadingState v-else label="Fetching saved art ..." class-name="mt-0" />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import type { artworkObject } from '@/interfaces/artworks.interfaces'
import LoadingState from '@/components/LoadingState.vue'
import ArtworkHoverInfo from '@/components/gallery/ArtworkHoverInfo.vue'
import TumblrMasonryGallery from '@/components/gallery/TumblrMasonryGallery.vue'
import ZoomModal from '@/components/ZoomModal.vue'
import { MagnifyingGlassPlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { FaceSmileIcon, CubeTransparentIcon } from '@heroicons/vue/24/outline'
import { deleteArtworkById, fetchUserCollection } from '@/services/artworkApi'
import { getApiErrorMessage } from '@/services/apiClient'

const userStore = useUserStore()
userStore.hydrateSession()
const loading = ref(true)
const isSubmitting = ref(false)
const artworkData = ref<artworkObject[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const errorMessage = ref('')

const galleryItems = computed(() =>
  artworkData.value
    .filter((item) => item.imageUrl)
    .map((item) => ({
      ...item,
      imageUrl: item.imageUrl || '',
      imageAlt: item.imageAlt || item.title
    }))
)

const fetchCollection = () => {
  if (!userStore.user) {
    loading.value = false
    errorMessage.value = 'Unable to load your collection. Please sign in again.'
    return
  }

  fetchUserCollection()
    .then((artworks) => {
      loading.value = false
      artworkData.value = artworks
      errorMessage.value = ''
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
      errorMessage.value = getApiErrorMessage(error, 'Unable to load your saved art.')
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
const deleteArtwork = (id: string) => {
  isSubmitting.value = true
  errorMessage.value = ''

  // Store the original artworkData array
  const originalArtworkData = artworkData.value

  // Optimistically remove the artwork from the artworkData array
  artworkData.value = artworkData.value.filter((artwork) => artwork.id !== id)

  deleteArtworkById(id)
    .then(() => {
      isSubmitting.value = false
    })
    .catch((error) => {
      console.error(error)
      isSubmitting.value = false
      // If the axios call fails, revert the artworkData array to its original state
      artworkData.value = originalArtworkData
      errorMessage.value = getApiErrorMessage(error, 'Unable to delete this artwork.')
    })
}
function sourceLabel(source: artworkObject['source']) {
  if (source === 'HARVARD') return 'Harvard Art Museums'
  if (source === 'CHICAGO') return 'Art Institute of Chicago'
  if (source === 'SMITHSONIAN') return 'Smithsonian'
  return 'Cleveland Museum of Art'
}

function getHoverItems(item: artworkObject) {
  return [
    `${item.title}${item.dateText ? `, ${item.dateText}` : ''}`,
    item.artistName || 'Unknown Artist',
    item.medium,
    item.culture
  ].filter(Boolean) as string[]
}

function getColorInfo(item: artworkObject) {
  const hexColors = item.colors.hex ?? []

  if (hexColors.length) {
    return {
      values: hexColors.map((color) => color.color),
      gradient: colorGradient(item)
    }
  }

  if (item.colors.hsl) {
    return {
      values: [formatHsl(item.colors.hsl)],
      gradient: item.colors.hsl
    }
  }

  return {
    values: [],
    gradient: null
  }
}

const colorGradient = (item: artworkObject) => {
  const colors = item.colors.hex ?? []
  if (!colors.length) return null
  let gradient = 'linear-gradient(to right, '
  gradient += colors
    .map((color, index) => `${color.color} ${(index / (colors.length - 1)) * 100}%`)
    .join(', ')
  gradient += ')'
  return gradient
}

function formatHsl(hsl: string) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i)
  if (match) {
    return `hue: ${match[1]}, saturation: ${match[2]}, lightness: ${match[3]}`
  }
  return hsl
}

fetchCollection()
</script>
