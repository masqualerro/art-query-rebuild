import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/userJourney/LoginView.vue'
import CollectionHome from '@/views/collection/CollectionHome.vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAuthenticatedUser } from '@/services/authApi'

async function guardMyRoute(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const userStore = useUserStore()
  let isAuthenticated = false

  userStore.hydrateSession()

  if (userStore.accessToken) {
    try {
      const user = await getAuthenticatedUser()
      userStore.setUser(user)
      userStore.setLoggedIn(true)
      isAuthenticated = true
    } catch (error) {
      console.error(error)
      userStore.clearSession()
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
  // Perform sign out actions here
  const userStore = useUserStore()
  userStore.signOut()
  next('/login') // Redirect to login after signing out
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/about'
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
      beforeEnter: guardMyRoute,
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/chicago',
      redirect: (to) => ({ path: '/museum/chicago', query: to.query })
    },
    {
      path: '/harvard',
      redirect: (to) => ({ path: '/museum/harvard', query: to.query })
    },
    {
      path: '/smithsonian',
      redirect: (to) => ({ path: '/museum/smithsonian', query: to.query })
    },
    {
      path: '/cleveland',
      redirect: (to) => ({ path: '/museum/cleveland', query: to.query })
    },
    {
      path: '/museum/chicago',
      name: 'chicago art institute',
      component: () => import('../views/ChicagoView.vue')
    },
    {
      path: '/museum/harvard',
      name: 'harvard art museums',
      component: () => import('../views/HarvardView.vue')
    },
    {
      path: '/museum/smithsonian',
      name: 'smithsonian',
      component: () => import('../views/SmithsonianView.vue')
    },
    {
      path: '/museum/cleveland',
      name: 'cleveland',
      component: () => import('../views/ClevelandView.vue')
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('../views/DiscoverView.vue')
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
