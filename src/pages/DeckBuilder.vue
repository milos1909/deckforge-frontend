<script setup lang="ts">
import Loading from '@/components/Loading.vue'
import CardTooltip from '@/components/CardTooltip.vue'
import { getCardImage, setFallbackImage } from '@/helpers/image'
import type { CardModel } from '@/models/card.model'
import { DataService } from '@/services/data.service'
import { computed, onMounted, ref, watch } from 'vue'
import { DeckService } from '@/services/deck.service'
import { useAuth }  from '@/hooks/auth.hook'

type DeckZone = 'main' | 'extra' | 'side'

const { auth } = useAuth()

const cards = ref<CardModel[]>([])
const loading = ref(false)
const totalResults = ref(0)
const search = ref('')
const currentPage = ref(1)

const deckId = ref<number | null>(null)
const deckName = ref('New Deck')
const editingDeckName = ref(false)

const mainDeck = ref<CardModel[]>([])
const extraDeck = ref<CardModel[]>([])
const sideDeck = ref<CardModel[]>([])

const PAGE_SIZE = 21
const MAIN_LIMIT = 60
const EXTRA_LIMIT = 15
const SIDE_LIMIT = 15
const COPY_LIMIT = 3

const totalPages = computed(() => Math.max(1, Math.ceil(totalResults.value / PAGE_SIZE)))

async function loadCards() {
  loading.value = true

  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE
    const rsp = await DataService.getCards(search.value, PAGE_SIZE, offset)

    cards.value = rsp.data.cards
    totalResults.value = rsp.data.total
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function isExtraDeckCard(card: CardModel) {
  return ['Fusion', 'Synchro', 'Xyz', 'Link'].some((type) => card.type.includes(type))
}

function cardsForZone(zone: DeckZone) {
  if (zone === 'extra') return extraDeck.value
  if (zone === 'side') return sideDeck.value

  return mainDeck.value
}

function zoneLimit(zone: DeckZone) {
  if (zone === 'main') return MAIN_LIMIT
  return zone === 'extra' ? EXTRA_LIMIT : SIDE_LIMIT
}

function copyCount(card: CardModel) {
  return [...mainDeck.value, ...extraDeck.value, ...sideDeck.value].filter((deckCard) => deckCard.id === card.id).length
}

function canAddCard(card: CardModel, zone: DeckZone) {
  if (copyCount(card) >= COPY_LIMIT) return false
  if (cardsForZone(zone).length >= zoneLimit(zone)) return false
  if (zone === 'extra') return isExtraDeckCard(card)
  if (zone === 'main') return !isExtraDeckCard(card)

  return true
}

function addCard(card: CardModel, zone?: DeckZone) {
  const targetZone = zone ?? (isExtraDeckCard(card) ? 'extra' : 'main')

  if (!canAddCard(card, targetZone)) return

  cardsForZone(targetZone).push(card)
}

function removeCard(card: CardModel, zone: DeckZone) {
  const deck = cardsForZone(zone)
  const index = deck.findIndex((deckCard) => deckCard.id === card.id)

  if (index >= 0) {
    deck.splice(index, 1)
  }
}

function finishDeckNameEdit() {
  deckName.value = deckName.value.trim() || 'New Deck'
  editingDeckName.value = false
}

async function saveDeck() {
  if(!auth.value) {
    alert('You must be logged in to save your deck')
    return
  }

  const payload = {
    name: deckName.value,
    cards: [
      ...mainDeck.value.map(card => ({ id: card.id, type: 'main' })),
      ...extraDeck.value.map(card => ({ id: card.id, type: 'extra' })),
      ...sideDeck.value.map(card => ({ id: card.id, type: 'side' }))
    ]
  }

  if (deckId.value) {
    await DeckService.updateDeck(deckId.value, payload)
    alert('Updated')
  } else {
    const rsp = await DeckService.createDeck(payload)
    deckId.value = rsp.data.id
    alert('Created')
  }
}

watch(search, () => {
  currentPage.value = 1
})

watch(currentPage, loadCards)

onMounted(loadCards)
</script>

<template>
  <div class="deck-builder-page">
    <div class="container-fluid py-5">
      <div class="justify-content-center text-center mb-3">
          <h1 class="h2 fw-bold mb-1">Deck Builder</h1>
          <p class="text-secondary mb-0">Build, organize, and perfect your Yu-Gi-Oh! deck.</p>
      </div>

      <div class="row g-4 align-items-start">
        <section class="col-12 col-xl-7">
          <div class="p-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <input
                  v-if="editingDeckName"
                  v-model="deckName"
                  class="form-control deck-name-input"
                  type="text"
                  maxlength="60"
                  autofocus
                  @blur="finishDeckNameEdit"
                  @keyup.enter="finishDeckNameEdit"
                  @keyup.esc="editingDeckName = false"
                />
                <button v-else class="deck-name-button" @click="editingDeckName = true">
                  {{ deckName }}
                  <i class="fa-solid fa-pen"></i>
                </button>
                <p class="text-secondary small mb-0">Tip: Click on a card to add/remove, right click adds card to side deck</p>
              </div>
              <button type="button" class="btn btn-success btn-sm" @click="saveDeck()">
                  <i class="fa-solid fa-floppy-disk"></i>
                  Save
              </button>
            </div>

            <div class="deck-zone">
              <div class="zone-header bg-dark">
                <h3 class="h6 fw-bold mb-0">Main Deck</h3>
                <span>{{ mainDeck.length }}/{{ MAIN_LIMIT }}</span>
              </div>
              <div v-if="mainDeck.length" class="deck-card-grid main-grid">
                <CardTooltip v-for="(card, index) in mainDeck" :key="`main-${card.id}-${index}`" :card="card">
                  <button class="deck-card-tile" @click="removeCard(card, 'main')">
                    <img :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />
                  </button>
                </CardTooltip>
              </div>
              <div v-else class="empty-zone"></div>
            </div>

            <div class="deck-zone extra-zone mt-3">
              <div class="zone-header">
                <h3 class="h6 fw-bold mb-0">Extra Deck</h3>
                <span>{{ extraDeck.length }}/{{ EXTRA_LIMIT }}</span>
              </div>
              <div v-if="extraDeck.length" class="deck-card-grid">
                <CardTooltip v-for="(card, index) in extraDeck" :key="`extra-${card.id}-${index}`" :card="card">
                  <button class="deck-card-tile" @click="removeCard(card, 'extra')">
                    <img :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />
                  </button>
                </CardTooltip>
              </div>
              <div v-else class="empty-zone"></div>
            </div>

            <div class="deck-zone side-zone mt-3">
              <div class="zone-header">
                <h3 class="h6 fw-bold mb-0">Side Deck</h3>
                <span>{{ sideDeck.length }}/{{ SIDE_LIMIT }}</span>
              </div>
              <div v-if="sideDeck.length" class="deck-card-grid">
                <CardTooltip v-for="(card, index) in sideDeck" :key="`side-${card.id}-${index}`" :card="card">
                  <button class="deck-card-tile" @click="removeCard(card, 'side')">
                    <img :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />
                  </button>
                </CardTooltip>
              </div>
              <div v-else class="empty-zone"></div>
            </div>
          </div>
        </section>

        <aside class="col-12 col-xl-5">
          <div class="builder-panel search-panel">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 class="h5 fw-bold mb-1">Card Search</h2>
            </div>

            <div class="search-wrapper mb-3">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input v-model="search" @keyup.enter="loadCards" type="text" class="form-control search-input" placeholder="Search cards..." />
              <button class="btn btn-primary" @click="loadCards">
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div class="d-flex justify-content-center align-items-center mb-3 gap-1">
              <button class="btn btn-outline-primary btn-sm" @click="previousPage" :disabled="currentPage === 1">
                <i class="fa-solid fa-arrow-left"></i>
              </button>
              <span class="small text-secondary">Page {{ currentPage }}/{{ totalPages }} - {{ totalResults }} cards</span>
              <button class="btn btn-outline-primary btn-sm" @click="nextPage" :disabled="currentPage >= totalPages">
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div v-if="loading" class="loading-state">
              <Loading />
            </div>
            <div v-else-if="cards.length" class="card-search-grid">
              <CardTooltip v-for="card in cards" :key="card.id" :card="card">
                <button
                  class="search-card"
                  @click="addCard(card)"
                  @contextmenu.prevent="addCard(card, 'side')"
                >
                  <img :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />
                </button>
              </CardTooltip>
            </div>
            <div v-else class="empty-search">No matching cards found.</div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-builder-page {
  flex: 1;
}

.builder-panel {
  padding: 1rem;
}

.deck-zone {
  overflow: hidden;
  background: #fbfcfe;
}

.extra-zone {
  background: #ede9fe;
}

.side-zone {
  background: #ffedd5;
}

.zone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #212529;
  color: #ffffff;
  padding: 0.75rem 0.9rem;
}

