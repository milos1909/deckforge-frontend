<script setup lang="ts">
import CardTooltip from '@/components/CardTooltip.vue'
import Loading from '@/components/Loading.vue'
import { formatDisplayDate } from '@/helpers/date'
import { getDeckTotalPrice, getMainDeckTypeCounts, sortDeckCardModels } from '@/helpers/deck'
import { getCardImage, getCroppedCardImage, setFallbackImage } from '@/helpers/image'
import { useAuth } from '@/hooks/auth.hook'
import { DECK_TYPE_LABELS, type DeckCardModel, type DeckModel, type DeckType, type DeckZone } from '@/models/deck.model'
import { DeckService } from '@/services/deck.service'
import { InvoiceService } from '@/services/invoice.service'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { auth } = useAuth()

const deck = ref<DeckModel | null>(null)
const canEdit = ref(false)
const loading = ref(true)
const loadError = ref(false)
const editingMetadata = ref(false)
const savingMetadata = ref(false)
const copyingDeck = ref(false)
const buyingDeck = ref(false)
const saveError = ref('')

const nameInput = ref('')
const descriptionInput = ref('')
const coverCardIdInput = ref<number | null>(null)
const isPublicInput = ref(false)
const deckTypeInput = ref<DeckType>('casual')

const mainDeck = computed(() => cardsInZone('main'))
const extraDeck = computed(() => cardsInZone('extra'))
const sideDeck = computed(() => cardsInZone('side'))
const allDeckCards = computed(() => (deck.value?.deckCards ?? []).map(deckCard => deckCard.card))
const deckTotalPrice = computed(() => getDeckTotalPrice(allDeckCards.value))
const mainDeckTypeCounts = computed(() => getMainDeckTypeCounts(mainDeck.value.map(deckCard => deckCard.card)))

const coverOptions = computed(() => {
    const uniqueCards = new Map<number, DeckCardModel['card']>()

    for (const deckCard of deck.value?.deckCards ?? []) {
        uniqueCards.set(deckCard.card.id, deckCard.card)
    }

    return [...uniqueCards.values()].sort((a, b) => a.name.localeCompare(b.name))
})

function cardsInZone(zone: DeckZone) {
    return (deck.value?.deckCards ?? []).filter(deckCard => deckCard.type === zone)
}

function formatViews(value: number) {
    return `${value.toLocaleString()} ${value === 1 ? 'view' : 'views'}`
}

function formatDeckPrice(value: number) {
    return value.toFixed(2)
}

function hideBrokenCover(event: Event) {
    const image = event.target as HTMLImageElement
    image.style.display = 'none'
}

function beginMetadataEdit() {
    if (!deck.value) return

    nameInput.value = deck.value.name
    descriptionInput.value = deck.value.description ?? ''
    coverCardIdInput.value = deck.value.coverCardId
    isPublicInput.value = Boolean(deck.value.isPublic)
    deckTypeInput.value = deck.value.type
    saveError.value = ''
    editingMetadata.value = true
}

function cancelMetadataEdit() {
    editingMetadata.value = false
    saveError.value = ''
}

