import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null as UserInfo | null,
      accessToken: null as string | null,
      loggedIn: false
    }
  },
  actions: {
    setUser(newUser: UserInfo | null) {
      this.user = newUser
    },
    setToken(newToken: string | null) {
      this.accessToken = newToken
    },
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn
    },
    signOut() {
      this.setUser(null)
      this.setToken(null)
      this.setLoggedIn(false)
    }
  }
})

interface UserInfo {
  id: number
  email: string
  name: string
  age: number
  color: string
}
