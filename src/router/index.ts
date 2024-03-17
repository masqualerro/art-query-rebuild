import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/userJourney/LoginView.vue'
import CollectionHome from '@/views/collection/CollectionHome.vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

async function guardMyRoute(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const userStore = useUserStore()
  const api = import.meta.env.VITE_APP_API
  let isAuthenticated = false

  if (!userStore.user) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const noPassword = JSON.parse(storedUser)
      delete noPassword.password
      userStore.setUser(noPassword)
    }
  }

  const token = localStorage.getItem('token')
  if (token) {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    }

    try {
      const response = await axios.get(`${api}/auth/is-token-expired`, config)
      if (!response.data) {
        userStore.setLoggedIn(true)
        isAuthenticated = true
      } else {
        userStore.setLoggedIn(false)
      }
    } catch (error) {
      console.error(error)
      userStore.setLoggedIn(false)
    }
  }

  if (isAuthenticated) {
    next()
  } else {
    next('/login')
  }
}

function signOutGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  console.log('Before entering /signout route')
  // Perform sign out actions here
  const userStore = useUserStore()
  userStore.signOut()
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  next('/login') // Redirect to login after signing out
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'sign up',
      component: () => import('../views/userJourney/CreateAccountView.vue')
    },
    {
      path: '/signout',
      name: 'sign out',
      beforeEnter: signOutGuard,
      component: { template: '<div></div>' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/chicago',
      name: 'chicago art institute',
      component: () => import('../views/ChicagoView.vue')
    },
    {
      path: '/harvard',
      name: 'harvard art museums',
      component: () => import('../views/HarvardView.vue')
    },
    {
      path: '/collection',
      component: CollectionHome,
      beforeEnter: guardMyRoute,
      children: [
        { path: '', redirect: '/collection/display' },
        {
          path: 'display',
          name: 'collection display',
          component: () => import('../views/collection/CollectionGrid.vue')
        },
        {
          path: 'insights',
          name: 'collection insights',
          component: () => import('../views/collection/CollectionInsights.vue')
        }
      ]
    }
  ]
})

export default router
