<script setup lang="ts">
import CardTooltip from '@/components/CardTooltip.vue';
import Loading from '@/components/Loading.vue';
import PaginationControls from '@/components/PaginationControls.vue';
import { getCardImage, setFallbackImage } from '@/helpers/image';
import { useCardSearch } from '@/hooks/cardSearch.hook';
import { usePagination } from '@/hooks/pagination.hook';
import { onMounted, watch } from 'vue';

const PAGE_SIZE = 30

const pagination = usePagination(PAGE_SIZE)

const {
    currentPage,
    totalResults,
    totalPages,
    nextPage,
    previousPage
} = pagination

const {
    cards,
    loading,
    search,
    selectedType,
    selectedArchetype,
    selectedRace,
    selectedAttribute,
    selectedLevel,
    selectedLinkval,
    selectedScale,
    selectedSortBy,
    selectedSortDirection,
    showAdvancedFilters,
    cardTypes,
    archetypes,
    races,
    attributes,
    levels,
    linkValues,
    scales,
    hasSelectedType,
    isMonster,
    isLink,
    isPendulum,
    isSimpleType,
    sortOptions,
    sortOptionLabel,
    loadCards,
    loadFilterOptions,
    loadRaces,
    applyFilters,
    resetFilters,
    resetTypeSpecificFilters
} = useCardSearch(pagination)

watch(selectedType, async () => {
    resetTypeSpecificFilters()
    showAdvancedFilters.value = false
    await loadRaces()
    await applyFilters()
})

watch(currentPage, loadCards)

onMounted(async () => {
    await loadFilterOptions()
    await loadCards()
})
</script>

