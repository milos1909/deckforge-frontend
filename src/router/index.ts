import Set from '@/pages/Set.vue'
import Home from '@/pages/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Card from '@/pages/Card.vue'
import Login from '@/pages/Login.vue'
import Signup from '@/pages/Signup.vue'
import Verify from '@/pages/Verify.vue'
import Cart from '@/pages/Cart.vue'
import User from '@/pages/User.vue'
import Catalogue from '@/pages/Catalogue.vue'
import Invoice from '@/pages/Invoice.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/set/:set_name',
      component: Set,
      meta: {
        title: 'Set'
      }
    },
    {
      path: '/card/:id',
      component: Card,
      meta: {
        title: 'Card'
      }
    },
    {
      path: '/catalogue',
      component: Catalogue,
      meta: {
        title: 'Catalogue'
      }
    },
    {
      path: '/login',
      component: Login,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/signup',
      component: Signup,
      meta: {
        title: 'Signup'
      }
    },
    {
      path: '/verify',
      component: Verify,
      meta: {
        title: 'Email verification'
      }
    },
    {
      path: '/cart',
      component: Cart,
      meta: {
        title: 'Cart'
      }
    },
    {
      path: '/user',
      component: User,
      meta: {
        title: 'User Profile'
      }
    },
    {
      path: '/invoice/:id',
      component: Invoice,
      meta: {
        title: 'Invoice details'
      }
    },
    {
      path: '/:pathmatch(.*)*',
      redirect: '/'
    }
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Yu-Gi-Oh! Shop`
  }

  next()
})

export default router
