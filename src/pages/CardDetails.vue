<script setup lang="ts">
import DeckPreviewCard from '@/components/DeckPreviewCard.vue'
import Loading from '@/components/Loading.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { formatCardStatValue, getCardStatIcon } from '@/helpers/card'
import { getCardImage, getSetImage, setFallbackImage } from '@/helpers/image'
import { usePagination } from '@/hooks/pagination.hook'
import type { CardModel } from '@/models/card.model'
import type { DeckSummaryModel } from '@/models/deck.model'
import type { SetModel } from '@/models/set.model'
import { CardService } from '@/services/card.service'
import { InvoiceService } from '@/services/invoice.service'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const card = ref<CardModel>()
const featuredDecks = ref<DeckSummaryModel[]>([])
const sets = ref<SetModel[]>([])
const loading = ref(false)
const setsLoading = ref(false)
const addingToCart = ref(false)

const SET_PAGE_SIZE = 4
const setPagination = usePagination(SET_PAGE_SIZE)

const cardId = computed(() => Number(route.params.id))

const cardPrice = computed(() => Number(card.value?.cardmarketPrice ?? 0))
const canBuyCard = computed(() => cardPrice.value > 0)

function formatPrice(value: number) {
    return `${value.toFixed(2)} EUR`
}

const statRows = computed(() => {
    if (!card.value) return []

    const isLinkMonster = card.value.type.includes('Link')

    return [
        { label: 'Type', value: card.value.type },
        { label: 'Typing', value: card.value.race },
        { label: 'Attribute', value: card.value.attribute },
        { label: 'Archetype', value: card.value.archetype },
        { label: 'Level/Rank', value: isLinkMonster ? undefined : card.value.level },
        { label: 'Scale', value: card.value.scale },
        { label: 'Link Rating', value: card.value.linkval },
        { label: 'ATK', value: card.value.atk },
        { label: 'DEF', value: isLinkMonster ? undefined : card.value.def }
    ].filter(row => row.value !== undefined && row.value !== null && row.value !== '')
        .map(row => ({
            ...row,
            icon: getCardStatIcon(row.label, row.value),
            value: formatCardStatValue(row.label, row.value)
        }))
})

function hideBrokenStatIcon(event: Event) {
    const image = event.target as HTMLImageElement
    image.style.display = 'none'
}

const primaryStats = computed(() => statRows.value.slice(0, 9))

function setDetailsRoute(setName: string) {
    return `/set/${encodeURIComponent(setName)}`
}

async function addCardToCart() {
    if (!card.value || !canBuyCard.value) return

    addingToCart.value = true

    try {
        await InvoiceService.addCardToCart(card.value.id)
        alert('Card added to cart.')
    } catch (e) {
        alert('You must be logged in to add cards to cart.')
    } finally {
        addingToCart.value = false
    }
}

async function loadCard() {
    loading.value = true

    try {
        const [cardRsp, decksRsp] = await Promise.all([
            CardService.getCardById(cardId.value),
            CardService.getDecksByCard(cardId.value, 3)
        ])

        card.value = cardRsp.data
        featuredDecks.value = decksRsp.data.decks ?? []
        setPagination.currentPage.value = 1
        await loadSets()
    } finally {
        loading.value = false
    }
}

async function loadSets() {
    setsLoading.value = true

    try {
        const rsp = await CardService.getSetsByCard(cardId.value, setPagination.pageSize, setPagination.offset.value)

        sets.value = rsp.data.sets ?? []
        setPagination.totalResults.value = rsp.data.total ?? rsp.data.count ?? sets.value.length
    } finally {
        setsLoading.value = false
    }
}

watch(() => route.params.id, loadCard)
watch(setPagination.currentPage, loadSets)

onMounted(loadCard)
</script>

