import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/userJourney/LoginView.vue'
import CollectionHome from '@/views/collection/CollectionHome.vue'

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
      name: 'collection',
      component: CollectionHome,
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
