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
    setUser(newUser: UserInfo) {
      this.user = newUser
    },
    setToken(newToken: string) {
      this.accessToken = newToken
    },
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn
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
