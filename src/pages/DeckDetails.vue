<script setup lang="ts">
import CardTooltip from '@/components/CardTooltip.vue'
import Loading from '@/components/Loading.vue'
import { getCardImage, getCroppedCardImage, setFallbackImage } from '@/helpers/image'
import { DECK_TYPE_LABELS, type DeckCardModel, type DeckModel, type DeckType, type DeckZone } from '@/models/deck.model'
import { DeckService } from '@/services/deck.service'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const deck = ref<DeckModel | null>(null)
const canEdit = ref(false)
const loading = ref(true)
const loadError = ref(false)
const editingMetadata = ref(false)
const savingMetadata = ref(false)
const saveError = ref('')

const nameInput = ref('')
const descriptionInput = ref('')
const coverCardIdInput = ref<number | null>(null)
const isPublicInput = ref(false)
const deckTypeInput = ref<DeckType>('casual')

const mainDeck = computed(() => cardsInZone('main'))
const extraDeck = computed(() => cardsInZone('extra'))
const sideDeck = computed(() => cardsInZone('side'))

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

function formatDate(value: string | null) {
    if (!value) return 'Not available'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(value))
}

function formatViews(value: number) {
    return `${value.toLocaleString()} ${value === 1 ? 'view' : 'views'}`
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
        deck.value = rsp.data.deck
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
                            <span>{{ mainDeck.length }} Main</span>
                            <span>{{ extraDeck.length }} Extra</span>
                            <span>{{ sideDeck.length }} Side</span>
                            <span><i class="fa-solid fa-eye"></i> {{ formatViews(deck.viewCount) }}</span>
                            <span>Updated {{ formatDate(deck.updatedAt || deck.createdAt) }}</span>
                        </div>
                    </div>

                    <button
                        v-if="canEdit"
                        class="btn btn-light btn-sm overview-edit-button"
                        @click="editingMetadata ? cancelMetadataEdit() : beginMetadataEdit()"
                    >
                        <i :class="editingMetadata ? 'fa-solid fa-eye-slash' : 'fa-solid fa-pen'"></i>
                        {{ editingMetadata ? 'Hide details' : 'Edit details' }}
                    </button>
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
                        <h2>Main Deck</h2>
                        <span>{{ mainDeck.length }}/60</span>
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
    background: #212529;
    color: #ffffff;
    min-height: 330px;
    overflow: hidden;
    position: relative;
}

.overview-cover {
    height: 100%;
    inset: 0;
    object-fit: cover;
    object-position: center 30%;
    position: absolute;
    width: 100%;
}

.overview-shade {
    background: linear-gradient(90deg, rgba(9, 14, 23, 0.96) 0%, rgba(9, 14, 23, 0.82) 48%, rgba(9, 14, 23, 0.48) 100%);
    inset: 0;
    position: absolute;
}

.overview-content {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    min-height: 330px;
    padding-bottom: 2.5rem;
    padding-top: 2.5rem;
    position: relative;
}

.deck-identity {
    max-width: 720px;
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
    background: #0f766e;
}

.deck-type-rogue {
    background: #9f1239;
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

.zone-header > span {
    color: #cbd5e1;
    font-size: 0.85rem;
    font-weight: 700;
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
