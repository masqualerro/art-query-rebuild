import { defineStore } from 'pinia'

interface UserInfo {
  id: string
  email: string
  name: string
  age?: number | null
  color: string
}

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null as UserInfo | null,
      accessToken: null as string | null,
      loggedIn: false
    }
  },
  getters: {
    authHeader: (state) => (state.accessToken ? `Bearer ${state.accessToken}` : null)
  },
  actions: {
    hydrateSession() {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken) {
        this.accessToken = storedToken
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        delete parsedUser.password
        this.user = parsedUser
      }

      this.loggedIn = Boolean(this.accessToken && this.user)
    },
    setSession(user: UserInfo, token: string) {
      this.user = user
      this.accessToken = token
      this.loggedIn = true
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('loggedIn', 'true')
    },
    clearSession() {
      this.user = null
      this.accessToken = null
      this.loggedIn = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.setItem('loggedIn', 'false')
    },
    setUser(newUser: UserInfo | null) {
      this.user = newUser
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser))
      } else {
        localStorage.removeItem('user')
      }
    },
    setToken(newToken: string | null) {
      this.accessToken = newToken
      if (newToken) {
        localStorage.setItem('token', newToken)
      } else {
        localStorage.removeItem('token')
      }
    },
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn
      localStorage.setItem('loggedIn', loggedIn ? 'true' : 'false')
    },
    signOut() {
      this.clearSession()
    }
  }
})
