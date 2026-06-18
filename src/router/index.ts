import Home from '@/pages/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/Login.vue'
import Signup from '@/pages/Signup.vue'
import Verify from '@/pages/Verify.vue'
import Cart from '@/pages/Cart.vue'
import User from '@/pages/User.vue'
import Invoice from '@/pages/Invoice.vue'
import CardDetails from '@/pages/CardDetails.vue'
import SetDetails from '@/pages/SetDetails.vue'
import SetShop from '@/pages/SetShop.vue'
import CardCatalogue from '@/pages/CardCatalogue.vue'
import DeckBuilder from '@/pages/DeckBuilder.vue'

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
      path: '/deckbuilder',
      component: DeckBuilder,
      meta: {
        title: 'Deck Builder'
      }
    },
    {
      path: '/shop',
      component: SetShop,
      meta: {
        title: 'Shop'
      }
    },
    {
      path: '/set/:setName',
      component: SetDetails,
      meta: {
        title: 'Set'
      }
    },
    {
      path: '/card/:id',
      component: CardDetails,
      meta: {
        title: 'Card Details'
      }
    },
    {
      path: '/card-catalogue',
      component: CardCatalogue,
      meta: {
        title: 'Card Catalogue'
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
        title: 'Email Verification'
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
    document.title = `${to.meta.title} - DECKForge`
  }

  next()
})

export default router
