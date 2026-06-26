<script setup lang="ts">
import Loading from '@/components/Loading.vue'
import CardTooltip from '@/components/CardTooltip.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { getDeckTotalPrice, getMainDeckTypeCounts, sortCardsForDeck } from '@/helpers/deck'
import { getCardImage, setFallbackImage } from '@/helpers/image'
import type { CardModel } from '@/models/card.model'
import type { DeckCardModel } from '@/models/deck.model'
import { computed, onMounted, ref, watch } from 'vue'
import { DeckService } from '@/services/deck.service'
import { useAuth }  from '@/hooks/auth.hook'
import { useCardSearch } from '@/hooks/cardSearch.hook'
import { usePagination } from '@/hooks/pagination.hook'
import { useRoute, useRouter } from 'vue-router'

type DeckZone = 'main' | 'extra' | 'side'

const { auth } = useAuth()
const route = useRoute()
const router = useRouter()

const deckId = ref<number | null>(null)
const deckName = ref('New Deck')
const editingDeckName = ref(false)

const mainDeck = ref<CardModel[]>([])
const extraDeck = ref<CardModel[]>([])
const sideDeck = ref<CardModel[]>([])

const allDeckCards = computed(() => [
  ...mainDeck.value,
  ...extraDeck.value,
  ...sideDeck.value
])

const deckTotalPrice = computed(() => getDeckTotalPrice(allDeckCards.value))
const mainDeckTypeCounts = computed(() => getMainDeckTypeCounts(mainDeck.value))

const PAGE_SIZE = 21
const MAIN_LIMIT = 60
const EXTRA_LIMIT = 15
const SIDE_LIMIT = 15
const COPY_LIMIT = 3

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
  sortOptions,
  sortOptionLabel,
  loadCards,
  loadFilterOptions,
  loadRaces,
  applyFilters,
  resetFilters,
  resetTypeSpecificFilters,
} = useCardSearch(pagination)