async function loadDeck() {
    const id = Number(route.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        loadError.value = true
        loading.value = false
        return
    }

    loading.value = true
    loadError.value = false

    try {
        const rsp = await DeckService.getDeckById(id)
        const loadedDeck = rsp.data.deck
        loadedDeck.deckCards = sortDeckCardModels(loadedDeck.deckCards)
        deck.value = loadedDeck
        canEdit.value = rsp.data.canEdit
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

async function saveMetadata() {
    if (!deck.value || !canEdit.value) return

    const name = nameInput.value.trim()

    if (!name) {
        saveError.value = 'Deck name cannot be empty.'
        return
    }

    savingMetadata.value = true
    saveError.value = ''

    try {
        await DeckService.updateMetadata(deck.value.id, {
            name,
            description: descriptionInput.value.trim() || null,
            coverCardId: coverCardIdInput.value,
            isPublic: isPublicInput.value,
            type: deckTypeInput.value
        })

        await loadDeck()
        editingMetadata.value = false
    } catch {
        saveError.value = 'Deck details could not be saved.'
    } finally {
        savingMetadata.value = false
    }
}

async function copyDeck() {
    if (!deck.value) return

    if (!auth.value) {
        alert('You must be logged in to copy decks.')
        return
    }

    copyingDeck.value = true

    try {
        const rsp = await DeckService.copyDeck(deck.value.id)
        await router.push(`/deck/${rsp.data.id}`)
    } catch {
        alert('Deck could not be copied.')
    } finally {
        copyingDeck.value = false
    }
}

async function buyDeck() {
    if (!deck.value) return

    if (!auth.value) {
        alert('You must be logged in to buy decks.')
        return
    }

    buyingDeck.value = true

    try {
        await InvoiceService.addDeckToCart(deck.value.id)
        alert('Deck added to cart.')
    } catch {
        alert('Deck could not be added to cart.')
    } finally {
        buyingDeck.value = false
    }
}

onMounted(loadDeck)

watch(() => route.params.id, loadDeck)
</script>

<template>
    <div class="deck-details-page">
        <div v-if="loading" class="page-state">
            <Loading />
        </div>

        <div v-else-if="loadError || !deck" class="page-state">
            <div class="text-center">
                <i class="fa-solid fa-layer-group state-icon"></i>
                <h1 class="h4 fw-bold mb-1">Deck not found</h1>
                <p class="text-secondary mb-0">This deck is private or no longer exists.</p>
            </div>
        </div>

        <template v-else>
            <section class="deck-overview">
                <img
                    v-if="deck.coverCardId"
                    :src="getCroppedCardImage(deck.coverCardId)"
                    :alt="`${deck.name} cover`"
                    class="overview-cover"
                    @error="hideBrokenCover"
                >
                <div class="overview-shade"></div>

                <div class="container overview-content">
                    <div class="deck-identity">
                        <span class="deck-type-badge" :class="`deck-type-${deck.type}`">
                            {{ DECK_TYPE_LABELS[deck.type] }}
                        </span>
                        <h1>{{ deck.name }}</h1>
                        <p class="deck-owner">
                            <i class="fa-solid fa-user"></i>
                            {{ deck.user.username }}
                        </p>
                        <p class="deck-description">
                            {{ deck.description || 'No description has been added yet.' }}
                        </p>

                        <div class="deck-summary">
                            <span><i class="fa-solid fa-cart-shopping"></i> {{ formatDeckPrice(deckTotalPrice) }} €</span>
                            <span><i class="fa-solid fa-eye"></i> {{ formatViews(deck.viewCount) }}</span>
                            <span>Updated {{ formatDisplayDate(deck.updatedAt || deck.createdAt, 'Not available') }}</span>
                        </div>

                        <div class="overview-actions">
                            <button class="btn btn-success btn-sm" type="button" :disabled="buyingDeck" @click="buyDeck">
                                <span v-if="buyingDeck" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <i v-else class="fa-solid fa-cart-shopping"></i>
                                Buy deck
                            </button>

                            <button class="btn btn-primary btn-sm" type="button" :disabled="copyingDeck" @click="copyDeck">
                                <span v-if="copyingDeck" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <i v-else class="fa-solid fa-copy"></i>
                                Copy deck
                            </button>

                            <RouterLink
                                v-if="canEdit"
                                class="btn btn-outline-light btn-sm"
                                :to="`/deckbuilder/${deck.id}`"
                            >
                                <i class="fa-solid fa-layer-group"></i>
                                Edit cards
                            </RouterLink>

                            <button
                                v-if="canEdit"
                                class="btn btn-light btn-sm overview-edit-button"
                                type="button"
                                @click="editingMetadata ? cancelMetadataEdit() : beginMetadataEdit()"
                            >
                                <i :class="editingMetadata ? 'fa-solid fa-eye-slash' : 'fa-solid fa-pen'"></i>
                                {{ editingMetadata ? 'Hide details' : 'Edit details' }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <main class="container deck-content">
                <section v-if="editingMetadata && canEdit" class="metadata-editor">
                    <div class="metadata-heading">
                        <div>
                            <p class="section-label mb-1">Owner controls</p>
                            <h2 class="h5 fw-bold mb-0">Edit deck details</h2>
                        </div>
                    </div>

                    <div class="metadata-grid">
                        <div class="description-field">
                            <label for="deck-description" class="form-label">Description</label>
                            <textarea
                                id="deck-description"
                                v-model="descriptionInput"
                                class="form-control"
                                rows="4"
                                maxlength="1000"
                                placeholder="Describe the strategy, key cards, or intended format..."
                            ></textarea>
                            <span class="field-count">{{ descriptionInput.length }}/1000</span>
                        </div>

                        <div class="metadata-side-fields">
                            <div>
                                <label for="deck-name" class="form-label">Deck name</label>
                                <input
                                    id="deck-name"
                                    v-model="nameInput"
                                    class="form-control"
                                    type="text"
                                    maxlength="60"
                                >
                            </div>

                            <div>
                                <label for="deck-type" class="form-label">Deck type</label>
                                <select id="deck-type" v-model="deckTypeInput" class="form-select">
                                    <option value="meta">Meta Deck</option>
                                    <option value="rogue">Rogue Deck</option>
                                    <option value="casual">Casual Deck</option>
                                    <option value="anime">Anime Deck</option>
                                </select>
                            </div>

                            <div>
                                <label for="deck-cover" class="form-label">Cover card</label>
                                <select id="deck-cover" v-model="coverCardIdInput" class="form-select">
                                    <option :value="null">No cover</option>
                                    <option v-for="card in coverOptions" :key="card.id" :value="card.id">
                                        {{ card.name }}
                                    </option>
                                </select>
                            </div>

                            <div class="visibility-control">
                                <div>
                                    <strong>Public deck</strong>
                                    <span>Allow other users to view this deck.</span>
                                </div>
                                <div class="form-check form-switch mb-0">
                                    <input v-model="isPublicInput" class="form-check-input" type="checkbox" role="switch" aria-label="Public deck">
                                </div>
                            </div>
                        </div>
                    </div>

                    <p v-if="saveError" class="text-danger small mb-0">{{ saveError }}</p>

                    <div class="metadata-actions">
                        <button class="btn btn-outline-secondary btn-sm" type="button" :disabled="savingMetadata" @click="cancelMetadataEdit">Cancel</button>
                        <button class="btn btn-primary btn-sm" type="button" :disabled="savingMetadata" @click="saveMetadata">
                            <span v-if="savingMetadata" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                            <i v-else class="fa-solid fa-floppy-disk"></i>
                            Save details
                        </button>
                    </div>
                </section>

                <section class="deck-zone main-zone">
                    <div class="zone-header">
                        <div class="zone-title-group">
                            <h2>Main Deck</h2>
                            <div class="main-type-counts">
                                <span class="type-swatch type-swatch-monster"></span>
                                <span>{{ mainDeckTypeCounts.monsters }}</span>
                                <span class="type-swatch type-swatch-spell"></span>
                                <span>{{ mainDeckTypeCounts.spells }}</span>
                                <span class="type-swatch type-swatch-trap"></span>
                                <span>{{ mainDeckTypeCounts.traps }}</span>
                            </div>
                        </div>
                        <span :class="{ 'deck-count-invalid': mainDeck.length < 40 }">{{ mainDeck.length }}/60</span>
                    </div>
                    <div v-if="mainDeck.length" class="deck-card-grid">
                        <CardTooltip v-for="deckCard in mainDeck" :key="deckCard.id" :card="deckCard.card">
                            <RouterLink :to="`/card/${deckCard.card.id}`" class="deck-card-link">
                                <img :src="getCardImage(deckCard.card.id)" :alt="deckCard.card.name" @error="setFallbackImage">
                            </RouterLink>
                        </CardTooltip>
                    </div>
                    <div v-else class="empty-zone"></div>
                </section>

                <section class="deck-zone extra-zone">
                    <div class="zone-header">
                        <h2>Extra Deck</h2>
                        <span>{{ extraDeck.length }}/15</span>
                    </div>
                    <div v-if="extraDeck.length" class="deck-card-grid">
                        <CardTooltip v-for="deckCard in extraDeck" :key="deckCard.id" :card="deckCard.card">
                            <RouterLink :to="`/card/${deckCard.card.id}`" class="deck-card-link">
                                <img :src="getCardImage(deckCard.card.id)" :alt="deckCard.card.name" @error="setFallbackImage">
                            </RouterLink>
                        </CardTooltip>
                    </div>
                    <div v-else class="empty-zone"></div>
                </section>

                <section class="deck-zone side-zone">
                    <div class="zone-header">
                        <h2>Side Deck</h2>
                        <span>{{ sideDeck.length }}/15</span>
                    </div>
                    <div v-if="sideDeck.length" class="deck-card-grid">
                        <CardTooltip v-for="deckCard in sideDeck" :key="deckCard.id" :card="deckCard.card">
                            <RouterLink :to="`/card/${deckCard.card.id}`" class="deck-card-link">
                                <img :src="getCardImage(deckCard.card.id)" :alt="deckCard.card.name" @error="setFallbackImage">
                            </RouterLink>
                        </CardTooltip>
                    </div>
                    <div v-else class="empty-zone"></div>
                </section>
            </main>
        </template>
    </div>
</template>

<style scoped>
.deck-details-page {
    background: #f5f6f8;
    flex: 1;
}

.page-state {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 560px;
}

.state-icon {
    color: #64748b;
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.deck-overview {
    background: #070b14;
    color: #ffffff;
    min-height: 360px;
    overflow: hidden;
    position: relative;
}

.overview-cover {
    height: 100%;
    mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 16%, rgba(0, 0, 0, 0.72) 34%, #000000 52%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 16%, rgba(0, 0, 0, 0.72) 34%, #000000 52%);
    object-fit: cover;
    object-position: center 30%;
    opacity: 0.95;
    position: absolute;
    right: 0;
    top: 0;
    width: 52%;
}

.overview-shade {
    background:
        linear-gradient(90deg, #070b14 0%, #070b14 45%, rgba(7, 11, 20, 0.78) 62%, rgba(7, 11, 20, 0.24) 100%);
    inset: 0;
    position: absolute;
}

.overview-content {
    align-items: center;
    display: flex;
    gap: 2rem;
    justify-content: space-between;
    min-height: 360px;
    padding-bottom: 2.5rem;
    padding-top: 2.5rem;
    position: relative;
    z-index: 1;
}

.deck-identity {
    max-width: 720px;
}

.overview-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 1.25rem;
}

.deck-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.deck-type-badge {
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
    color: #ffffff;
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.35rem 0.55rem;
}

.deck-type-meta {
    background: #9f1239;
}

.deck-type-rogue {
    background: #0f766e;
}

.deck-type-casual {
    background: #475569;
}

.deck-type-anime {
    background: #6d28d9;
}

.deck-identity h1 {
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: 0;
    margin: 0.7rem 0 0.35rem;
    overflow-wrap: anywhere;
}

.deck-owner {
    align-items: center;
    color: #d8dee8;
    display: flex;
    font-size: 0.9rem;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

.deck-description {
    color: #eef2f7;
    line-height: 1.55;
    margin-bottom: 1.15rem;
    max-width: 680px;
    white-space: pre-line;
}

.deck-summary span {
    border-left: 1px solid rgba(255, 255, 255, 0.35);
    color: #d8dee8;
    font-size: 0.8rem;
    padding-left: 0.65rem;
}

.deck-summary span:first-child {
    border-left: 0;
    padding-left: 0;
}

.overview-edit-button {
    flex: 0 0 auto;
}

.deck-content {
    padding-bottom: 3rem;
    padding-top: 2rem;
}

.metadata-editor {
    background: #ffffff;
    border: 1px solid #dfe4ec;
    border-radius: 8px;
    margin-bottom: 2rem;
    padding: 1.25rem;
}

.metadata-heading,
.metadata-actions,
.visibility-control {
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.metadata-heading {
    margin-bottom: 1.15rem;
}

.metadata-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
}

.form-label {
    font-size: 0.85rem;
    font-weight: 700;
}

.description-field {
    position: relative;
}

.field-count {
    bottom: 0.5rem;
    color: #64748b;
    font-size: 0.72rem;
    position: absolute;
    right: 0.65rem;
}

.metadata-side-fields {
    display: grid;
    gap: 1rem;
}

.visibility-control {
    border-top: 1px solid #dfe4ec;
    gap: 1rem;
    padding-top: 1rem;
}

.visibility-control div:first-child {
    display: grid;
    gap: 0.2rem;
}

.visibility-control span {
    color: #64748b;
    font-size: 0.78rem;
}

.metadata-actions {
    border-top: 1px solid #dfe4ec;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1.15rem;
    padding-top: 1rem;
}

.section-label {
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
}

.deck-zone {
    background: #ffffff;
    border: 1px solid #dfe4ec;
    overflow: hidden;
}

.deck-zone + .deck-zone {
    margin-top: 1.25rem;
}

.zone-header {
    align-items: center;
    background: #212529;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 1rem;
}

.zone-header h2 {
    font-size: 1rem;
    font-weight: 800;
    margin: 0;
}

.zone-title-group {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.main-type-counts {
    align-items: center;
    color: #cbd5e1;
    display: flex;
    flex-wrap: wrap;
    font-weight: 700;
    gap: 0.25rem;
}

.type-swatch {
    display: inline-block;
    height: 10px;
    width: 10px;
}

.type-swatch-monster {
    background: #c56a2c;
}

.type-swatch-spell {
    background: #138b78;
}

.type-swatch-trap {
    background: #b8328a;
}

.zone-header > span {
    color: #cbd5e1;
    font-size: 0.85rem;
    font-weight: 700;
}

.zone-header > .deck-count-invalid {
    color: #ff6b6b;
}

.extra-zone {
    background: #ede9fe;
}

.extra-zone .zone-header {
    background: #4c1d95;
}

.side-zone {
    background: #ffedd5;
}

.side-zone .zone-header {
    background: #7c2d12;
}

.deck-card-grid {
    display: grid;
    gap: 0.65rem;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    padding: 1rem;
}

.deck-card-link {
    display: block;
}

.deck-card-link img {
    aspect-ratio: 0.6875;
    border-radius: 4px;
    display: block;
    object-fit: cover;
    transition: box-shadow 0.18s, transform 0.18s;
    width: 100%;
}

.deck-card-link:hover img {
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.24);
    transform: translateY(-3px);
}

.empty-zone {
    display: grid;
    gap: 0.65rem;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    padding: 1rem;
}

.empty-zone::before {
    aspect-ratio: 0.6875;
    content: "";
}

@media (max-width: 767.98px) {
    .deck-identity h1 {
        font-size: 2rem;
    }

    .overview-content {
        align-items: flex-start;
        flex-direction: column;
        gap: 1.5rem;
    }

    .overview-cover {
        opacity: 0.35;
        width: 100%;
    }

    .metadata-grid {
        grid-template-columns: 1fr;
    }

    .deck-card-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    }

    .empty-zone {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    }
}
</style>