<template>
    <div class="card-details-page">
        <Loading v-if="loading" />

        <div v-else-if="card" class="container page-content">
            <section class="card-hero row g-4 align-items-start mb-4">
                <div class="card-art-panel col-12 col-lg-4">
                    <img
                        :src="getCardImage(card.id)"
                        :alt="card.name"
                        class="card-art img-fluid"
                        @error="setFallbackImage"
                    >
                </div>

                <div class="card-info-panel col-12 col-lg-8">
                    <div class="card-title-row">
                        <div class="card-title-copy">
                            <span class="card-kicker">Yu-Gi-Oh! Card</span>
                            <h1>{{ card.name }}</h1>
                            <p class="card-type mb-4">{{ card.type }}</p>
                        </div>

                        <div class="single-purchase">
                            <span v-if="canBuyCard" class="single-price">
                                {{ formatPrice(cardPrice) }}
                            </span>
                            <span v-else class="single-price unavailable">
                                Price unavailable
                            </span>

                            <button
                                class="btn btn-success btn-sm single-cart-button"
                                :disabled="!canBuyCard || addingToCart"
                                title="Add card to cart"
                                @click="addCardToCart"
                            >
                                <i class="fa-solid fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div class="stat-grid">
                        <div v-for="row in primaryStats" :key="row.label" class="stat-tile">
                            <span>{{ row.label }}</span>
                            <strong class="stat-value">
                                <img
                                    v-if="row.icon"
                                    :src="row.icon"
                                    :alt="String(row.value)"
                                    class="stat-icon"
                                    @error="hideBrokenStatIcon"
                                >
                                {{ row.value }}
                            </strong>
                        </div>
                    </div>

                    <div class="card-description">
                        <h2>Card Text</h2>
                        <p>{{ card.description }}</p>
                    </div>
                </div>
            </section>

            <section class="content-section mb-4">
                <div class="section-header">
                    <div>
                        <h2>Decks Featuring This Card</h2>
                    </div>
                </div>

                <div v-if="featuredDecks.length > 0" class="row g-3 justify-content-center">
                    <div v-for="deck in featuredDecks" :key="deck.id" class="col-12 col-lg-4">
                        <DeckPreviewCard :deck="deck" date-label="Updated" />
                    </div>
                </div>

                <div v-else class="empty-panel">
                    <div class="text-center">
                        <i class="fa-solid fa-layer-group empty-icon"></i>
                        <p class="empty-text mb-0">No matching decks found</p>
                    </div>
                </div>
            </section>

            <section class="content-section section-divider">
                <div class="section-header">
                    <div>
                        <h2>Included In Sets</h2>
                    </div>
                </div>

                <div v-if="setsLoading" class="sets-loading">
                    <Loading />
                </div>

                <div v-else-if="sets.length > 0" class="row g-3 justify-content-center">
                    <div v-for="set in sets" :key="set.setName" class="col-12 col-sm-6 col-xl-3">
                        <RouterLink
                            :to="setDetailsRoute(set.setName)"
                            class="set-card h-100"
                        >
                            <div class="set-image-wrap">
                                <img
                                    :src="getSetImage(set.setCode)"
                                    :alt="set.setName"
                                    class="set-image"
                                    @error="setFallbackImage"
                                >
                            </div>

                            <div class="set-card-body">
                                <h3>{{ set.setName }}</h3>
                                <span>{{ set.setCode }}</span>
                            </div>
                        </RouterLink>
                    </div>
                </div>

                <div v-else class="empty-panel">
                    <div class="text-center">
                        <i class="fa-solid fa-box-open empty-icon"></i>
                        <p class="empty-text mb-0">No matching sets found</p>
                    </div>
                </div>

                <PaginationControls
                    v-if="sets.length > 0"
                    class="mt-4"
                    :current-page="setPagination.currentPage.value"
                    :total-pages="setPagination.totalPages.value"
                    :total-results="setPagination.totalResults.value"
                    @previous="setPagination.previousPage"
                    @next="setPagination.nextPage"
                />
            </section>
        </div>

        <div v-else class="container page-content">
            <div class="empty-panel page-empty">
                <div class="text-center">
                    <i class="fa-solid fa-circle-exclamation empty-icon"></i>
                    <h2 class="h4 fw-bold mb-1">Card could not be loaded</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-details-page {
    background: #f5f6f8;
    flex: 1;
}

