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
        v-if="gradient !== `#000`"
        :style="{ background: gradient }"
        class="w-full h-4 mt-5 rounded-full"
      ></div>
    </transition>

    <div v-show="colorData?.total === 0" class="flex flex-col items-center justify-center h-52">
      <CubeTransparentIcon class="h-8 w-auto text-gray-400" />
      <p class="text-center text-sm font-semibold mt-4">
        You don't have any saved art yet.
        <br />
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/chicago`"
          >Browse the Chicago Art Institute API</router-link
        >
        <br />
        <router-link class="text-indigo-600 hover:text-indigo-500" :to="`/chicago`"
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
  <main>
    <div v-if="!loading">
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
              <BlackGlyph class="h-16 w-16 flex-none rounded-full ring-1 ring-gray-900/10 p-3" />
              <h1>
                <span class="text-sm leading-6 text-gray-500">{{userStore.user?.name}}</span>
                <br>
                <span class="mt-1 text-base font-semibold leading-6 text-gray-900">
                  Artwork Insights
                </span>
              </h1>
            </div>
            <div class="flex items-center gap-x-4 sm:gap-x-6">
              <Menu as="div" class="relative sm:hidden">
                <MenuButton class="-m-3 block p-3">
                  <span class="sr-only">More</span>
                  <EllipsisVerticalIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
                </MenuButton>

                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems
                    class="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                  >
                    <MenuItem v-slot="{ active }">
                      <button
                        type="button"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900'
                        ]"
                      >
                        Copy URL
                      </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a
                        href="#"
                        :class="[
                          active ? 'bg-gray-50' : '',
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        ]"
                        >Edit</a
                      >
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <div class="mx-auto max-w-7xl py-12">
        <div
          class="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          <!-- Invoice summary -->
          <div class="lg:col-start-3 lg:row-end-1">
            <h2 class="sr-only">Summary</h2>
            <div
              v-if="colorData"
              class="rounded-lg bg-gray-100 shadow-sm ring-1 ring-gray-900/5 flex items-center justify-center"
            >
              <ColorEChart :color-insight-data="colorData"></ColorEChart>
            </div>
          </div>

          <!-- Invoice -->
          <div
            class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16"
          >
            <h2 class="text-base font-semibold leading-6 text-gray-900">Objective Preferences</h2>
            <dl class="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
              <div class="sm:pr-2 flex items-center">
                <dt class="inline text-gray-500">Top Color:</dt>
                {{ ' ' }}
                <dd
                  :style="{ color: colorData?.insights[0].hue }"
                  class="inline text-gray-700 font-black"
                >
                  <Popover v-slot="{ open }" class="relative">
                    <PopoverButton
                      :class="open ? 'text-black' : 'text-black'"
                      class="group inline-flex items-center rounded-md px-2 py-2 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                    >
                      <span
                        :style="{ color: colorData?.insights[0].hue }"
                        class="inline font-black text-sm group-hover:text-opacity-50"
                      >
                        {{ colorData?.insights[0].hue }}</span
                      >
                      <ChevronDownIcon
                        :class="open ? 'text-gray-500' : 'text-gray-500'"
                        class="ml-1 h-5 w-5 transition duration-150 ease-in-out group-hover:text-opacity-50"
                        aria-hidden="true"
                      />
                    </PopoverButton>

                    <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-1 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-1 opacity-0"
                    >
                      <PopoverPanel
                        class="absolute z-10 mt-3 w-screen max-w-sm transform px-4 sm:px-0 lg:max-w-lg"
                      >
                        <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                          <div class="relative grid gap-8 bg-white p-7 lg:grid-cols-2">
                            <p
                              v-for="(color, index) in colorData?.insights[0].hex_colors"
                              :key="index"
                              :style="{ color: color, display: 'inline' }"
                            >
                              {{ color }}
                            </p>
                          </div>
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>
                </dd>
              </div>
              <div class="mt-2 sm:mt-0 sm:pl-4">
                <dt class="inline text-gray-500">Top Artist:</dt>
                {{ ' ' }}
                <dd class="inline text-gray-700">
                  {{ artistData && artistData[0]?.artist }}
                </dd>
              </div>
              <div class="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
                <dt class="font-semibold text-gray-900">Top Cultures</dt>
                <dd
                  v-for="culture in cultureData"
                  :key="culture.culture"
                  class="mt-2 text-gray-500"
                >
                  <span class="font-medium text-gray-900">{{ culture.culture }}</span> --
                  {{ culture.frequency }}
                  <span
                    v-if="culture.country"
                    class="fi ml-2"
                    :class="`fi-${culture.country}`"
                  ></span>
                </dd>
              </div>
              <div class="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
                <dt class="font-semibold text-gray-900">Top Styles / Mediums</dt>
                <dd v-for="style in styleData" :key="style.style" class="mt-2 text-gray-500">
                  <span class="font-medium text-gray-900">{{
                    capitalizeFirstLetter(style.style)
                  }}</span>
                  --
                  {{ style.frequency }}
                </dd>
              </div>
            </dl>
            <div class="mt-16 w-full text-left text-sm leading-6">
              <div
                class="border-b border-gray-200 text-base font-semibold leading-6 text-gray-900 pb-4"
              >
                Insight Summary
              </div>
              <p
                v-if="!aiSummaryLoading"
                class="text-xs mt-4"
                v-html="formatText(aiSummary || '')"
              ></p>
              <div v-else class="flex flex-col gap-y-4 items-center justify-center mt-10">
                <BlackGlyph class="animate-bounce h-8 w-auto" />
                <p class="text-xs italic">Generating summary ...</p>
              </div>
            </div>
          </div>

          <div class="lg:col-start-3">
            <!-- Activity feed -->
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold leading-6 text-gray-900">AI Insights</h2>
              <div>
                <nav class="flex space-x-4" aria-label="Tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab.name"
                    @click="currentTab = tab.name"
                    :class="[
                      currentTab === tab.name
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-500 hover:text-gray-700',
                      'rounded-md px-3 py-2 text-xs font-medium'
                    ]"
                    :aria-current="currentTab === tab.name ? 'page' : undefined"
                  >
                    {{ tab.name }}
                  </button>
                </nav>
              </div>
            </div>

            <div v-if="!aiLoading && currentTab === 'Color'" class="mt-6">
              <p class="text-xs" v-html="formatText(colorAi || '')"></p>
            </div>
            <div v-else-if="!aiLoading && currentTab === 'Culture'" class="mt-6">
              <p class="text-xs" v-html="formatText(cultureAi || '')"></p>
            </div>
            <div v-else-if="!aiLoading && currentTab === 'Styles'" class="mt-6">
              <p class="text-xs" v-html="formatText(styleAi || '')"></p>
            </div>
            <div v-else class="flex flex-col gap-y-4 items-center justify-center mt-10">
              <BlackGlyph class="animate-bounce h-8 w-auto" />
              <p class="text-xs italic">Generating insight ...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type { colorResponse } from '@/interfaces/insights.interfaces'
import { FaceSmileIcon, CubeTransparentIcon } from '@heroicons/vue/24/outline'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'
import { EllipsisVerticalIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'
import ColorEChart from '@/components/ColorEChart.vue'
import type { cultureInsight } from '@/interfaces/insights.interfaces'
import countries from '../../../node_modules/flag-icons/country.json'
import nationalitiesCountries from '@/json/nationalitiesCountries.json'
import type { styleInsight } from '@/interfaces/insights.interfaces'
import type { artistInsight } from '@/interfaces/insights.interfaces'

const tabs = [
  { name: 'Color', current: true },
  { name: 'Culture', current: false },
  { name: 'Styles', current: false }
]

const api = import.meta.env.VITE_APP_API
const userStore = useUserStore()
const loading = ref(true)
const colorData = ref<colorResponse>()
const cultureData = ref<cultureInsight[]>()
const styleData = ref<styleInsight[]>()
const artistData = ref<artistInsight[]>()
const colorAi = ref<string>()
const cultureAi = ref<string>()
const styleAi = ref<string>()
const aiSummary = ref<string>()
const aiLoading = ref(true)
const aiSummaryLoading = ref(true)
const currentTab = ref('Color')

const fetchColorInsights = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/colors/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      colorData.value = response.data
      console.log(colorData.value)
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
fetchColorInsights()

const fetchCultureInsights = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/culture/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      cultureData.value = response.data.slice(0, 3)
      console.log(cultureData.value)
      cultureData.value?.forEach((culture) => {
        culture.country = findCountryByNationality(culture.culture)
      })
      console.log(cultureData.value)
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
fetchCultureInsights()

const formatText = (text: string) => {
  return text.replace(/\n/g, '<br>')
}

const gradient = computed(() => {
  if (colorData.value?.insights) {
    const allColors = colorData.value.insights.flatMap((insight) => insight.hex_colors)
    if (allColors.length === 1) {
      console.log('One color data')
      // If there's only one color, return it as the background color
      return allColors[0]
    } else {
      console.log('Multiple color data')
      // If there's more than one color, return a linear gradient
      return `linear-gradient(to right, ${allColors.join(', ')})`
    }
  }
  console.log('No color data')
  return '#000'
})

function findCountryByNationality(nationality: string) {
  let nationalityObject = nationalitiesCountries.find((n) => {
    let nationalities = n.nationality.split(',').map((n) => n.trim())
    return nationalities.includes(nationality)
  })

  if (!nationalityObject) return null

  let country = countries.find((c) => c.name === nationalityObject?.en_short_name)

  return country ? country.code : null
}

const fetchStyleInsights = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/styles/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      styleData.value = response.data.slice(0, 3)
      console.log(styleData.value)
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}

fetchStyleInsights()

const fetchArtistInsights = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/artists/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      artistData.value = response.data.slice(0, 3)
      console.log(artistData.value)
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
fetchArtistInsights()

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const fetchAiColor = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/ai/color/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      colorAi.value = response.data
      aiLoading.value = false
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}

const fetchCultureColor = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/ai/culture/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      cultureAi.value = response.data
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
const fetchStyleColor = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/ai/style/${userStore.user?.id}`, config)
    .then((response) => {
      loading.value = false
      styleAi.value = response.data
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
const fetchAiSummary = () => {
  const token = localStorage.getItem('token')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  axios
    .get(`${api}/artwork-insights/ai/summary/${userStore.user?.id}`, config)
    .then((response) => {
      aiSummaryLoading.value = false
      aiSummary.value = response.data
    })
    .catch((error) => {
      console.error(error)
      loading.value = false
    })
}
fetchAiColor()
fetchCultureColor()
fetchStyleColor()
fetchAiSummary()
</script>
