<script lang="ts" setup>
import Loading from '@/components/Loading.vue'
import { getCardImage, getSetImage, setFallbackImage } from '@/helpers/image'
import { useAuth } from '@/hooks/auth.hook'
import type { InvoiceItemModel } from '@/models/invoiceItem.model'
import router from '@/router'
import { InvoiceService } from '@/services/invoice.service'
import { computed, onMounted, ref } from 'vue'

const { logout } = useAuth()
const cartItems = ref<InvoiceItemModel[]>([])
const loading = ref(true)
const paying = ref(false)

function handleAuthError(error: unknown) {
    logout(error instanceof Error ? error : null)
}

const total = computed(() => {
    return cartItems.value.reduce((sum, item) => {
        return sum + item.count * itemPrice(item)
    }, 0)
})

const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.count, 0)
})

async function loadCart() {
    loading.value = true

    try {
        const rsp = await InvoiceService.getCart()
        cartItems.value = rsp.data
    } catch (e) {
        handleAuthError(e)
    } finally {
        loading.value = false
    }
}

function itemPrice(item: InvoiceItemModel) {
    if (item.itemType === 'set' && item.set) return Number(item.set.price)
    if (item.itemType === 'card' && item.card) return Number(item.card.cardmarketPrice)

    return Number(item.pricePerItem)
}

function itemName(item: InvoiceItemModel) {
    if (item.itemType === 'set') return item.set?.setName ?? 'Unknown set'
    return item.card?.name ?? 'Unknown card'
}

function itemSubtitle(item: InvoiceItemModel) {
    if (item.itemType === 'set') {
        const code = item.set?.setCode ?? 'No code'
        const count = item.set?.numOfCards != null ? `${item.set.numOfCards} cards` : 'Card count unavailable'

        return `${code} - ${count}`
    }

    return item.card?.type ?? 'Card'
}

function itemImage(item: InvoiceItemModel) {
    if (item.itemType === 'set' && item.set?.setCode) return getSetImage(item.set.setCode)
    if (item.itemType === 'card' && item.card) return getCardImage(item.card.id)

    return '/back_high.jpg'
}

function itemRoute(item: InvoiceItemModel) {
    if (item.itemType === 'set' && item.set?.setName) return `/set/${encodeURIComponent(item.set.setName)}`
    if (item.itemType === 'card' && item.card) return `/card/${item.card.id}`

    return '#'
}

function formatMoney(value: number) {
    return `${value.toFixed(2)} EUR`
}

async function pay() {
    if (cartItems.value.length === 0) {
        alert('Cart is empty!')
        return
    }

    if (!confirm('Are you sure you want to pay?')) return

    paying.value = true

    try {
        await InvoiceService.pay()
        router.push('/user')
    } catch (e) {
        console.log(e)
    } finally {
        paying.value = false
    }
}

async function updateCount(item: InvoiceItemModel) {
    try {
        await InvoiceService.updateCartItemCount(item.id, item.count)
    } catch (e) {
        handleAuthError(e)
    }
}

function add(item: InvoiceItemModel) {
    item.count++
    updateCount(item)
}

function remove(item: InvoiceItemModel) {
    if (item.count === 1) return

    item.count--
    updateCount(item)
}

function removeItemFromCart(item: InvoiceItemModel) {
    if (!confirm(`Are you sure you want to remove ${itemName(item)}?`)) return

    InvoiceService.removeCartItem(item.id)
        .then(() => {
            cartItems.value = cartItems.value.filter(i => i.id !== item.id)
        })
        .catch(e => handleAuthError(e))
}

onMounted(loadCart)
</script>

<template>
    <div class="cart-page">
        <div class="container page-content">
            <div class="cart-header mb-4">
                <div>
                    <h1 class="h2 fw-bold mb-1">Cart</h1>
                    <p class="text-secondary mb-0">Review sealed sets and single cards before checkout.</p>
                </div>
            </div>

            <Loading v-if="loading" />

            <div v-else-if="cartItems.length === 0" class="cart-empty">
                <div class="text-center">
                    <i class="fa-solid fa-cart-shopping empty-icon"></i>
                    <h2 class="h4 fw-bold mb-1">Your cart is empty</h2>
                    <p class="text-secondary mb-0">Add sets or single cards to begin checkout.</p>
                </div>
            </div>

            <div v-else class="cart-layout">
                <section class="cart-items">
                    <article v-for="item in cartItems" :key="item.id" class="cart-item">
                        <RouterLink :to="itemRoute(item)" class="item-image-wrap">
                            <img
                                :src="itemImage(item)"
                                :alt="itemName(item)"
                                class="item-image"
                                @error="setFallbackImage"
                            >
                        </RouterLink>

                        <div class="item-details">
                            <div class="item-topline">
                                <span class="item-type-badge" :class="`item-type-${item.itemType}`">
                                    {{ item.itemType === 'set' ? 'Set' : 'Single Card' }}
                                </span>
                            </div>

                            <RouterLink :to="itemRoute(item)" class="item-name">
                                {{ itemName(item) }}
                            </RouterLink>

                            <p class="item-subtitle mb-0">{{ itemSubtitle(item) }}</p>
                        </div>

                        <div class="item-price">
                            <span class="text-secondary small">Price</span>
                            <strong>{{ formatMoney(itemPrice(item)) }}</strong>
                        </div>

                        <div class="quantity-control">
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="remove(item)" :disabled="item.count === 1">
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span>{{ item.count }}</span>

                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="add(item)">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>

                        <div class="item-total">
                            <span class="text-secondary small">Subtotal</span>
                            <strong>{{ formatMoney(itemPrice(item) * item.count) }}</strong>
                        </div>

                        <button type="button" class="btn btn-outline-danger btn-sm remove-button" @click="removeItemFromCart(item)" title="Remove item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </article>
                </section>

                <aside class="cart-summary">
                    <h2 class="h5 fw-bold mb-3">Order Summary</h2>

                    <div class="summary-row">
                        <span>Items</span>
                        <strong>{{ totalItems }}</strong>
                    </div>

                    <div class="summary-row">
                        <span>Unique products</span>
                        <strong>{{ cartItems.length }}</strong>
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-total">
                        <span>Total</span>
                        <strong>{{ formatMoney(total) }}</strong>
                    </div>

                    <button type="button" class="btn btn-success w-100 mt-3" @click="pay" :disabled="paying || cartItems.length === 0">
                        <i class="fa-solid fa-credit-card"></i>
                        {{ paying ? 'Processing...' : 'Pay Now' }}
                    </button>
                </aside>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cart-page {
    background: #f5f6f8;
    flex: 1;
}