.zone-header span {
  color: #cbd5e1;
  font-weight: 700;
}

.extra-zone .zone-header {
  background: #4c1d95;
}

.extra-zone .zone-header span {
  color: #ddd6fe;
}

.side-zone .zone-header {
  background: #7c2d12;
}

.side-zone .zone-header span {
  color: #fed7aa;
}

.deck-name-button {
  align-items: center;
  background: transparent;
  border: 0;
  color: #172033;
  display: inline-flex;
  font-size: 1.25rem;
  font-weight: 700;
  gap: 0.5rem;
  line-height: 1.2;
  padding: 0;
  text-align: left;
}

.deck-name-button i {
  color: #64748b;
  font-size: 0.85rem;
}

.deck-name-input {
  max-width: 320px;
}

.deck-card-grid {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 0.55rem;
  padding: 0.75rem;
}

.empty-zone,
.empty-search,
.loading-state {
  box-sizing: border-box;
  color: #3a414b;
  padding: 1rem;
}

.empty-zone {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  padding: 0.75rem;
}

.empty-zone::before {
  aspect-ratio: 0.6875;
  content: "";
}

.empty-search,
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 132px;
  text-align: center;
}

.search-panel {
  position: sticky;
  top: 1rem;
}

.search-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: 0.5rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  color: #64748b;
  transform: translateY(-50%);
  z-index: 1;
}

.search-input {
  padding-left: 2.35rem;
}

.card-search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  gap: 0.75rem;
  max-height: 680px;
  overflow: auto;
  padding-right: 0.15rem;
}

.search-card,
.deck-card-tile {
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #172033;
  display: block;
  padding: 0;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  width: 100%;
}

.search-card img,
.deck-card-tile img {
  width: 100%;
  aspect-ratio: 0.6875;
  border-radius: 4px;
  object-fit: cover;
}

@media (max-width: 1199.98px) {
  .search-panel {
    position: static;
  }
}

@media (max-width: 575.98px) {
  .builder-panel {
    padding: 0.75rem;
  }

  .deck-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  }

  .card-search-grid {
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  }

  .deck-zone {
    --deck-zone-body-height: 118px;
  }
}
</style>
