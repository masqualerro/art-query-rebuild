<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Chicago Art Institute', href: '/chicago' },
  { name: 'Harvard Art Museums', href: '/harvard' },
  { name: 'About', href: '/about' }
]
</script>

<template>
  <Disclosure as="nav" class="bg-zinc-800" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="flex items-center px-2 lg:px-0">
          <div class="flex-shrink-0">
            <img
              class="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              alt="Your Company"
            />
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
          <div class="w-full max-w-lg lg:max-w-xs">
            <label for="search" class="sr-only">Search</label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon class="h-5 w-5 text-zinc-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                class="block w-full rounded-md border-0 bg-zinc-700 py-1.5 pl-10 pr-3 text-zinc-300 placeholder:text-zinc-400 focus:bg-white focus:text-zinc-900 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Search"
                type="search"
              />
            </div>
          </div>
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
            <button
              type="button"
              class="relative flex-shrink-0 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
            >
              <span class="absolute -inset-1.5" />
              <span class="sr-only">View notifications</span>
              <BellIcon class="h-6 w-6" aria-hidden="true" />
            </button>

            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-4 flex-shrink-0">
              <div>
                <MenuButton
                  class="relative flex rounded-full bg-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                >
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
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
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-zinc-100' : '',
                        'block px-4 py-2 text-sm text-zinc-700'
                      ]"
                      >Your Profile</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-zinc-100' : '',
                        'block px-4 py-2 text-sm text-zinc-700'
                      ]"
                      >Settings</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-zinc-100' : '',
                        'block px-4 py-2 text-sm text-zinc-700'
                      ]"
                      >Sign out</a
                    >
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>

    <DisclosurePanel class="lg:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2">
        <!-- Current: "bg-zinc-900 text-white", Default: "text-zinc-300 hover:bg-zinc-700 hover:text-white" -->
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.href"
          class="block rounded-md px-3 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
          active-class="bg-zinc-900 text-white"
        >
          <DisclosureButton>
            {{ item.name }}
          </DisclosureButton>
        </router-link>
      </div>
      <div class="border-t border-zinc-700 pb-3 pt-4">
        <div class="flex items-center px-5">
          <div class="flex-shrink-0">
            <img
              class="h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-white">Tom Cook</div>
            <div class="text-sm font-medium text-zinc-400">tom@example.com</div>
          </div>
          <button
            type="button"
            class="relative ml-auto flex-shrink-0 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
          >
            <span class="absolute -inset-1.5" />
            <span class="sr-only">View notifications</span>
            <BellIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-3 space-y-1 px-2">
          <DisclosureButton
            as="a"
            href="#"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >Your Profile</DisclosureButton
          >
          <DisclosureButton
            as="a"
            href="#"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >Settings</DisclosureButton
          >
          <DisclosureButton
            as="a"
            href="#"
            class="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
            >Sign out</DisclosureButton
          >
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
    <RouterView />
  </div>
</template>
