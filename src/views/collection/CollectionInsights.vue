<template>
  <div class="pt-3">
    <transition
      enter-active-class="transition-all ease-out duration-1000"
      enter-from-class="opacity-0 max-w-0"
      enter-to-class="opacity-100 max-w-full"
      leave-active-class="transition-all ease-in duration-1000"
      leave-from-class="opacity-100 max-w-full"
      leave-to-class="opacity-0 max-w-0"
    >
      <div
        v-if="gradient !== '#000'"
        :style="{ background: gradient }"
        class="mt-5 h-4 w-full rounded-full"
      ></div>
    </transition>

    <div v-if="!loading && !hasInsightData" class="flex h-52 flex-col items-center justify-center">
      <CubeTransparentIcon class="h-8 w-auto text-gray-400" />
      <p class="mt-4 text-center text-sm font-semibold">
        You don't have any saved art yet.
        <br />
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/museum/chicago`">
          Browse the Chicago Art Institute API
        </router-link>
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/museum/chicago`">
          Browse the Harvard Art Museums API
        </router-link>
        <br />
        <br />
        <span class="flex items-center justify-center gap-x-2">
          or search for anything. <FaceSmileIcon class="h-5 w-5" />
        </span>
      </p>
    </div>
  </div>

  <main>
    <div v-if="!loading && hasInsightData">
      <header class="relative isolate pt-5">
        <div class="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            class="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80"
          >
            <div
              class="aspect-[1154/678] w-[72.125rem]"
              style="
                clip-path: polygon(
                  100% 38.5%,
                  82.6% 100%,
                  60.2% 37.7%,
                  52.4% 32.1%,
                  47.5% 41.8%,
                  45.2% 65.6%,
                  27.5% 23.4%,
                  0.1% 35.3%,
                  17.9% 0%,
                  27.7% 23.4%,
                  76.2% 2.5%,
                  74.2% 56%,
                  100% 38.5%
                );
              "
              :style="{ background: gradient }"
            />
          </div>
          <div class="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
        </div>

        <div class="mx-auto max-w-7xl px-4 py-10">
          <div
            class="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none"
          >
            <div class="flex items-center gap-x-6">
              <BlackGlyph class="h-16 w-16 flex-none rounded-full p-3 ring-1 ring-gray-900/10" />
              <h1>
                <span class="text-sm leading-6 text-gray-500">{{ userStore.user?.name }}</span>
                <br />
                <span class="mt-1 text-base font-semibold leading-6 text-gray-900">
                  Artwork Insights
                </span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div class="mx-auto max-w-7xl py-12">
        <div
          class="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          <div class="lg:col-start-3 lg:row-end-1">
            <div
              v-if="colorData"
              class="flex items-center justify-center rounded-lg bg-gray-100 shadow-sm ring-1 ring-gray-900/5"
            >
              <ColorEChart :color-insight-data="colorData" />
            </div>
          </div>

          <section
            class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-10 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pt-12"
          >
            <div class="flex flex-col gap-y-8">
              <div>
                <h2 class="text-base font-semibold leading-6 text-gray-900">Collection Snapshot</h2>
                <p class="mt-2 text-sm text-gray-500">
                  A quick read on the works you save most often.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div
                  v-for="tile in statTiles"
                  :key="tile.label"
                  class="rounded-2xl border border-gray-200 bg-white px-4 py-5"
                >
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {{ tile.label }}
                  </p>
                  <p class="mt-3 text-lg font-semibold text-gray-900">
                    {{ tile.value }}
                  </p>
                </div>
              </div>

              <div class="rounded-2xl bg-gray-50 p-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-base font-semibold leading-6 text-gray-900">At a Glance</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Patterns pulled from your saved collection data.
                  </p>
                </div>
                <ul class="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                  <li
                    v-for="statement in atAGlance"
                    :key="statement"
                    class="rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200"
                  >
                    {{ statement }}
                  </li>
                </ul>
              </div>

              <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div class="border-t border-gray-900/5 pt-6">
                  <h3 class="text-sm font-semibold leading-6 text-gray-900">Top Cultures</h3>
                  <div class="mt-4 space-y-3">
                    <div
                      v-for="culture in cultureData"
                      :key="culture.culture"
                      class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <div class="flex items-center gap-x-2">
                        <span class="font-medium text-gray-900">{{ culture.culture }}</span>
                        <span
                          v-if="culture.country"
                          class="fi ml-1"
                          :class="`fi-${culture.country}`"
                        ></span>
                      </div>
                      <span class="text-sm text-gray-500">{{ culture.frequency }}</span>
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-900/5 pt-6">
                  <h3 class="text-sm font-semibold leading-6 text-gray-900">Top Styles / Mediums</h3>
                  <div class="mt-4 space-y-3">
                    <div
                      v-for="style in styleData"
                      :key="style.style"
                      class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <span class="font-medium text-gray-900">
                        {{ capitalizeFirstLetter(style.style) }}
                      </span>
                      <span class="text-sm text-gray-500">{{ style.frequency }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="space-y-8 lg:col-start-3">
            <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold leading-6 text-gray-900">Top Artists</h2>
                <span class="text-xs text-gray-500">{{ artistData.length }} shown</span>
              </div>
              <div class="mt-4 space-y-3">
                <div
                  v-for="artist in artistData"
                  :key="artist.artist"
                  class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                >
                  <span class="text-sm font-medium text-gray-900">{{ artist.artist }}</span>
                  <span class="text-sm text-gray-500">{{ artist.frequency }}</span>
                </div>
              </div>
            </section>

            <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold leading-6 text-gray-900">Palette Swatches</h2>
                <span class="text-xs text-gray-500">{{ paletteSwatches.length }} tones</span>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <div
                  v-for="swatch in paletteSwatches"
                  :key="swatch"
                  class="flex items-center gap-x-3 rounded-full bg-gray-50 px-3 py-2 ring-1 ring-gray-200"
                >
                  <span
                    class="h-6 w-6 rounded-full ring-1 ring-black/10"
                    :style="{ backgroundColor: swatch }"
                  ></span>
                  <span class="text-xs font-medium text-gray-600">{{ swatch }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type {
  artistInsight,
  colorResponse,
  cultureInsight,
  styleInsight
} from '@/interfaces/insights.interfaces'
import { FaceSmileIcon, CubeTransparentIcon } from '@heroicons/vue/24/outline'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'
import ColorEChart from '@/components/ColorEChart.vue'
import countries from '../../../node_modules/flag-icons/country.json'
import nationalitiesCountries from '@/json/nationalitiesCountries.json'

const api = import.meta.env.VITE_APP_API
const userStore = useUserStore()

const loading = ref(true)
const colorData = ref<colorResponse | null>(null)
const cultureData = ref<cultureInsight[]>([])
const styleData = ref<styleInsight[]>([])
const artistData = ref<artistInsight[]>([])

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const topColor = computed(() => colorData.value?.insights[0] ?? null)
const topCulture = computed(() => cultureData.value[0] ?? null)
const topArtist = computed(() => artistData.value[0] ?? null)
const totalSavedWorks = computed(() => colorData.value?.total ?? 0)
const hasInsightData = computed(
  () =>
    totalSavedWorks.value > 0 ||
    cultureData.value.length > 0 ||
    styleData.value.length > 0 ||
    artistData.value.length > 0
)

const statTiles = computed(() => [
  { label: 'Total Saved Works', value: totalSavedWorks.value.toString() },
  { label: 'Top Color', value: topColor.value?.hue ?? 'Not enough data' },
  { label: 'Top Artist', value: topArtist.value?.artist ?? 'Not enough data' },
  { label: 'Top Culture', value: topCulture.value?.culture ?? 'Not enough data' }
])

const atAGlance = computed(() => {
  const statements = [
    topColor.value
      ? `Your collection leans toward ${topColor.value.hue.toLowerCase()} tones.`
      : 'Save more work to reveal your dominant color preferences.',
    topArtist.value
      ? `You save the most work by ${topArtist.value.artist}.`
      : 'Your top artist will appear once your collection grows.',
    topCulture.value
      ? `Your strongest cultural cluster is ${topCulture.value.culture}.`
      : 'Your cultural trends will appear as you save more art.',
    styleData.value[0]
      ? `The leading style or medium in your collection is ${capitalizeFirstLetter(styleData.value[0].style)}.`
      : 'Your top styles and mediums will show up here once they are available.'
  ]

  return statements
})

const paletteSwatches = computed(() => {
  const colors = colorData.value?.insights.flatMap((insight) => insight.hex_colors) ?? []
  return [...new Set(colors)].slice(0, 8)
})

const gradient = computed(() => {
  const allColors = colorData.value?.insights.flatMap((insight) => insight.hex_colors) ?? []

  if (allColors.length === 1) {
    return allColors[0]
  }

  if (allColors.length > 1) {
    return `linear-gradient(to right, ${allColors.join(', ')})`
  }

  return '#000'
})

function findCountryByNationality(nationality: string) {
  const nationalityObject = nationalitiesCountries.find((entry) => {
    const nationalities = entry.nationality.split(',').map((item) => item.trim())
    return nationalities.includes(nationality)
  })

  if (!nationalityObject) {
    return null
  }

  const country = countries.find((entry) => entry.name === nationalityObject.en_short_name)

  return country ? country.code : null
}

async function fetchColorInsights() {
  const response = await axios.get<colorResponse>(
    `${api}/artwork-insights/colors/${userStore.user?.id}`,
    authConfig()
  )
  colorData.value = response.data
}

async function fetchCultureInsights() {
  const response = await axios.get<cultureInsight[]>(
    `${api}/artwork-insights/culture/${userStore.user?.id}`,
    authConfig()
  )

  cultureData.value = response.data.slice(0, 3).map((culture) => ({
    ...culture,
    country: findCountryByNationality(culture.culture)
  }))
}

async function fetchStyleInsights() {
  const response = await axios.get<styleInsight[]>(
    `${api}/artwork-insights/styles/${userStore.user?.id}`,
    authConfig()
  )
  styleData.value = response.data.slice(0, 3)
}

async function fetchArtistInsights() {
  const response = await axios.get<artistInsight[]>(
    `${api}/artwork-insights/artists/${userStore.user?.id}`,
    authConfig()
  )
  artistData.value = response.data.slice(0, 3)
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

onMounted(async () => {
  try {
    const results = await Promise.allSettled([
      fetchColorInsights(),
      fetchCultureInsights(),
      fetchStyleInsights(),
      fetchArtistInsights()
    ])

    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error(result.reason)
      }
    })
  } finally {
    loading.value = false
  }
})
</script>
