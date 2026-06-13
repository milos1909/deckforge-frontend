<script setup lang="ts">
    import CardTooltip from '@/components/CardTooltip.vue';
    import Loading from '@/components/Loading.vue';
    import { getCardImage, setFallbackImage } from '@/helpers/image';
    import type { CardModel } from '@/models/card.model';
    import { DataService } from '@/services/data.service';
    import { computed, onMounted, ref, watch } from 'vue';
    
    const cards = ref<CardModel[]>([])
    const loading = ref(false)
    const totalResults = ref(0)
    const search = ref('')
    const currentPage = ref(1)
    const PAGE_SIZE = 30
    const totalPages = computed(() =>
        Math.max(1, Math.ceil(totalResults.value / PAGE_SIZE))
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
    <div class="catalogue-page">
        <div class="container page-content">
            <div class="catalogue-header">
                <div>
                    <h1 class="h2 fw-bold mb-1">Card Catalogue</h1>
                    <p class="text-secondary mb-0">Search, preview, and open any card in the library.</p>
                </div>
            </div>

            <div class="catalogue-toolbar">
                <div class="search-wrapper">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input v-model="search" @keyup.enter="loadCards" type="text" class="form-control search-bar" placeholder="Search cards...">
                    <button class="btn btn-primary search-button" @click="loadCards">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div class="pagination-controls">
                    <button class="btn btn-outline-primary btn-sm" @click="previousPage" :disabled="currentPage === 1">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <span class="small text-secondary">
                        Page {{ currentPage }}/{{ totalPages }} - {{ totalResults }} cards
                    </span>
                    <button class="btn btn-outline-primary btn-sm" @click="nextPage" :disabled="cards.length < PAGE_SIZE">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="catalogue-grid" v-if="cards.length > 0">
                <CardTooltip v-for="card in cards" :key="card.id" :card="card">
                    <RouterLink :to="`/card/${card.id}`" class="card-link">
                        <img :src="getCardImage(card.id)" :alt="card.name" class="card-image" @error="setFallbackImage">
                    </RouterLink>
                </CardTooltip>
            </div>

            <div v-else-if="loading" class="empty-state">
                <Loading />
            </div>

            <div v-else class="empty-state">
                <div class="text-center">
                    <i class="fa-solid fa-magnifying-glass empty-icon"></i>
                    <h4 class="fw-bold mb-1">No matching cards found</h4>
                    <p class="text-secondary mb-0">Try another card name or keyword.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .catalogue-page {
        flex: 1;
        background: #f5f6f8;
    }

    .page-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding-bottom: 2.25rem;
        padding-top: 2rem;
    }

    .catalogue-header {
        align-items: end;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .catalogue-toolbar {
        align-items: center;
        background: #ffffff;
        border: 1px solid #dfe4ec;
        border-radius: 8px;
        box-shadow: 0 10px 24px rgba(18, 29, 43, 0.06);
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        margin-bottom: 1.25rem;
        padding: 1rem;
    }

    .search-wrapper {
        display: grid;
        flex: 1 1 320px;
        gap: 0.5rem;
        grid-template-columns: minmax(0, 1fr) 44px;
        max-width: 520px;
        position: relative;
    }

    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        z-index: 1;
    }

    .search-bar {
        padding-left: 2.5rem;
    }

    .search-button {
        width: 44px;
        padding-left: 0;
        padding-right: 0;
    }

    .pagination-controls {
        align-items: center;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .catalogue-grid {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    }

    .card-link {
        display: block;
    }

    .card-image {
        aspect-ratio: 0.6875;
        border-radius: 4px;
        display: block;
        object-fit: cover;
        width: 100%;
        transition: transform 0.18s, box-shadow 0.18s;
    }

    .card-image:hover {
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.24);
        transform: translateY(-3px);
    }

    .empty-state {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 320px;
    }

    .empty-icon {
        color: #94a3b8;
        font-size: 2rem;
        margin-bottom: 0.75rem;
    }

    @media (max-width: 575.98px) {
        .page-content {
            padding-top: 1.25rem;
        }

        .pagination-controls {
            width: 100%;
        }

        .catalogue-grid {
            grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
        }
    }
</style>
