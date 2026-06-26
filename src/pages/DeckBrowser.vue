<script setup lang="ts">
import DeckPreviewCard from '@/components/DeckPreviewCard.vue'
import Loading from '@/components/Loading.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { usePagination } from '@/hooks/pagination.hook'
import type { DeckSummaryModel } from '@/models/deck.model'
import { DeckService } from '@/services/deck.service'
import { onMounted, ref, watch } from 'vue'

const decks = ref<DeckSummaryModel[]>([])
const loading = ref(false)

const search = ref('')
const sortBy = ref<'createdAt' | 'viewCount'>('createdAt')

const PAGE_SIZE = 12

const {
    offset,
    currentPage,
    totalResults,
    totalPages,
    nextPage,
    previousPage
} = usePagination(PAGE_SIZE)

async function loadDecks() {
    loading.value = true

    try {
        const rsp = await DeckService.getDecks(search.value, sortBy.value, PAGE_SIZE, offset.value)

        decks.value = rsp.data.decks
        totalResults.value = rsp.data.count
    } finally {
        loading.value = false
    }
}

async function submitSearch() {
    if (currentPage.value !== 1) {
        currentPage.value = 1
        return
    }

    await loadDecks()
}

watch(currentPage, loadDecks)
watch(sortBy, submitSearch)

onMounted(loadDecks)
</script>

<template>
    <div class="deck-browser-page">
        <div class="browser-top-panel">
            <div class="container browser-top-content">
                <div class="browser-header mb-3">
                    <div>
                        <h1 class="h2 fw-bold mb-1">Browse Decks</h1>
                        <p class="text-secondary mb-0">Find public deck lists from the community.</p>
                    </div>
                </div>

                <div class="browser-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="input-group browser-search">
                        <span class="input-group-text">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input
                            v-model="search"
                            @keyup.enter="submitSearch"
                            type="text"
                            class="form-control"
                            placeholder="Search decks..."
                        >
                        <button class="btn btn-primary" @click="submitSearch">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="filter-controls">
                        <div class="sort-filter">
                            <span class="filter-label">Sort by</span>
                            <select v-model="sortBy" class="form-select form-select-sm">
                                <option value="createdAt">Newest</option>
                                <option value="viewCount">Most viewed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container page-content">
            <div v-if="loading" class="deck-state">
                <Loading />
            </div>

            <template v-else>
                <div v-if="decks.length" class="deck-grid">
                    <DeckPreviewCard
                        v-for="deck in decks"
                        :key="deck.id"
                        :deck="deck"
                        date-label="Created"
                        :date-value="deck.createdAt"
                        show-description
                    />
                </div>

                <div v-else class="deck-state">
                    <div class="text-center">
                        <i class="fa-solid fa-layer-group empty-icon"></i>
                        <h2 class="h4 fw-bold mb-1">No decks found</h2>
                        <p class="text-secondary mb-0">Try another deck name or clear the search.</p>
                    </div>
                </div>
            </template>

            <PaginationControls
                v-if="decks.length > 0"
                class="mt-4"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-results="totalResults"
                @previous="previousPage"
                @next="nextPage"
            />
        </div>
    </div>
</template>

<style scoped>
.deck-browser-page {
    background: #f5f6f8;
    flex: 1;
}

.page-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-bottom: 2.25rem;
}

.browser-top-panel {
    background: #ffffff;
    border-bottom: 1px solid #dfe4ec;
    box-shadow: 0 10px 24px rgba(18, 29, 43, 0.04);
    margin-bottom: 1.5rem;
}

.browser-top-content {
    padding-top: 2rem;
    padding-bottom: 1rem;
}

.browser-toolbar {
}

.browser-search {
    flex: 1 1 420px;
    max-width: 620px;
}

.filter-controls {
    align-items: center;
    display: flex;
    flex: 1 1 300px;
    gap: 0.75rem;
    justify-content: flex-end;
}

.sort-filter {
    align-items: center;
    display: flex;
    gap: 0.5rem;
}

.filter-label {
    color: #526173;
    font-size: 0.85rem;
    white-space: nowrap;
}

.sort-filter .form-select {
    width: 150px;
}

.deck-grid {
    display: grid;
    column-gap: 0.75rem;
    row-gap: 1rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.deck-state {
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    min-height: 380px;
}

.empty-icon {
    color: #94a3b8;
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

@media (max-width: 1199.98px) {
    .deck-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 991.98px) {
    .deck-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 575.98px) {
    .page-content {
        padding-top: 1.25rem;
    }

    .browser-search,
    .filter-controls,
    .sort-filter,
    .sort-filter .form-select {
        max-width: none;
        width: 100%;
    }

    .filter-controls,
    .sort-filter {
        align-items: stretch;
        flex-direction: column;
    }

    .deck-grid {
        grid-template-columns: 1fr;
    }

}
</style>
