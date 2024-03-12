<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { HeartIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline'
import type { harvardObject } from '@/interfaces/harvard.interfaces'
import { useUserStore } from '@/stores/user'
import { useArtworkStore } from '@/stores/artworks'
import ZoomModal from '@/components/ZoomModal.vue'

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

const router = useRouter()
const api = import.meta.env.VITE_APP_API
const harvardApi = import.meta.env.VITE_HARVARD_API_KEY
const searchTerm = computed(() => (router.currentRoute.value.query.searchTerm as string) || '')
const hover: Record<string, boolean> = reactive({})
const harvardData = ref<harvardObject[]>([])
const isSubmitting = ref(false)
const savedArtworks = ref<number[]>([])
const isWideModal = ref(false)
const modalOpen = ref(false)
const imgUrl = ref('')
const imgAlt = ref('')

// API CALLS
const getHarvardData = async (searchTerm: string) => {
  try {
    const response = await axios.get(`https://api.harvardartmuseums.org/object`, {
      params: {
        apikey: harvardApi,
        q: searchTerm, // Search term
        fields:
          'title,dated,people,primaryimageurl,culture,colors,images,classification,medium,period,division,url',
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
    console.log(harvardData.value)
  } catch (error) {
    console.error(error)
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
  console.log(data.image)
  isSubmitting.value = true
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .post(`${api}/artworks/${userStore.user?.id}`, data, config)
    .then((response) => {
      console.log(response)
      isSubmitting.value = false
      savedArtworks.value.push(artwork.id)
      useArtworkStore().addHarvardArtwork(artwork.id)
    })
    .catch((error) => {
      console.error(error)
      isSubmitting.value = false
    })
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
                artworkStore.harvard.includes(item.id) || savedArtworks.includes(item.id),
              'text-white':
                !artworkStore.harvard.includes(item.id) || !savedArtworks.includes(item.id)
            }"
            class="-ml-0.5 h-5 w-5"
            aria-hidden="true"
          />
          <span v-if="isSubmitting">Saving...</span>
          <span v-else-if="artworkStore.harvard.includes(item.id)">Saved</span>
          <span v-else>Save</span>
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
              item.people && item.people.length > 0 ? item.people[0].displayname : 'Fallback value'
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
  </main>
</template>
