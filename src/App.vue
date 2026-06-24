<script setup lang="ts">
  import { useAuth } from './hooks/auth.hook';

  const year = new Date().getFullYear()
  const { logout, auth } = useAuth()
</script>

<template>
  <div class="app">
    <nav class="navbar navbar-expand-lg bg-dark navbar-dark">
      <div class="container">
        <RouterLink class="navbar-brand" to="/"> 
          <img src="/puzzle.jpg" alt="Logo" width="32" height="32"/>
          DECKForge
        </RouterLink>
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/deckbuilder">
              <i class="fa-solid fa-hammer"></i>
              Deck Builder
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/decks">
              <i class="fa-solid fa-compass"></i>
              Browse Decks
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/card-catalogue">
              <i class="fa-solid fa-layer-group"></i>
              Card Catalogue
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/shop">
              <i class="fa-solid fa-basket-shopping"></i>
              Set Shop
            </RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto gap-2">
        <template v-if="auth">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/cart">
              <i class="fa-solid fa-cart-shopping"></i>
              Cart
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/user">
              <i class="fa-solid fa-user"></i>
              Profile
            </RouterLink>
          </li>
          <li class="nav-item">
            <button class="btn btn-danger ms-1" @click="logout()">
              Logout
            </button>
          </li>
        </template>
        <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/login">
                Login
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="btn btn-primary ms-1" to="/signup">
                Sign Up
              </RouterLink>
            </li>
        </template>
        </ul>
      </div>
    </nav>
    <main class="content">
      <RouterView/>
    </main>
    <footer class="footer d-flex justify-content-center align-items-center gap-2 py-3 bg-dark text-light">
      <img src="/puzzle.jpg" alt="Logo" width="32" height="32" /> &copy; {{ year }} DeckForge 
    </footer>
  </div>
</template>

<style scoped>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .navbar .nav-link {
    color: rgba(255, 255, 255, 0.9);
  }

  .navbar .nav-link:hover,
  .navbar .router-link-active {
    color: #ffffff;
  }

   .footer {
      margin-top: auto;
  }
</style>
