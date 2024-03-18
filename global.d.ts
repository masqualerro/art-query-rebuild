import axios from 'axios'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: typeof axios
    $router: import('vue-router').Router
  }
}