<template>
    <div class="catalogue-page">
        <div class="catalogue-top-panel">
            <div class="container catalogue-top-content">
                <div class="catalogue-header">
                    <div>
                        <h1 class="h2 fw-bold mb-1">Card Catalogue</h1>
                        <p class="text-secondary mb-0">Search, preview, and open any card in the library.</p>
                    </div>
                </div>

                <div class="catalogue-toolbar">
                    <div class="input-group catalogue-search">
                        <span class="input-group-text">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input v-model="search" @keyup.enter="applyFilters" type="text" class="form-control" placeholder="Search cards...">
                        <button class="btn btn-primary" @click="applyFilters">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="filter-controls">
                        <label class="filter-field">
                            <span>Sort by</span>
                            <select v-model="selectedSortBy" class="form-select form-select-sm filter-select sort-select" @change="applyFilters">
                                <option value="">Default</option>
                                <option v-for="sortOption in sortOptions" :key="sortOption" :value="sortOption">{{ sortOptionLabel(sortOption) }}</option>
                            </select>
                        </label>

                        <label class="filter-field">
                            <select v-model="selectedSortDirection" class="form-select form-select-sm direction-select" :disabled="!selectedSortBy" @change="applyFilters">
                                <option value="DESC">DESC</option>
                                <option value="ASC">ASC</option>
                            </select>
                        </label>

                        <label class="filter-field">
                            <span>Archetype</span>
                            <select v-model="selectedArchetype" class="form-select form-select-sm filter-select" @change="applyFilters">
                                <option value="">All archetypes</option>
                                <option v-for="archetype in archetypes" :key="archetype" :value="archetype">{{ archetype }}</option>
                            </select>
                        </label>

                        <label class="filter-field">
                            <span>Type</span>
                            <select v-model="selectedType" class="form-select form-select-sm filter-select">
                                <option value="">All types</option>
                                <option v-for="type in cardTypes" :key="type" :value="type">{{ type }}</option>
                            </select>
                        </label>

                        <button
                            class="btn btn-outline-primary btn-sm text-nowrap"
                            :disabled="!hasSelectedType"
                            @click="showAdvancedFilters = !showAdvancedFilters"
                            aria-label="More filters"
                            title="More filters"
                        >
                            <i class="fa-solid fa-sliders"></i>
                            More filters
                        </button>

                        <button class="btn btn-outline-secondary btn-sm icon-filter-button" @click="resetFilters" aria-label="Reset filters" title="Reset filters">
                            <i class="fa-solid fa-filter-circle-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="container page-content">
            <div v-if="showAdvancedFilters && hasSelectedType" class="advanced-filters mb-3">
                <div class="advanced-filter-heading">
                    <span>Filters for</span>
                    <strong>{{ selectedType }}</strong>
                </div>

                <div class="advanced-filter-field">
                    <label class="form-label small text-secondary">Race</label>
                    <select v-model="selectedRace" class="form-select form-select-sm" @change="applyFilters">
                        <option value="">Any race</option>
                        <option v-for="race in races" :key="race" :value="race">{{ race }}</option>
                    </select>
                </div>

                <template v-if="isMonster">
                    <div class="advanced-filter-field">
                        <label class="form-label small text-secondary">Attribute</label>
                        <select v-model="selectedAttribute" class="form-select form-select-sm" @change="applyFilters">
                            <option value="">Any attribute</option>
                            <option v-for="attribute in attributes" :key="attribute" :value="attribute">{{ attribute }}</option>
                        </select>
                    </div>

                    <div v-if="!isLink" class="advanced-filter-field">
                        <label class="form-label small text-secondary">Level</label>
                        <select v-model="selectedLevel" class="form-select form-select-sm" @change="applyFilters">
                            <option value="">Any level</option>
                            <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
                        </select>
                    </div>

                    <div v-if="isLink" class="advanced-filter-field">
                        <label class="form-label small text-secondary">Link rating</label>
                        <select v-model="selectedLinkval" class="form-select form-select-sm" @change="applyFilters">
                            <option value="">Any link rating</option>
                            <option v-for="linkval in linkValues" :key="linkval" :value="linkval">{{ linkval }}</option>
                        </select>
                    </div>

                    <div v-if="isPendulum" class="advanced-filter-field">
                        <label class="form-label small text-secondary">Scale</label>
                        <select v-model="selectedScale" class="form-select form-select-sm" @change="applyFilters">
                            <option value="">Any scale</option>
                            <option v-for="scale in scales" :key="scale" :value="scale">{{ scale }}</option>
                        </select>
                    </div>
                </template>

                <p v-if="isSimpleType" class="advanced-note mb-0">
                    {{ selectedType }} 
                </p>
            </div>

            <div class="catalogue-results">
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

            <PaginationControls
                v-if="cards.length > 0"
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
    .catalogue-page {
        flex: 1;
        background: #f5f6f8;
    }

    .page-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding-bottom: 1.25rem;
    }

    .catalogue-header {
        align-items: end;
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .catalogue-top-panel {
        background: #ffffff;
        border-bottom: 1px solid #dfe4ec;
        box-shadow: 0 10px 24px rgba(18, 29, 43, 0.04);
        margin-bottom: 1.25rem;
    }

    .catalogue-top-content {
        padding-bottom: 1rem;
        padding-top: 2rem;
    }

    .catalogue-toolbar {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
    }

    .catalogue-search {
        flex: 1 1 230px;
        max-width: 360px;
    }

    .filter-controls {
        align-items: center;
        display: flex;
        flex: 1 1 760px;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: flex-end;
    }

    .filter-field {
        align-items: center;
        display: flex;
        gap: 0.4rem;
        margin: 0;
    }

    .filter-field span {
        color: #64748b;
        font-size: 0.82rem;
        font-weight: 600;
    }

    .filter-select {
        width: 140px;
    }

    .sort-select {
        width: 128px;
    }

    .direction-select {
        width: 88px;
    }

    .icon-filter-button {
        align-items: center;
        display: inline-flex;
        height: 31px;
        justify-content: center;
        padding: 0;
        width: 34px;
    }

    .advanced-filters {
        align-items: end;
        background: #ffffff;
        border: 1px solid #dfe4ec;
        border-radius: 8px;
        box-shadow: 0 10px 24px rgba(18, 29, 43, 0.04);
        display: flex;
        flex-wrap: wrap;
        gap: 0.85rem;
        justify-content: flex-end;
        margin-left: auto;
        margin-right: 0;
        width: fit-content;
        max-width: 100%;
        padding: 1rem;
    }

    .advanced-filter-heading {
        align-self: stretch;
        border-right: 1px solid #e5eaf2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 130px;
        padding-right: 1rem;
    }

    .advanced-filter-heading span {
        color: #64748b;
        font-size: 0.78rem;
        font-weight: 600;
    }

    .advanced-filter-heading strong {
        color: #111827;
        font-size: 0.92rem;
    }

    .advanced-filter-field {
        min-width: 150px;
    }

    .advanced-filter-field .form-label {
        font-weight: 600;
    }

    .advanced-note {
        color: #64748b;
        font-size: 0.85rem;
        padding-bottom: 0.35rem;
    }

    .catalogue-results {
        min-height: 545px;
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

        .catalogue-search,
        .filter-controls,
        .filter-field,
        .filter-select,
        .sort-select,
        .direction-select,
        .advanced-filter-field {
            max-width: none;
            width: 100%;
        }

        .icon-filter-button {
            flex: 1;
            width: auto;
        }

        .filter-field {
            align-items: flex-start;
            flex-direction: column;
        }

        .filter-controls {
            justify-content: stretch;
        }

        .advanced-filter-heading {
            border-bottom: 1px solid #e5eaf2;
            border-right: 0;
            flex: 1 1 100%;
            padding-bottom: 0.75rem;
            padding-right: 0;
            text-align: center;
        }

        .catalogue-results {
            min-height: 420px;
        }

        .catalogue-grid {
            grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
        }
    }
</style>
