<template>
  <div class="pt-3">
    <transition
      enter-active-class="transition-all ease-out duration-1000"
      enter-from-class="opacity-0 w-0"
      enter-to-class="opacity-100 w-full"
      leave-active-class="transition-all ease-in duration-1000"
      leave-from-class="opacity-100 w-full"
      leave-to-class="opacity-0 w-0"
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
              <div class="text-sm leading-6 text-gray-500">Miguel Sedillo</div>
              <div class="mt-1 text-base font-semibold leading-6 text-gray-900">
                Artwork Insights
              </div>
            </h1>
          </div>
          <div class="flex items-center gap-x-4 sm:gap-x-6">
            <button
              type="button"
              class="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
            >
              Copy URL
            </button>
            <a href="#" class="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >Edit</a
            >
            <a
              href="#"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >Send</a
            >

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
            class="rounded-lg bg-gray-100 shadow-sm ring-1 ring-gray-900/5 flex items-center justify-center"
          >
            <ColorEChart></ColorEChart>
          </div>
        </div>

        <!-- Invoice -->
        <div
          class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16"
        >
          <h2 class="text-base font-semibold leading-6 text-gray-900">Main Preference list</h2>
          <dl class="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
            <div class="sm:pr-4">
              <dt class="inline text-gray-500">Issued on</dt>
              {{ ' ' }}
              <dd class="inline text-gray-700">
                <time datetime="2023-23-01">January 23, 2023</time>
              </dd>
            </div>
            <div class="mt-2 sm:mt-0 sm:pl-4">
              <dt class="inline text-gray-500">Due on</dt>
              {{ ' ' }}
              <dd class="inline text-gray-700">
                <time datetime="2023-31-01">January 31, 2023</time>
              </dd>
            </div>
            <div class="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
              <dt class="font-semibold text-gray-900">From</dt>
              <dd class="mt-2 text-gray-500">
                <span class="font-medium text-gray-900">Acme, Inc.</span><br />7363 Cynthia Pass<br />Toronto,
                ON N3Y 4H8
              </dd>
            </div>
            <div class="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
              <dt class="font-semibold text-gray-900">To</dt>
              <dd class="mt-2 text-gray-500">
                <span class="font-medium text-gray-900">Tuple, Inc</span><br />886 Walter Street<br />New
                York, NY 12345
              </dd>
            </div>
          </dl>
          <table class="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
            <colgroup>
              <col class="w-full" />
              <col />
              <col />
              <col />
            </colgroup>
            <thead class="border-b border-gray-200 text-gray-900">
              <tr>
                <th scope="col" class="px-0 py-3 font-semibold">Projects</th>
                <th
                  scope="col"
                  class="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                >
                  Hours
                </th>
                <th
                  scope="col"
                  class="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                >
                  Rate
                </th>
                <th scope="col" class="py-3 pl-8 pr-0 text-right font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoice.items" :key="item.id" class="border-b border-gray-100">
                <td class="max-w-0 px-0 py-5 align-top">
                  <div class="truncate font-medium text-gray-900">{{ item.title }}</div>
                  <div class="truncate text-gray-500">{{ item.description }}</div>
                </td>
                <td
                  class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell"
                >
                  {{ item.hours }}
                </td>
                <td
                  class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell"
                >
                  {{ item.rate }}
                </td>
                <td class="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">
                  {{ item.price }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" class="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden">
                  Subtotal
                </th>
                <th
                  scope="row"
                  colspan="3"
                  class="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell"
                >
                  Subtotal
                </th>
                <td class="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900">
                  {{ invoice.subTotal }}
                </td>
              </tr>
              <tr>
                <th scope="row" class="pt-4 font-normal text-gray-700 sm:hidden">Tax</th>
                <th
                  scope="row"
                  colspan="3"
                  class="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
                >
                  Tax
                </th>
                <td class="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">
                  {{ invoice.tax }}
                </td>
              </tr>
              <tr>
                <th scope="row" class="pt-4 font-semibold text-gray-900 sm:hidden">Total</th>
                <th
                  scope="row"
                  colspan="3"
                  class="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell"
                >
                  Total
                </th>
                <td class="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
                  {{ invoice.total }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="lg:col-start-3">
          <!-- Activity feed -->
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold leading-6 text-gray-900">AI Insights</h2>
            <div>
              <nav class="flex space-x-4" aria-label="Tabs">
                <a
                  v-for="tab in tabs"
                  :key="tab.name"
                  :href="tab.href"
                  :class="[
                    tab.current ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700',
                    'rounded-md px-3 py-2 text-xs font-medium'
                  ]"
                  :aria-current="tab.current ? 'page' : undefined"
                  >{{ tab.name }}</a
                >
              </nav>
            </div>
          </div>

          <div class="mt-6">
            <p class="text-xs" v-html="formatText(colorData.aiInsight)"></p>
          </div>

          <!-- New comment form -->
          <!-- <div class="mt-6 flex gap-x-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
              class="h-6 w-6 flex-none rounded-full bg-gray-50"
            />
            <form action="#" class="relative flex-auto">
              <div
                class="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600"
              >
                <label for="comment" class="sr-only">Add your comment</label>
                <textarea
                  rows="2"
                  name="comment"
                  id="comment"
                  class="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Add your comment..."
                />
              </div>

              <div class="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                <div class="flex items-center space-x-5">
                  <div class="flex items-center">
                    <button
                      type="button"
                      class="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <PaperClipIcon class="h-5 w-5" aria-hidden="true" />
                      <span class="sr-only">Attach a file</span>
                    </button>
                  </div>
                  <div class="flex items-center">
                    <Listbox as="div" v-model="selected">
                      <ListboxLabel class="sr-only">Your mood</ListboxLabel>
                      <div class="relative">
                        <ListboxButton
                          class="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                        >
                          <span class="flex items-center justify-center">
                            <span v-if="selected.value === null">
                              <FaceSmileIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                              <span class="sr-only">Add your mood</span>
                            </span>
                            <span v-if="!(selected.value === null)">
                              <span
                                :class="[
                                  selected.bgColor,
                                  'flex h-8 w-8 items-center justify-center rounded-full'
                                ]"
                              >
                                <component
                                  :is="selected.icon"
                                  class="h-5 w-5 flex-shrink-0 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                              <span class="sr-only">{{ selected.name }}</span>
                            </span>
                          </span>
                        </ListboxButton>

                        <transition
                          leave-active-class="transition ease-in duration-100"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <ListboxOptions
                            class="absolute z-10 -ml-6 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm"
                          >
                            <ListboxOption
                              as="template"
                              v-for="mood in moods"
                              :key="mood?.value"
                              :value="mood"
                              v-slot="{ active }"
                            >
                              <li
                                :class="[
                                  active ? 'bg-gray-100' : 'bg-white',
                                  'relative cursor-default select-none px-3 py-2'
                                ]"
                              >
                                <div class="flex items-center">
                                  <div
                                    :class="[
                                      mood.bgColor,
                                      'flex h-8 w-8 items-center justify-center rounded-full'
                                    ]"
                                  >
                                    <component
                                      :is="mood.icon"
                                      :class="[mood.iconColor, 'h-5 w-5 flex-shrink-0']"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <span class="ml-3 block truncate font-medium">{{
                                    mood.name
                                  }}</span>
                                </div>
                              </li>
                            </ListboxOption>
                          </ListboxOptions>
                        </transition>
                      </div>
                    </Listbox>
                  </div>
                </div>
                <button
                  type="submit"
                  class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Comment
                </button>
              </div>
            </form>
          </div> -->
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter {
  width: 0;
  opacity: 0;
}
.slide-fade-leave-to {
  width: 100%;
  opacity: 1;
}
</style>
<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type { colorResponse } from '@/interfaces/insights.interfaces'
import { FaceSmileIcon, CubeTransparentIcon } from '@heroicons/vue/24/outline'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import {
  CalendarDaysIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  FaceFrownIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  UserCircleIcon,
  XMarkIcon as XMarkIconMini
} from '@heroicons/vue/20/solid'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'
import colorInsightData from './mockData.js/colorInsight'
import ColorEChart from '@/components/ColorEChart.vue'

