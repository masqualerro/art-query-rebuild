<template>
  <div class="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-10">
      <div>
        <BlackGlyph class="mx-auto h-12 w-auto" />
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create Account
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
                  class="relative block w-full rounded-none rounded-t-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  <router-link
                    :to="'/login'"
                    class="font-semibold text-indigo-600 hover:text-indigo-500"
                    >Login here</router-link
                  >
                </span>
              </div>
              <div class="flex -space-x-px">
                <div class="w-1/2 min-w-0 flex-1">
                  <label for="password" class="sr-only">Password</label>
                  <input
                    v-model="state.password"
                    type="password"
                    name="password"
                    id="password"
                    :class="{
                      'ring-red-500': v$.password.$error,
                      'ring-gray-300': !v$.password.$error
                    }"
                    class="relative block w-full rounded-none rounded-b-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Password"
                    autocomplete="current-password"
                  />
                  <span v-if="v$.password.$error" class="text-xs text-red-500">
                    Please enter a password.
                  </span>
                </div>
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
            value="#e66465"
          />
          <label class="text-sm" for="color"
            >Choose a color for your pfp
            <span :style="{ color: state.color }">[ {{ state.color }} ]</span></label
          >
        </div>
        <div>
          <button
            type="submit"
            class="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <svg
              v-if="loading"
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
            <span v-if="loading">Creating ...</span>
            <span v-else>Create</span>
          </button>
        </div>
      </form>

      <p class="text-center text-sm leading-6 text-gray-500">
        Already have an account?
        {{ ' ' }}
        <router-link :to="'/login'" class="font-semibold text-indigo-600 hover:text-indigo-500"
          >Login here</router-link
        >
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, reactive } from 'vue'
import { email, required } from '@vuelidate/validators'
import useValidate from '@vuelidate/core'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import type { newUser } from '@/interfaces/user.interface'
import BlackGlyph from '@/components/icons/BlackGlyph.vue'

export default {
  data() {
    return {
      api: null,
      error: false,
      loading: false,
      userExists: false
    }
  },
  components: {
    BlackGlyph
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const state = reactive({
      email: '',
      password: '',
      name: '',
      age: '',
      color: '#e66465'
    })
    const rules = computed(() => {
      return {
        email: { required, email },
        password: { required },
        name: { required },
        color: { required }
      }
    })
    const v$ = useValidate(rules, state)
    return {
      state,
      v$,
      router,
      route
    }
  },
  methods: {
    submitForm() {
      const data = {
        email: this.state.email,
        password: this.state.password,
        name: this.state.name,
        age: this.state.age,
        color: this.state.color
      }
      this.v$.$validate()
      if (!this.v$.$error) {
        this.createAccount(data)
      } else {
        console.log(this.v$)
      }
    },
    createAccount(data: newUser) {
      this.loading = true
      axios
        .post(this.api + '/users', data)
        .then(() => {
          this.loading = false
          this.error = false
          this.$router.push('/login')
        })
        // Handle errors
        .catch((error) => {
          if (error.response.status === 409) {
            this.userExists = true
          }
          this.loading = false
          console.error(error)
        })
    }
  },
  created() {
    this.api = import.meta.env.VITE_APP_API
  }
}
</script>