.page-content {
    padding-bottom: 2.5rem;
    padding-top: 2rem;
}

.cart-layout {
    align-items: start;
    display: grid;
    gap: 1.25rem;
    grid-template-columns: minmax(0, 1fr) 320px;
}

.cart-items {
    display: grid;
    gap: 1rem;
}

.cart-item {
    align-items: center;
    background: #ffffff;
    border: 1px solid #dfe4ec;
    border-radius: 8px;
    display: grid;
    gap: 1rem;
    grid-template-columns: 96px minmax(0, 1fr) 110px 128px 120px auto;
    padding: 0.9rem;
}

.item-image-wrap {
    align-items: center;
    border-radius: 6px;
    display: flex;
    height: 96px;
    justify-content: center;
    overflow: hidden;
    padding: 0.45rem;
}

.item-image {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
}

.item-details {
    min-width: 0;
}

.item-topline {
    margin-bottom: 0.35rem;
}

.item-type-badge {
    border-radius: 4px;
    color: #ffffff;
    display: inline-flex;
    font-size: 0.72rem;
    font-weight: 800;
    padding: 0.25rem 0.45rem;
}

.item-type-set {
    background: #0d6efd;
}

.item-type-card {
    background: #198754;
}

.item-name {
    color: #172033;
    display: block;
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.25;
    overflow-wrap: anywhere;
    text-decoration: none;
}

.item-name:hover {
    color: #0d6efd;
}

.item-subtitle {
    color: #64748b;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.item-price,
.item-total {
    display: grid;
    gap: 0.15rem;
}

.item-price strong,
.item-total strong {
    color: #172033;
    font-size: 0.95rem;
    white-space: nowrap;
}

.quantity-control {
    align-items: center;
    display: inline-flex;
    gap: 0.45rem;
    justify-content: center;
}

.quantity-control button {
    align-items: center;
    display: inline-flex;
    height: 32px;
    justify-content: center;
    width: 34px;
}

.quantity-control span {
    background: #0d6efd;
    border-radius: 4px;
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 800;
    min-width: 34px;
    padding: 0.35rem 0.5rem;
    text-align: center;
}

.remove-button {
    align-items: center;
    display: inline-flex;
    height: 34px;
    justify-content: center;
    width: 36px;
}

.cart-summary {
    background: #ffffff;
    border: 1px solid #dfe4ec;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(18, 29, 43, 0.06);
    padding: 1rem;
    position: sticky;
    top: 1rem;
}

.summary-row,
.summary-total {
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.summary-row {
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.65rem;
}

.summary-row strong {
    color: #172033;
}

.summary-divider {
    border-top: 1px solid #dfe4ec;
    margin: 1rem 0;
}

.summary-total span {
    color: #172033;
    font-size: 1.05rem;
    font-weight: 800;
}

.summary-total strong {
    color: #172033;
    font-size: 1.3rem;
}

.cart-empty {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 380px;
}

.empty-icon {
    color: #94a3b8;
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

@media (max-width: 1199.98px) {
    .cart-layout {
        grid-template-columns: 1fr;
    }

    .cart-summary {
        position: static;
    }
}

@media (max-width: 991.98px) {
    .cart-item {
        grid-template-columns: 88px minmax(0, 1fr) auto;
    }

    .item-price,
    .quantity-control,
    .item-total {
        grid-column: 2 / 3;
    }

    .remove-button {
        grid-column: 3 / 4;
        grid-row: 1 / 2;
        justify-self: end;
    }
}

@media (max-width: 575.98px) {
    .page-content {
        padding-top: 1.25rem;
    }

    .cart-item {
        align-items: start;
        grid-template-columns: 80px minmax(0, 1fr);
    }

    .remove-button {
        grid-column: 2 / 3;
        grid-row: auto;
        justify-self: start;
    }
}
</style>
