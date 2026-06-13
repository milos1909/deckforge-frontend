<script setup lang="ts">
    import Loading from '@/components/Loading.vue';
    import { getSetImage, setFallbackImage } from '@/helpers/image';
    import type { SetModel } from '@/models/set.model';
    import { DataService } from '@/services/data.service';
    import { computed, onMounted, ref, watch } from 'vue';

    const sets = ref<SetModel[]>([])
    const loading = ref(false)
    const totalResults = ref(0)
    const search = ref('')
    const currentPage = ref(1)
    const sortDirection = ref<'ASC' | 'DESC'>('DESC')
    const maxPrice = ref(300)
    const PAGE_SIZE = 16
    const totalPages = computed(() =>
        Math.max(1, Math.ceil(totalResults.value / PAGE_SIZE))
    )
    
    async function loadSets() {
        loading.value = true

        try {
            const offset = ((currentPage.value - 1) * PAGE_SIZE)

            const rsp = await DataService.getSets(search.value, sortDirection.value, maxPrice.value, PAGE_SIZE, offset)
            
            sets.value = rsp.data.sets
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

    async function resetFilters() {
        search.value = ''
        sortDirection.value = 'DESC'
        maxPrice.value = 300
        currentPage.value = 1
        await loadSets()
    }

    watch(search, () => {
        currentPage.value = 1
    })

    watch(currentPage, loadSets)

    onMounted(loadSets)
</script>

<template>
    <div class="shop-page">
        <div class="container page-content">
            <div class="shop-header mb-3">
                <div>
                    <h1 class="h2 fw-bold mb-1">Set Shop</h1>
                    <p class="text-secondary mb-0">Browse sealed Yu-Gi-Oh! sets and expand your collection.</p>
                </div>
            </div>

            <div class="shop-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3">
                <div class="input-group shop-search">
                    <span class="input-group-text">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input v-model="search" @keyup.enter="loadSets" type="text" class="form-control" placeholder="Search sets...">
                    <button class="btn btn-primary" @click="loadSets">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div class="filter-controls">
                    <div class="shop-filter">
                        <select v-model="sortDirection" class="form-select form-select-sm" @change="loadSets">
                            <option value="DESC">Newest first</option>
                            <option value="ASC">Oldest first</option>
                        </select>
                    </div>

                    <div class="price-filter">
                        <label class="form-label small text-secondary mb-1">Max price: {{ maxPrice }} EUR</label>
                        <input v-model.number="maxPrice" type="range" class="form-range" min="0" max="300" step="1" @change="loadSets">
                    </div>

                    <button class="btn btn-outline-secondary btn-sm reset-button" @click="resetFilters">
                        <i class="fa-solid fa-filter-circle-xmark"></i>
                        Reset
                    </button>
                </div>
            </div>

            <div class="row g-4" v-if="sets.length > 0">
                <div v-for="set in sets" :key="set.set_name" class="col-12 col-sm-6 col-lg-4 col-xxl-3">
                    <RouterLink
                        :to="`/set/${set.set_name}`"
                        class="set-card card h-100 text-decoration-none text-reset"
                    >
                        <div class="set-image-container">
                            <img
                                :src="getSetImage(set.set_code)"
                                class="set-image"
                                :alt="set.set_name"
                                @error="setFallbackImage"
                            >
                        </div>

                        <div class="card-body d-flex flex-column">
                            <h2 class="set-title">{{ set.set_name }}</h2>
                            <p class="set-date mb-3">{{ set.tcg_date }}</p>

                            <div class="set-meta mt-auto">
                                <span>
                                    <i class="fa-solid fa-layer-group"></i>
                                    {{ set.num_of_cards }} cards
                                </span>
                                <strong>{{ set.set_price }} EUR</strong>
                            </div>
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div v-else-if="loading" class="empty-state">
                <Loading />
            </div>

            <div v-else class="empty-state">
                <div class="text-center">
                    <i class="fa-solid fa-box-open empty-icon"></i>
                    <h4 class="fw-bold mb-1">No matching sets found</h4>
                    <p class="text-secondary mb-0">Try another set name or keyword.</p>
                </div>
            </div>

            <div class="pagination-controls mt-4" v-if="sets.length > 0">
                <button
                    class="btn btn-outline-primary btn-sm"
                    @click="previousPage"
                    :disabled="currentPage === 1"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                </button>

                <span class="small text-secondary">
                    Page {{ currentPage }}/{{ totalPages }} - {{ totalResults }} sets
                </span>

                <button
                    class="btn btn-outline-primary btn-sm"
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                >
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .shop-page {
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

    .shop-toolbar {
        background: #ffffff;
        border: 1px solid #dfe4ec;
        border-radius: 8px;
        box-shadow: 0 10px 24px rgba(18, 29, 43, 0.06);
    }

    .shop-search {
        flex: 1 1 320px;
        max-width: 520px;
    }

    .filter-controls {
        align-items: center;
        display: flex;
        flex: 1 1 520px;
        gap: 1rem;
        justify-content: flex-end;
    }

    .shop-filter {
        width: 150px;
    }

    .price-filter {
        flex: 0 1 240px;
    }

    .price-filter .form-range {
        display: block;
    }

    .reset-button {
        white-space: nowrap;
    }

    .pagination-controls {
        align-items: center;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .set-card {
        border: 1px solid #dfe4ec;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .set-card:hover {
        border-color: #0d6efd;
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);
        transform: translateY(-3px);
    }

    .set-image-container {
        align-items: center;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: center;
        min-height: 180px;
        padding: 1rem;
    }

    .set-image {
        max-height: 150px;
        max-width: 100%;
        object-fit: contain;
    }

    .set-title {
        color: #172033;
        display: -webkit-box;
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.25;
        margin: 0;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }

    .set-date {
        color: #64748b;
        font-size: 0.85rem;
        margin-top: 0.35rem;
    }

    .set-meta {
        align-items: end;
        display: flex;
        gap: 0.75rem;
        justify-content: space-between;
    }

    .set-meta span {
        color: #64748b;
        font-size: 0.82rem;
    }

    .set-meta strong {
        color: #0f172a;
        font-size: 1.15rem;
        white-space: nowrap;
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

        .shop-search,
        .filter-controls,
        .shop-filter,
        .price-filter,
        .reset-button {
            max-width: none;
            width: 100%;
        }

        .filter-controls {
            align-items: stretch;
            flex-direction: column;
        }
    }
</style>
