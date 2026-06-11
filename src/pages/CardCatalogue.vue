<script setup lang="ts">
    import Loading from '@/components/Loading.vue';
    import { getCardImage } from '@/helpers/image';
    import type { CardModel } from '@/models/card.model';
    import { DataService } from '@/services/data.service';
    import { computed, onMounted, ref, watch } from 'vue';
    
    const cards = ref<CardModel[]>([])
    const loading = ref(false)
    const totalResults = ref(0)
    const search = ref('')
    const currentPage = ref(1)
    const PAGE_SIZE = 24
    const totalPages = computed(() =>
        Math.ceil(totalResults.value / PAGE_SIZE)
    )
    
    async function loadCards() {
        loading.value = true

        try {
            const offset = ((currentPage.value - 1) * PAGE_SIZE)
            
            const rsp = await DataService.getCards(search.value, PAGE_SIZE, offset)

            cards.value = rsp.data.cards
            totalResults.value = rsp.data.total  
        } finally {
            loading.value = false
        }
    }

    function nextPage() {
      currentPage.value++
    }

    function previousPage() {
        if (currentPage.value > 1) {
            currentPage.value--
        }
    }

    watch(search, () => {
        currentPage.value = 1
    })

    watch(currentPage, loadCards)

    onMounted(loadCards)
</script>

<template>
    <section class="banner d-flex justify-content-center align-items-center">
        <div class="text-center">
            <h1 class="display-3 fw-bold text-white">
                Card Catalogue
            </h1>
            <p class="lead text-white">
                Dive into the full Yu-Gi-Oh! card library and discover new combos, archetypes, and strategies!
            </p>
        </div>
    </section>
    <div class="container mt-3 mb-3 page-content">
        <div class="d-flex mb-3 align-items-center justify-content-center controls">
            <div class="search-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input v-model="search" @keyup.enter="loadCards" type="text" class="form-control search-bar" placeholder="Search cards...">
            </div>
            <div class="d-flex gap-1 align-items-center">
                <button class="btn btn-outline-primary text-nowrap" @click="previousPage" :disabled="currentPage === 1">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <span class="text-nowrap">
                    Page {{ currentPage }}/{{ totalPages }} of {{ totalResults }} total cards
                </span>
                <button class="btn btn-outline-primary text-nowrap" @click="nextPage" :disabled="cards.length < PAGE_SIZE">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
        <div class="row g-4" v-if="cards.length > 0">
            <div v-for="card in cards" :key="card.id" class="col-lg-auto">
                <RouterLink :to="`/card/${card.id}`">
                    <img :src="getCardImage(card.id)" class="img-fluid rounded shadow-sm card-image">
                </RouterLink>
            </div>
        </div>
        <div v-else-if="loading" class="empty-state">
            <Loading />
        </div>
        <div v-else class="empty-state">
            <h4>No matching cards found</h4>
        </div>
    </div>
</template>

<style scoped>
    .page-content {
        display: flex;
        flex-direction: column;
        flex: 1
    }

    .banner {
      height: 53vh;

      background:
          linear-gradient(
              rgba(0,0,0,0.5),
              rgba(0,0,0,0.5)
          ),
          url('/monsters_banner.jpg');

      background-size: cover;
      background-position: center;
    }

    .controls {
        gap: 5rem
    }

    .search-wrapper {
        position: relative;
    }

    .search-icon {
        position: absolute;

        left: 12px;
        top: 50%;

        transform: translateY(-50%);

        color: gray;
    }

    .search-bar {
        width: 300px;
        padding-left: 2.5rem;
    }

    .content {
        flex: 1
    }
    
    .card-image {
        width: 100%;
        max-width: 140px;

        cursor: pointer;
        transition: .2s;
    }

    .card-image:hover {
        transform: translateY(-4px);
    }

    .empty-state {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