async function loadExistingDeck() {
  const id = Number(route.params.id)

  if (!id || !Number.isInteger(id) || id <= 0) return

  try {
    const rsp = await DeckService.getDeckById(id)

    if (!rsp.data.canEdit) {
      alert('You can only edit cards in your own decks.')
      await router.push(`/deck/${id}`)
      return
    }

    const loadedDeck = rsp.data.deck

    deckId.value = loadedDeck.id
    deckName.value = loadedDeck.name
    mainDeck.value = loadedDeck.deckCards.filter((deckCard: DeckCardModel) => deckCard.type === 'main').map((deckCard: DeckCardModel) => deckCard.card)
    extraDeck.value = loadedDeck.deckCards.filter((deckCard: DeckCardModel) => deckCard.type === 'extra').map((deckCard: DeckCardModel) => deckCard.card)
    sideDeck.value = loadedDeck.deckCards.filter((deckCard: DeckCardModel) => deckCard.type === 'side').map((deckCard: DeckCardModel) => deckCard.card)
  } catch {
    alert('Deck could not be opened in the builder.')
    await router.push('/deckbuilder')
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

function sortDecks() {
  mainDeck.value = sortCardsForDeck(mainDeck.value)
  extraDeck.value = sortCardsForDeck(extraDeck.value)
  sideDeck.value = sortCardsForDeck(sideDeck.value)
}

function formatDeckPrice(value: number) {
  return value.toFixed(2)
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

watch(selectedType, async () => {
  resetTypeSpecificFilters()
  await loadRaces()
  await applyFilters()
})

watch(currentPage, loadCards)

onMounted(async () => {
  await loadExistingDeck()
  await loadFilterOptions()
  await loadCards()
})
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
              <div class="deck-actions">
                <div class="deck-price-summary" title="Total deck price">
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span>{{ formatDeckPrice(deckTotalPrice) }} €</span>
                </div>

                <button type="button" class="btn btn-outline-secondary btn-sm" @click="sortDecks">
                  <i class="fa-solid fa-arrow-down-wide-short"></i>
                  Sort
                </button>

                <button type="button" class="btn btn-success btn-sm" @click="saveDeck()">
                  <i class="fa-solid fa-floppy-disk"></i>
                  Save
                </button>
              </div>
            </div>

            <div class="deck-zone">
              <div class="zone-header bg-dark">
                <div class="zone-title-group">
                  <h3 class="h6 fw-bold mb-0">Main Deck</h3>
                  <div class="main-type-counts">
                    <span class="type-swatch type-swatch-monster"></span>
                    <span>{{ mainDeckTypeCounts.monsters }}</span>
                    <span class="type-swatch type-swatch-spell"></span>
                    <span>{{ mainDeckTypeCounts.spells }}</span>
                    <span class="type-swatch type-swatch-trap"></span>
                    <span>{{ mainDeckTypeCounts.traps }}</span>
                  </div>
                </div>
                <span :class="{ 'deck-count-invalid': mainDeck.length < 40 }">{{ mainDeck.length }}/{{ MAIN_LIMIT }}</span>
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
              <button class="btn btn-outline-secondary btn-sm text-nowrap" @click="resetFilters">
                <i class="fa-solid fa-filter-circle-xmark"></i>
                Reset
              </button>
            </div>

            <div class="search-toolbar mb-3">
              <div class="input-group deck-search">
                <span class="input-group-text">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input v-model="search" @keyup.enter="applyFilters" type="text" class="form-control" placeholder="Search cards..." />
                <button class="btn btn-primary" @click="applyFilters">
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              <label class="search-sort-field">
                <span>Sort by</span>
                <select v-model="selectedSortBy" class="form-select form-select-sm search-sort" @change="applyFilters">
                  <option value="">Default</option>
                  <option v-for="sortOption in sortOptions" :key="sortOption" :value="sortOption">{{ sortOptionLabel(sortOption) }}</option>
                </select>
              </label>

              <select v-model="selectedSortDirection" class="form-select form-select-sm search-direction" :disabled="!selectedSortBy" @change="applyFilters">
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </select>

              <button class="btn btn-outline-primary btn-sm text-nowrap" @click="showAdvancedFilters = !showAdvancedFilters">
                <i class="fa-solid fa-sliders"></i>
                More filters
              </button>
            </div>

            <div v-if="showAdvancedFilters" class="deck-advanced-filters mb-3">
              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Archetype</label>
                <select v-model="selectedArchetype" class="form-select form-select-sm" @change="applyFilters">
                  <option value="">All archetypes</option>
                  <option v-for="archetype in archetypes" :key="archetype" :value="archetype">{{ archetype }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Type</label>
                <select v-model="selectedType" class="form-select form-select-sm">
                  <option value="">All types</option>
                  <option v-for="type in cardTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Race</label>
                <select v-model="selectedRace" class="form-select form-select-sm" :disabled="!hasSelectedType" @change="applyFilters">
                  <option value="">Any race</option>
                  <option v-for="race in races" :key="race" :value="race">{{ race }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Attribute</label>
                <select v-model="selectedAttribute" class="form-select form-select-sm" :disabled="!isMonster" @change="applyFilters">
                  <option value="">Any attribute</option>
                  <option v-for="attribute in attributes" :key="attribute" :value="attribute">{{ attribute }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Level</label>
                <select v-model="selectedLevel" class="form-select form-select-sm" :disabled="!isMonster || isLink" @change="applyFilters">
                  <option value="">Any level</option>
                  <option v-for="level in levels" :key="level" :value="level">{{ level }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Link rating</label>
                <select v-model="selectedLinkval" class="form-select form-select-sm" :disabled="!isLink" @change="applyFilters">
                  <option value="">Any link rating</option>
                  <option v-for="linkval in linkValues" :key="linkval" :value="linkval">{{ linkval }}</option>
                </select>
              </div>

              <div class="deck-filter-field">
                <label class="form-label small text-secondary">Scale</label>
                <select v-model="selectedScale" class="form-select form-select-sm" :disabled="!isPendulum" @change="applyFilters">
                  <option value="">Any scale</option>
                  <option v-for="scale in scales" :key="scale" :value="scale">{{ scale }}</option>
                </select>
              </div>
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

            <PaginationControls
              v-if="cards.length > 0"
              class="mt-3"
              :current-page="currentPage"
              :total-pages="totalPages"
              :total-results="totalResults"
              @previous="previousPage"
              @next="nextPage"
            />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-builder-page {
  flex: 1;
  background: #f5f6f8;
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

.zone-header .deck-count-invalid {
  color: #ff6b6b;
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

.deck-actions {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.deck-price-summary {
  align-items: center;
  color: #172033;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 700;
  gap: 0.35rem;
  white-space: nowrap;
}

.deck-price-summary i {
  color: #198754;
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

.search-toolbar {
  align-items: center;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: minmax(150px, 1fr) 150px 78px auto;
}

.deck-search .input-group-text {
  background: #ffffff;
}

.search-sort-field {
  align-items: center;
  display: flex;
  gap: 0.4rem;
}

.search-sort-field span {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 600;
}

.search-sort,
.search-direction {
  min-height: 38px;
}

.deck-advanced-filters {
  background: #ffffff;
  border: 1px solid #dfe4ec;
  border-radius: 8px;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0.85rem;
}

.deck-filter-field .form-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.deck-filter-field .form-select:disabled,
.search-direction:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
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

  .search-toolbar,
  .deck-advanced-filters {
    grid-template-columns: 1fr;
  }

  .search-sort-field {
    align-items: flex-start;
    flex-direction: column;
  }

  .deck-zone {
    --deck-zone-body-height: 118px;
  }
}
</style>