.page-content {
    padding-bottom: 2.5rem;
    padding-top: 2rem;
}

.card-hero {
    border-bottom: 1px solid #d8dee8;
    padding-bottom: 1.75rem;
}

.card-art-panel {
    align-items: center;
    display: flex;
    justify-content: center;
}

.card-art {
    border-radius: 6px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.16);
    max-height: 480px;
    max-width: 100%;
    object-fit: contain;
}

.card-info-panel {
    padding: 0.25rem 0 0;
}

.card-title-row {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
}

.card-title-copy {
    min-width: 0;
}

.card-kicker {
    color: #64748b;
    display: block;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0;
    margin-bottom: 0.35rem;
    text-transform: uppercase;
}

.card-info-panel h1 {
    color: #172033;
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1.08;
    margin-bottom: 0.5rem;
    overflow-wrap: anywhere;
}

.card-type {
    color: #475569;
    font-size: 1rem;
    font-weight: 600;
}

.single-purchase {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: 0.55rem;
    padding-top: 0.2rem;
}

.single-price {
    color: #172033;
    font-size: 0.95rem;
    font-weight: 800;
    white-space: nowrap;
}

.single-price.unavailable {
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 600;
}

.single-cart-button {
    align-items: center;
    display: inline-flex;
    height: 34px;
    justify-content: center;
    width: 38px;
}

.stat-grid {
    display: grid;
    gap: 0.65rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 1.35rem;
}

.stat-tile {
    background: #ffffff;
    border: 1px solid #d8dee8;
    border-radius: 6px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
    color: #172033;
    min-height: 64px;
    padding: 0.65rem 0.75rem;
}

.stat-tile span {
    color: #526173;
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0.28rem;
}

.stat-tile strong {
    color: #172033;
    align-items: center;
    display: inline-flex;
    gap: 0.35rem;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.25;
    overflow-wrap: anywhere;
}

.stat-icon {
    flex: 0 0 auto;
    height: 18px;
    object-fit: contain;
    width: 18px;
}

.card-description {
    border-top: 1px solid #d8dee8;
    padding-top: 1rem;
}

.content-section {
    padding: 1.5rem 0;
}

.card-description h2,
.section-header h2 {
    color: #172033;
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
}

.card-description p {
    color: #334155;
    line-height: 1.7;
    margin-bottom: 0;
    white-space: pre-line;
}

.section-divider {
    border-top: 1px solid #d8dee8;
}

.section-header {
    align-items: center;
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    text-align: center;
}

.section-header h2 {
    text-align: center;
}

.section-header p {
    color: #64748b;
    margin-bottom: 0;
}

.empty-text {
    color: #64748b;
}

.set-card {
    background: #ffffff;
    border: 1px solid #dfe4ec;
    border-radius: 8px;
    color: #172033;
    display: block;
    overflow: hidden;
    text-decoration: none;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}

.set-card:hover {
    border-color: #0d6efd;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    transform: translateY(-2px);
}

.set-image-wrap {
    align-items: center;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
    min-height: 150px;
    padding: 1rem;
}

.set-image {
    max-height: 125px;
    max-width: 100%;
    object-fit: contain;
}

.set-card-body {
    padding: 0.9rem;
}

.set-card-body h3 {
    display: -webkit-box;
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 0.35rem;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.set-card-body span {
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 700;
}

.empty-panel {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 130px;
    padding: 1rem;
}

.empty-icon {
    color: #94a3b8;
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.page-empty {
    min-height: 300px;
}

.sets-loading {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 180px;
}

@media (max-width: 575.98px) {
    .page-content {
        padding-top: 1.25rem;
    }

    .card-info-panel {
        padding: 1.25rem;
    }

    .card-info-panel h1 {
        font-size: 1.8rem;
    }

    .card-title-row {
        flex-direction: column;
        gap: 0.4rem;
    }

    .single-purchase {
        padding-top: 0;
    }

    .stat-grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 576px) and (max-width: 991.98px) {
    .stat-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
