<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        class="mx-auto h-10 w-auto"
        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900"
            >Email address</label
          >
          <div class="mt-2">
            <input
              v-model="state.email"
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900"
              >Password</label
            >
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500"
                >Forgot password?</a
              >
            </div>
          </div>
          <div class="mt-2">
            <input
              v-model="state.password"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </div>
      </form>
      <div v-if="error" class="mt-2 text-center">
        <span class="text-xs text-red-500"
          >Unable to login. Please check your login details and try again, or follow the link above
          to reset your password.</span
        >
      </div>
      <p class="mt-10 text-center text-sm text-gray-500">
        Not a member?
        {{ ' ' }}
        <router-link
          :to="{ name: 'sign up' }"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >Create an account</router-link
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
import { useUserStore } from '@/stores/user'
import axios from 'axios'

export default {
  data() {
    return {
      api: null,
      error: false,
      loading: false
    }
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const state = reactive({
      email: '',
      password: ''
    })
    const rules = computed(() => {
      return {
        email: { required, email },
        password: { required }
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
    login() {
      const data = {
        email: this.state.email,
        password: this.state.password
      }
      this.v$.$validate()
      if (!this.v$.$error) {
        this.loading = true
        axios
          .post(this.api + '/auth/login', data)
          .then((response) => {
            this.v$.$reset()
            this.error = false
            const userObject = {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              age: response.data.user.age,
              color: response.data.user.color
            }
            this.loading = false
            // Handle and response
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('loggedIn', 'true')

            // commit to pinia store
            const userStore = useUserStore()
            userStore.setUser(userObject)
            userStore.setToken(response.data.access_token)
            userStore.setLoggedIn(true)

            // Redirect success user
            this.$router.push('/collection/display')
          })
          // Handle errors
          .catch((error) => {
            console.error(error)
            this.loading = false
            this.error = true
          })
      }
    }
  },
  created() {
    this.api = import.meta.env.VITE_APP_API
  }
}
</script>