const invoice = {
  subTotal: '$8,800.00',
  tax: '$1,760.00',
  total: '$10,560.00',
  items: [
    {
      id: 1,
      title: 'Logo redesign',
      description: 'New logo and digital asset playbook.',
      hours: '20.0',
      rate: '$100.00',
      price: '$2,000.00'
    },
    {
      id: 2,
      title: 'Website redesign',
      description: 'Design and program new company website.',
      hours: '52.0',
      rate: '$100.00',
      price: '$5,200.00'
    },
    {
      id: 3,
      title: 'Business cards',
      description: 'Design and production of 3.5" x 2.0" business cards.',
      hours: '12.0',
      rate: '$100.00',
      price: '$1,200.00'
    },
    {
      id: 4,
      title: 'T-shirt design',
      description: 'Three t-shirt design concepts.',
      hours: '4.0',
      rate: '$100.00',
      price: '$400.00'
    }
  ]
}
const activity = [
  {
    id: 1,
    type: 'created',
    person: { name: 'Chelsea Hagon' },
    date: '7d ago',
    dateTime: '2023-01-23T10:32'
  },
  {
    id: 2,
    type: 'edited',
    person: { name: 'Chelsea Hagon' },
    date: '6d ago',
    dateTime: '2023-01-23T11:03'
  },
  {
    id: 3,
    type: 'sent',
    person: { name: 'Chelsea Hagon' },
    date: '6d ago',
    dateTime: '2023-01-23T11:24'
  },
  {
    id: 4,
    type: 'commented',
    person: {
      name: 'Chelsea Hagon',
      imageUrl:
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
    date: '3d ago',
    dateTime: '2023-01-23T15:56'
  },
  {
    id: 5,
    type: 'viewed',
    person: { name: 'Alex Curren' },
    date: '2d ago',
    dateTime: '2023-01-24T09:12'
  },
  {
    id: 6,
    type: 'paid',
    person: { name: 'Alex Curren' },
    date: '1d ago',
    dateTime: '2023-01-24T09:20'
  }
]
const tabs = [
  { name: 'Color', href: '#', current: true },
  { name: 'Culture', href: '#', current: false },
  { name: 'Styles', href: '#', current: false }
]

const api = import.meta.env.VITE_APP_API
const userStore = useUserStore()
const loading = ref(true)
// const colorData = ref<colorResponse>()
const colorData = ref<colorResponse>(colorInsightData)

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
      window.alert(error)
    })
}

const formatText = (text: string) => {
  return text.replace(/\n/g, '<br>')
}

const gradient = computed(() => {
  if (colorData.value?.insights) {
    const allColors = colorData.value.insights.flatMap((insight) => insight.hex_colors)
    if (allColors.length === 1) {
      // If there's only one color, return it as the background color
      return allColors[0]
    } else {
      // If there's more than one color, return a linear gradient
      return `linear-gradient(to right, ${allColors.join(', ')})`
    }
  }
  return '#000'
})
// fetchColorInsights()
</script>
