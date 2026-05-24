<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { HeartIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'
import ArtworkHoverInfo from '@/components/gallery/ArtworkHoverInfo.vue'
import TumblrMasonryGallery from '@/components/gallery/TumblrMasonryGallery.vue'
import LoadingState from '@/components/LoadingState.vue'
import ZoomModal from '@/components/ZoomModal.vue'
import { useArtworkStore } from '@/stores/artworks'
import { useUserStore } from '@/stores/user'
import {
  deleteArtworkBySource,
  discoverArtworks,
  fetchSavedArtworkMap,
  saveArtwork as saveArtworkRequest,
  type DiscoverArtwork
} from '@/services/artworkApi'
import { isCanceledRequest, isUnauthorizedError } from '@/services/apiClient'

const router = useRouter()
const userStore = useUserStore()
const artworkStore = useArtworkStore()

const routeTerm = computed(() => (router.currentRoute.value.query.term as string) || '')
const artworks = ref<DiscoverArtwork[]>([])
const currentTerm = ref('')
const discoveredTerms = ref<string[]>([])
const unavailableSources = ref<string[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const submittingId = ref<string | null>(null)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')
const isWideModal = ref(false)
let searchController: AbortController | null = null
let activeSearchId = 0

onMounted(() => {
  userStore.hydrateSession()
  if (userStore.user) {
    mapArtworks()
  }
})

async function loadDiscover(term = '', append = false) {
  const searchId = activeSearchId + 1
  activeSearchId = searchId
  if (!append) {
    searchController?.abort()
    searchController = new AbortController()
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const signal = append ? undefined : searchController?.signal
    const data = await discoverArtworks(term, { signal })
    if (searchId !== activeSearchId) return

    if (append) {
      const existingIds = new Set(artworks.value.map((artwork) => artwork.id))
      artworks.value = [
        ...artworks.value,
        ...data.artworks.filter((artwork) => !existingIds.has(artwork.id))
      ]
    } else {
      artworks.value = data.artworks
      discoveredTerms.value = []
    }
    currentTerm.value = data.term
    discoveredTerms.value = [...new Set([...discoveredTerms.value, data.term])].slice(-4)
    unavailableSources.value = data.unavailableSources
  } catch (error) {
    if (isCanceledRequest(error)) return
    if (searchId !== activeSearchId) return

    console.error(error)
    if (!append) {
      artworks.value = []
      unavailableSources.value = []
      discoveredTerms.value = []
    }
  } finally {
    if (append) {
      loadingMore.value = false
    } else if (searchId === activeSearchId) {
      loading.value = false
    }
  }
}

function rollDiscover() {
  if (routeTerm.value) {
    router.replace({ name: 'discover', query: {} })
    return
  }

  loadDiscover()
}

function loadMoreDiscover() {
  if (routeTerm.value || loading.value || loadingMore.value) return
  loadDiscover('', true)
}

function saveArtwork(artwork: DiscoverArtwork) {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  const isSaved = isArtworkSaved(artwork)
  submittingId.value = artwork.id

  const request = isSaved
    ? deleteArtworkBySource(artwork.source, artwork.externalId)
    : saveArtworkRequest(artwork.savePayload)

  request
    .then(() => {
      if (isSaved) {
        artworkStore.removeArtwork(artwork.source, artwork.externalId)
      } else {
        addSavedArtwork(artwork)
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
      submittingId.value = null
    })
}

function mapArtworks() {
  fetchSavedArtworkMap()
    .then((savedMap) => {
      artworkStore.setHarvardArtworks(savedMap.harvard)
      artworkStore.setChicagoArtworks(savedMap.chicago)
      artworkStore.setSmithsonianArtworks(savedMap.smithsonian)
      artworkStore.setClevelandArtworks(savedMap.cleveland)
    })
    .catch((error) => {
      console.error(error)
    })
}

function isArtworkSaved(artwork: DiscoverArtwork) {
  if (artwork.source === 'HARVARD') return artworkStore.harvard.includes(artwork.externalId)
  if (artwork.source === 'CHICAGO') return artworkStore.chicago.includes(artwork.externalId)
  if (artwork.source === 'SMITHSONIAN') return artworkStore.smithsonian.includes(artwork.externalId)
  return artworkStore.cleveland.includes(artwork.externalId)
}

function addSavedArtwork(artwork: DiscoverArtwork) {
  if (artwork.source === 'HARVARD') {
    artworkStore.addHarvardArtwork(artwork.externalId)
  } else if (artwork.source === 'CHICAGO') {
    artworkStore.addChicagoArtwork(artwork.externalId)
  } else if (artwork.source === 'SMITHSONIAN') {
    artworkStore.addSmithsonianArtwork(artwork.externalId)
  } else {
    artworkStore.addClevelandArtwork(artwork.externalId)
  }
}

function asDiscoverArtwork(artwork: unknown) {
  return artwork as DiscoverArtwork
}

function openModal(artwork: DiscoverArtwork) {
  isWideModal.value =
    artwork.imageWidth !== null &&
    artwork.imageHeight !== null &&
    artwork.imageWidth > artwork.imageHeight
  imgUrl.value = artwork.imageUrl
  imgAlt.value = artwork.imageAlt
  modalOpen.value = true
}

watch(
  routeTerm,
  (term) => {
    loadDiscover(term)
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

    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Discover
        </p>
        <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {{ currentTerm ? `Searching "${currentTerm}"` : 'Searching the collections' }}
        </h1>
        <p
          v-if="unavailableSources.length > 0"
          class="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
        >
          Some sources are unavailable right now.
        </p>
        <p
          v-if="discoveredTerms.length > 1"
          class="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
        >
          Also mixed: {{ discoveredTerms.slice(0, -1).join(', ') }}
        </p>
      </div>

      <button
        type="button"
        @click="rollDiscover"
        class="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
        </svg>
        Roll Discover
      </button>
    </div>

    <LoadingState v-if="loading" label="Mixing museums ..." class-name="py-20 text-zinc-500" />

    <TumblrMasonryGallery
      v-else-if="artworks.length > 0"
      :items="artworks"
      :can-load-more="!routeTerm"
      :loading-more="loadingMore"
      require-scroll-before-load-more
      @load-more="loadMoreDiscover"
    >
      <template #default="{ item }">
        <ArtworkHoverInfo
          :source-label="item.sourceLabel"
          :items="item.infoItems"
          :color-info="item.colorInfo"
        />

        <button
          :disabled="submittingId === item.id"
          @click="saveArtwork(asDiscoverArtwork(item))"
          type="button"
          :aria-label="
            isArtworkSaved(asDiscoverArtwork(item))
              ? `Remove ${item.title} from your collection`
              : `Save ${item.title} to your collection`
          "
          class="absolute bottom-2 left-2 hidden items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-70 group-hover:inline-flex group-focus-within:inline-flex"
        >
          <svg
            v-if="submittingId === item.id"
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
              'fill-red-600 text-red-600': isArtworkSaved(asDiscoverArtwork(item)),
              'text-white': !isArtworkSaved(asDiscoverArtwork(item))
            }"
            class="-ml-0.5 h-5 w-5"
            aria-hidden="true"
          />
        </button>

        <button
          @click="openModal(asDiscoverArtwork(item))"
          type="button"
          :aria-label="`Zoom ${item.title}`"
          class="absolute bottom-2 right-2 hidden items-center rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-black/80 group-hover:inline-flex group-focus-within:inline-flex"
        >
          <MagnifyingGlassPlusIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        </button>
      </template>
    </TumblrMasonryGallery>

    <LoadingState
      v-if="loadingMore"
      label="Mixing more museums ..."
      class-name="py-10 text-zinc-500"
    />

    <div v-else class="flex flex-col items-center justify-center py-20 text-center">
      <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No results found.</p>
      <button
        type="button"
        @click="rollDiscover"
        class="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
      >
        Roll another term
      </button>
    </div>
  </main>
</template>
