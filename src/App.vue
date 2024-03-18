<script setup lang="ts">
import axios from 'axios'
import { RouterView, useRouter } from 'vue-router'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from './stores/user'
import WhiteGlyph from './components/icons/WhiteGlyph.vue'

const navItems = [
  { name: 'Collection', href: '/collection' },
  { name: 'Chicago Art Institute', href: '/chicago' },
  { name: 'Harvard Art Museums', href: '/harvard' },
  { name: 'About', href: '/about' }
]

const userStore = useUserStore()
const router = useRouter()
const route = router.currentRoute
const api = import.meta.env.VITE_APP_API
const userLoggedIn = ref(false)

onMounted(() => {
  if (!userStore.user) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const noPassword = JSON.parse(storedUser)
      delete noPassword.password
      userStore.setUser(noPassword)
    }
  }
  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token')

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    axios
      .get(`${api}/auth/is-token-expired`, config)
      .then((response) => {
        if (response.data) {
          localStorage.setItem('loggedIn', 'false')
          userLoggedIn.value = false
          userStore.setLoggedIn(false)
        } else {
          localStorage.setItem('loggedIn', 'true')
          userStore.setLoggedIn(true)
          userLoggedIn.value = true
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }
})

watch(
  () => userStore.loggedIn,
  (newValue) => {
    userLoggedIn.value = newValue
    localStorage.setItem('loggedIn', newValue ? 'true' : 'false')
  }
)

const searchTerm = ref('')
const apiSelection = ref('Harvard')
const onSearch = () => {
  if (apiSelection.value === 'Chicago') {
    router.push({ name: 'chicago art institute', query: { searchTerm: searchTerm.value } })
  } else {
    router.push({ name: 'harvard art museums', query: { searchTerm: searchTerm.value } })
  }
}
watch(route, (newRoute) => {
  if (newRoute.name === 'harvard art museums') {
    apiSelection.value = 'Harvard'
  } else if (newRoute.name === 'chicago art institute') {
    apiSelection.value = 'Chicago'
  }
  // Add more conditions here for other routes
})
</script>

<template>
  <Disclosure as="nav" class="bg-zinc-800" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="flex items-center px-2 lg:px-0">
          <div class="flex-shrink-0">
            <WhiteGlyph class="h-8 w-8" />
          </div>
          <div class="hidden lg:ml-6 lg:block">
            <div class="flex space-x-4">
              <!-- Current: "bg-zinc-900 text-white", Default: "text-zinc-300 hover:bg-zinc-700 hover:text-white" -->
              <router-link
                v-for="item in navItems"
                :key="item.name"
                :to="item.href"
                class="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
                active-class="bg-zinc-900 text-white"
                >{{ item.name }}</router-link
              >
            </div>
          </div>
        </div>
        <div class="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
          <form @submit.prevent="onSearch" class="w-full max-w-lg lg:max-w-sm">
            <label for="search" class="sr-only">Search</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon class="h-5 w-5 text-zinc-400" aria-hidden="true" />
              </div>
              <input
                v-model="searchTerm"
                id="search"
                name="search"
                class="border-0 block w-full rounded-md bg-zinc-700 m-1 py-1.5 pl-10 pr-32 text-zinc-300 placeholder:text-zinc-400 focus:bg-white focus:text-zinc-900 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Search"
                type="search"
                autocomplete="off"
              />
              <!-- block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 -->
              <div class="absolute inset-y-0 right-0 flex items-center">
                <label for="api" class="sr-only">Art Api</label>
                <select
                  v-model="apiSelection"
                  id="api"
                  name="api"
                  class="h-full w-full rounded-md border-0 bg-transparent py-1.5 pl-2 pr-7 text-gray-400 outline-none sm:text-sm"
                >
                  <option>Harvard</option>
                  <option>Chicago</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="flex lg:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton
            class="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="hidden lg:ml-4 lg:block">
          <div class="flex items-center">
            <!-- Profile dropdown -->
            <Menu v-show="userLoggedIn" as="div" class="relative ml-4 flex-shrink-0">
              <div>
                <MenuButton
                  class="relative flex rounded-full bg-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <div
                    class="h-8 w-8 rounded-full"
                    :style="{ backgroundColor: userStore.user ? userStore.user.color : '#fff' }"
                  />
                </MenuButton>
              </div>

              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <MenuItem v-slot="{ active }">
                    <router-link
                      :to="{ name: 'profile' }"
                      :class="[
                        active ? 'bg-zinc-100' : '',
                        'block px-4 py-2 text-sm text-zinc-700'
                      ]"
                      >Your Profile</router-link
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <router-link
                      :to="{ name: 'sign out' }"
                      :class="[
                        active ? 'bg-zinc-100' : '',
                        'block px-4 py-2 text-sm text-zinc-700'
                      ]"
                      >Sign out</router-link
                    >
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
            <div v-show="!userLoggedIn" class="hidden lg:ml-6 lg:block">
              <div class="flex space-x-4">
                <!-- Current: "bg-zinc-900 text-white", Default: "text-zinc-300 hover:bg-zinc-700 hover:text-white" -->
                <router-link
                  :to="{ name: 'login' }"
                  class="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  active-class="bg-zinc-900 text-white"
                  >Sign In</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DisclosurePanel v-slot="{ close }" class="lg:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2">
        <!-- Current: "bg-zinc-900 text-white", Default: "text-zinc-300 hover:bg-zinc-700 hover:text-white" -->
        <router-link
          @click="close"
          v-for="item in navItems"
          :key="item.name"
          :to="item.href"
          class="block rounded-md px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
          active-class="bg-zinc-900 text-white"
        >
          {{ item.name }}
        </router-link>
      </div>
      <div v-show="userLoggedIn" class="border-t border-zinc-700 pb-3 pt-4">
        <div class="flex items-center px-5">
          <div
            class="h-10 w-10 rounded-full"
            :style="{ backgroundColor: userStore.user ? userStore.user.color : '#fff' }"
          />
          <div class="ml-3">
            <div class="text-base font-medium text-white">{{ userStore.user?.name }}</div>
            <div class="text-sm font-medium text-zinc-400">{{ userStore.user?.email }}</div>
          </div>
        </div>

        <div class="mt-3 space-y-1 px-2">
          <router-link
            @click="close"
            :to="{ name: 'profile' }"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
            active-class="bg-zinc-900 text-white"
            >Your Profile</router-link
          >
          <router-link
            @click="close"
            :to="{ name: 'sign out' }"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
            active-class="bg-zinc-900 text-white"
            >Sign out</router-link
          >
        </div>
      </div>
      <div v-show="!userLoggedIn" class="space-y-1 px-2 pb-3 pt-4 border-t border-zinc-700">
        <!-- Current: "bg-zinc-900 text-white", Default: "text-zinc-300 hover:bg-zinc-700 hover:text-white" -->
        <router-link
          @click="close"
          :to="{ name: 'login' }"
          class="block rounded-md px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
          active-class="bg-zinc-900 text-white"
        >
          Sign In
        </router-link>
      </div>
    </DisclosurePanel>
  </Disclosure>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
    <RouterView />
  </div>
</template>
<style></style>
