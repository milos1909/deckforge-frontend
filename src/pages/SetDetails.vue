<script setup lang="ts">
import CardTooltip from '@/components/CardTooltip.vue'
import Loading from '@/components/Loading.vue'
import { getCardImage, getSetImage, setFallbackImage } from '@/helpers/image'
import { useAuth } from '@/hooks/auth.hook'
import type { CardModel } from '@/models/card.model'
import type { SetModel } from '@/models/set.model'

import { InvoiceService } from '@/services/invoice.service'
import { SetService } from '@/services/set.service'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type RarityGroup = {
    rarity: string
    rarityCode: string | null
    cards: CardModel[]
}

const route = useRoute()
const router = useRouter()

const { auth, logout } = useAuth()

const setName = route.params.setName

const set = ref<SetModel>()
const rarityGroups = ref<RarityGroup[]>([])
const loading = ref(false)

async function loadSet() {
    loading.value = true

    try {
        const rsp = await SetService.getSetByName(String(setName))

        set.value = rsp.data.set_details
        rarityGroups.value = rsp.data.rarity_groups ?? []
    } finally {
        loading.value = false
    }
}

function addToCart(setName: string) {
    if (!auth.value) {
        alert('You must be logged in in order to buy items')
        return
    }

    if (!confirm(`Add ${setName} to cart`)) return

    InvoiceService.addSetToCart(setName)
        .then(() => router.push('/cart'))
        .catch(e => logout(e))
}

onMounted(loadSet)
</script>

<template>
    <Loading v-if="loading" />

    <div v-else class="set-details-page">
        <div class="container pb-3 pb-lg-5">
            <section class="product-section">
                <div class="row g-5 justify-content-center align-items-start">
                    <div class="col-12 col-lg-4 text-center">
                        <img
                            :src="getSetImage(String(set?.setCode))"
                            :alt="set?.setName"
                            class="set-image"
                            @error="setFallbackImage"
                        >
                    </div>

                    <div class="col-12 col-lg-5">
                        <h1 class="product-title mb-4">{{ set?.setName }}</h1>

                        <div class="detail-list">
                            <div class="detail-row">
                                <strong>Set Size</strong>
                                <span>{{ set?.numOfCards }}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Set Code</strong>
                                <span>{{ set?.setCode }}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Launch Date</strong>
                                <span>{{ set?.tcgDate }}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Price</strong>
                                <span>{{ set?.price }} EUR</span>
                            </div>
                        </div>

                        <button type="button" class="btn btn-success btn-lg mt-4" @click="addToCart(set!.setName)">
                            <i class="fa-solid fa-cart-shopping"></i>
                            Add to cart
                        </button>
                    </div>
                </div>
            </section>

            <section v-if="rarityGroups.length" class="cards-section">
                <div v-for="group in rarityGroups" :key="group.rarity" class="rarity-group">
                    <div class="rarity-divider">
                        <span></span>
                        <strong>
                            {{ group.rarity }}
                            <template v-if="group.rarityCode"> {{ group.rarityCode }}</template>
                            - {{ group.cards.length }} cards
                        </strong>
                        <span></span>
                    </div>

                    <div class="card-grid">
                        <CardTooltip v-for="card in group.cards" :key="`${group.rarity}-${card.id}`" :card="card">
                            <RouterLink :to="`/card/${card.id}`" class="card-entry">
                                <img
                                    :src="getCardImage(card.id)"
                                    :alt="card.name"
                                    class="card-image"
                                    @error="setFallbackImage"
                                >
                            </RouterLink>
                        </CardTooltip>
                    </div>
                </div>
            </section>

            <section v-else class="empty-state">
                <div class="text-center">
                    <i class="fa-solid fa-layer-group empty-icon"></i>
                    <h4 class="fw-bold mb-1">No cards found</h4>
                    <p class="text-secondary mb-0">This set does not have card data yet.</p>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
    .set-details-page {
        flex: 1;
        background: #f5f6f8;
        overflow-x: hidden;
    }

    .product-section {
        background: #ffffff;
        border-bottom: 3px solid #b98b2f;
        margin-left: calc(50% - 50vw);
        margin-right: calc(50% - 50vw);
        padding-bottom: 4rem;
        padding-top: 3rem;
        width: 100vw;
    }

    .product-section > .row {
        margin-left: auto;
        margin-right: auto;
        max-width: 1140px;
        padding-left: 12px;
        padding-right: 12px;
    }

    .set-image {
        max-height: 430px;
        max-width: 100%;
        object-fit: contain;
    }

    .product-title {
        color: #1c2d73;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(2.25rem, 5vw, 3.25rem);
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1.05;
    }

    .detail-list {
        border-bottom: 1px solid #cfd5df;
        border-top: 1px solid #cfd5df;
        display: grid;
    }

    .detail-row {
        align-items: center;
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        padding: 0.7rem 0;
    }

    .detail-row + .detail-row {
        border-top: 1px solid #edf0f4;
    }

    .detail-row strong {
        color: #172a78;
        font-size: 0.95rem;
        min-width: 130px;
    }

    .detail-row span {
        color: #4b5563;
        flex: 1;
        text-align: right;
    }

    .cards-section {
        padding-top: 4rem;
    }

    .rarity-group + .rarity-group {
        margin-top: 2.25rem;
    }

    .rarity-divider {
        align-items: center;
        color: #7c2d12;
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.25rem;
        text-align: center;
        text-transform: uppercase;
        width: 100%;
    }

    .rarity-divider span {
        flex: 1;
        border-top: 1px solid #d7d7d7;
    }

    .rarity-divider strong {
        flex: 0 0 auto;
        font-size: 0.85rem;
        letter-spacing: 0.04em;
    }

    .card-grid {
        display: grid;
        gap: 0.9rem;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        justify-items: center;
    }

    .card-entry {
        color: #111827;
        display: block;
        max-width: 150px;
        text-align: center;
        text-decoration: none;
        width: 100%;
    }

    .card-image {
        aspect-ratio: 0.6875;
        border-radius: 2px;
        display: block;
        object-fit: cover;
        transition: transform 0.18s, box-shadow 0.18s;
        width: 100%;
    }

    .card-image:hover {
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.24);
        transform: translateY(-3px);
    }

    .empty-state {
        align-items: center;
        display: flex;
        justify-content: center;
        min-height: 320px;
    }

    .empty-icon {
        color: #94a3b8;
        font-size: 2rem;
        margin-bottom: 0.75rem;
    }

    @media (max-width: 767.98px) {
        .detail-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 0.25rem;
        }

        .detail-row span {
            text-align: left;
        }

        .product-section {
            padding-bottom: 2.5rem;
        }

        .cards-section {
            padding-top: 2.5rem;
        }

        .card-grid {
            grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
        }
    }
</style>
