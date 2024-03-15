<script setup lang="ts">
import axios from 'axios'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { chicagoObject, imageObject, colorObject } from '@/interfaces/chicago.interfaces'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useArtworkStore } from '@/stores/artworks'
import ZoomModal from '@/components/ZoomModal.vue'
import { HeartIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'
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
    }
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

const chicagoData = ref<chicagoObject[]>([])
const images = ref<imageObject>({
  iiif_url: 'https://www.artic.edu/iiif/2',
  website_url: 'http://www.artic.edu'
})

// API CALLS
const getChicagoData = async (searchTerm: string) => {
  loading.value = true
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&limit=50&&fields=id,title,image_id,artist_title,classification_titles,color,style_titles,artwork_type_title,medium_display,date_display,artist_display,thumbnail`
    )
    chicagoData.value = response.data.data.filter((item: chicagoObject) => item.thumbnail !== null)
    images.value = response.data.config
    loading.value = false
  } catch (error) {
    console.error(error)
  }
}

const saveArtwork = (artwork: chicagoObject) => {
  const data = {
    museum_id: 1,
    artwork_id: artwork.id,
    title: artwork.title,
    artist: artwork.artist_title,
    date: artwork.date_display,
    medium: artwork.medium_display,
    artwork_type: artwork.artwork_type_title,
    colors: JSON.stringify({
      hex: null,
      hsl: createHSLColor(artwork.color)
    }),
    classification: JSON.stringify(artwork.classification_titles),
    styles: JSON.stringify(artwork.style_titles),
    image: {
      artwork_id: artwork.id,
      imageUrl: images.value.iiif_url + '/' + artwork.image_id + '/full/843,/0/default.jpg',
      imageAlt: artwork.thumbnail.alt_text || artwork.title,
      imageWidth: artwork.thumbnail.width,
      imageHeight: artwork.thumbnail.height
    }
  }
  isSubmitting.value = true
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .post(`${api}/artworks/${userStore.user?.id}`, data, config)
    .then((response) => {
      isSubmitting.value = false
      savedArtworks.value.push(artwork.id)
      useArtworkStore().addChicagoArtwork(artwork.id)
    })
    .catch((error) => {
      console.error(error)
      isSubmitting.value = false
    })
}

// METHODS AND UTILS
const handleImageError = (event: any) => {
  event.target.style.display = 'none'
}

const createHSLColor = (color: colorObject) => {
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
    grid-column: span 2 / auto;
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
    <div v-if="!loading" class="gallery">
      <div
        v-for="item in chicagoData"
        :key="item.id"
        :class="{
          'wide-image': item.thumbnail.width > item.thumbnail.height,
          'full-span': item.thumbnail.width > 2 * item.thumbnail.height,
          'rounded-lg, relative hover:cursor-help': true
        }"
        @mouseover="hover[item.id] = true"
        @mouseleave="hover[item.id] = false"
      >
        <img
          :src="images.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg'"
          :class="{
            'opacity-50': hover[item.id]
          }"
          @error="handleImageError"
          :alt="item.thumbnail.alt_text"
        />
        <button
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
              {{ `hue: ${item.color.h}, saturation: ${item.color.s}, lightness ${item.color.l}` }}
            </p>
          </li>
          <li class="p-1" v-else>
            <p class="text-white">No color data available</p>
          </li>
          <li
            :style="{ background: createHSLColor(item.color) }"
            class="p-1"
            v-if="item.color"
          ></li>
        </ul>
      </div>
    </div>
    <div v-else class="flex flex-col gap-y-4 items-center justify-center mt-10 min-h-full">
      <BlackGlyph class="animate-bounce h-8 w-auto" />
      <p class="text-sm italic">Fetching Art ...</p>
    </div>
  </main>
</template>
