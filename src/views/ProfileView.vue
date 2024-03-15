<template>
  <div class="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <BlackGlyph class="mx-auto h-12 w-auto" />
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Edit Profile
        </h2>
      </div>
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <fieldset>
            <legend class="block text-sm font-medium leading-6 text-gray-900">
              Account Details
            </legend>
            <div class="mt-2 -space-y-px rounded-md bg-white shadow-sm">
              <div>
                <label for="email" class="sr-only">Email</label>
                <input
                  v-model="state.email"
                  type="text"
                  name="email"
                  id="email"
                  class="relative block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  :class="{
                    'ring-red-500': v$.email.$error || userExists,
                    'ring-gray-300': !v$.email.$error
                  }"
                  placeholder="Email address"
                  autocomplete="email"
                />
                <span v-if="v$.email.$error" class="text-xs text-red-500">
                  Please enter a valid email address.
                </span>
                <span v-if="userExists" class="text-xs text-red-500">
                  There is already an account with this email.
                  <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
                    >Login here</a
                  >
                </span>
              </div>
            </div>
          </fieldset>
        </div>

        <div>
          <fieldset>
            <legend class="block text-sm font-medium leading-6 text-gray-900">
              Personal Details
            </legend>
            <div class="mt-2 -space-y-px rounded-md bg-white shadow-sm">
              <div>
                <label for="name" class="sr-only">Name</label>
                <input
                  v-model="state.name"
                  type="text"
                  name="name"
                  id="name"
                  :class="{
                    'ring-red-500': v$.name.$error,
                    'ring-gray-300': !v$.name.$error
                  }"
                  class="relative block w-full rounded-none rounded-t-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Name"
                  autocomplete="name"
                />
                <span v-if="v$.name.$error" class="text-xs text-red-500">
                  Please fill out this field.
                </span>
              </div>
              <div class="flex -space-x-px">
                <div class="w-1/2 min-w-0 flex-1">
                  <label for="age" class="sr-only">Age</label>
                  <input
                    v-model="state.age"
                    type="number"
                    name="age"
                    id="age"
                    class="relative block w-full rounded-none rounded-b-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Age (optional)"
                    autocomplete="off"
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="flex items-center gap-x-2">
          <input
            v-model="state.color"
            class="p-1 h-10 w-14 block bg-white border-none cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            type="color"
            id="color"
            name="color"
          />
          <label class="text-sm" for="color"
            >Pfp color <span :style="{ color: state.color }">[ {{ state.color }} ]</span>
          </label>
        </div>
        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, reactive } from 'vue'
import { email, required } from '@vuelidate/validators'
import useValidate from '@vuelidate/core'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import type { userObject } from '@/interfaces/user.interface'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'

export default {
  components: {
    BlackGlyph
  },
  data() {
    return {
      api: null,
      error: false,
      loading: false,
      userExists: false
    }
  },
  setup() {
    const { user: storeUser } = storeToRefs(useUserStore())
    const user = reactive({
      id: 0,
      email: '',
      name: '',
      age: 0,
      color: ''
    })
    const router = useRouter()
    const route = useRoute()
    const state = reactive({
      email: '',
      name: '',
      age: 0,
      color: ''
    })
    if (storeUser.value) {
      state.email = storeUser.value.email
      state.name = storeUser.value.name
      state.age = storeUser.value.age
      state.color = storeUser.value.color
    } else {
      const localUserString = localStorage.getItem('user')
      if (localUserString !== null) {
        const localUser = JSON.parse(localUserString)
        storeUser.value = localUser
        state.email = localUser.email
        state.name = localUser.name
        state.age = localUser.age
        state.color = localUser.color
      }
    }
    const rules = computed(() => {
      return {
        email: { required, email },
        name: { required },
        color: { required }
      }
    })
    const v$ = useValidate(rules, state)
    return {
      state,
      v$,
      router,
      route,
      storeUser
    }
  },
  methods: {
    submitForm() {
      const data = {
        email: this.state.email,
        name: this.state.name,
        age: this.state.age,
        color: this.state.color
      }
      this.v$.$validate()
      if (!this.v$.$error) {
        this.patchUser(data)
      } else {
        console.log(this.v$)
      }
    },
    patchUser(data: any) {
      const token = localStorage.getItem('token')

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      this.loading = true
      axios
        .patch(this.api + '/users/' + (this.storeUser ? this.storeUser.id : ''), data, config)
        .then((response) => {
          this.loading = false
          this.error = false
          const userObject = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            age: response.data.user.age,
            color: response.data.user.color
          }
          // Handle and response
          localStorage.setItem('user', JSON.stringify(userObject))
          useUserStore().setUser(userObject)
        })
        .catch((error) => {
          this.loading = false
          this.error = true
          console.error(error)
        })
    }
  },
  created() {
    this.api = import.meta.env.VITE_APP_API
  }
}
</script>
