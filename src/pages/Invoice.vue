<script lang="ts" setup>
import { useAuth } from '@/hooks/auth.hook'
import type { InvoiceItemModel } from '@/models/invoiceItem.model'
import type { InvoiceModel } from '@/models/invoice.model'
import { InvoiceService } from '@/services/invoice.service'
import QRCode from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCardImage, getSetImage, setFallbackImage } from '@/helpers/image'

const { logout } = useAuth()
const route = useRoute()

const invoice = ref<InvoiceModel | null>(null)
const loading = ref(true)
const qrCodeUrl = ref('')

const id = Number(route.params.id)

const fiscalVerificationPayload = computed(() => {
    if (!invoice.value?.pursId) return ''
    return `https://suf.purs.gov.rs/v/?id=${encodeURIComponent(invoice.value.pursId)}`
})

InvoiceService.getInvoiceDetails(id)
    .then(rsp => {
        invoice.value = rsp.data
    })
    .catch(e => logout(e))
    .finally(() => loading.value = false)

watch(
    fiscalVerificationPayload,
    async value => {
        if (!value) {
            qrCodeUrl.value = ''
            return
        }

        qrCodeUrl.value = await QRCode.toDataURL(value, {
            width: 220,
            margin: 1,
            errorCorrectionLevel: 'M',
        })
    },
    { immediate: true }
)

const invoiceNumber = computed(() => {
    if (!invoice.value) return ''

    const year = new Date(invoice.value.createdAt).getFullYear()
    const paddedId = String(invoice.value.id).padStart(6, '0')

    return `#${year}/${paddedId}`
})

const invoiceItems = computed(() => invoice.value?.invoiceItems ?? [])

const totalAmount = computed(() => {
    return invoiceItems.value.reduce((sum, item) => {
        return sum + item.pricePerItem * item.count
    }, 0)
})

const totalItems = computed(() => {
    return invoiceItems.value.reduce((sum, item) => sum + item.count, 0)
})

const vatAmount = computed(() => {
    return totalAmount.value * 20 / 120
})

const netAmount = computed(() => {
    return totalAmount.value - vatAmount.value
})

function formatMoney(value: number): string {
    return new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function formatDateTime(value?: string): string {
    if (!value) return '-'

    return new Intl.DateTimeFormat('sr-RS', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function formatDate(value?: string): string {
    if (!value) return '-'

    return new Intl.DateTimeFormat('sr-RS', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function getItemTotal(item: InvoiceItemModel): number {
    return item.pricePerItem * item.count
}

function itemName(item: InvoiceItemModel) {
    if (item.itemType === 'set') return item.set?.setName ?? 'Unknown set'
    return item.card?.name ?? 'Unknown card'
}

function itemCode(item: InvoiceItemModel) {
    if (item.itemType === 'set') return item.set?.setCode ?? 'No code'
    return `CARD-${item.card?.id ?? item.id}`
}

function itemSubtitle(item: InvoiceItemModel) {
    if (item.itemType === 'set') {
        return item.set?.numOfCards != null ? `${item.set.numOfCards} cards` : 'Card count unavailable'
    }

    return item.card?.type ?? 'Single card'
}

function itemDetailLabel(item: InvoiceItemModel) {
    return item.itemType === 'set' ? 'Release date' : 'Card type'
}

function itemDetailValue(item: InvoiceItemModel) {
    if (item.itemType === 'set') return formatDate(item.set?.tcgDate)
    return item.card?.type ?? '-'
}

function itemSecondDetailLabel(item: InvoiceItemModel) {
    return item.itemType === 'set' ? 'Set code' : 'Card ID'
}

function itemSecondDetailValue(item: InvoiceItemModel) {
    if (item.itemType === 'set') return item.set?.setCode ?? '-'
    return item.card?.id ?? '-'
}

function itemImage(item: InvoiceItemModel) {
    if (item.itemType === 'set' && item.set?.setCode) return getSetImage(item.set.setCode)
    if (item.itemType === 'card' && item.card) return getCardImage(item.card.id)

    return '/back_high.jpg'
}

</script>

<template>
    <div class="container">
        <div class="container-fluid py-4">
            <div v-if="loading" class="card border-0 shadow-sm">
                <div class="card-body py-5 text-center">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <div class="fw-semibold">Loading invoice details...</div>
                </div>
            </div>

            <div v-else-if="!invoice" class="card border-0 shadow-sm">
                <div class="card-body py-5 text-center">
                    <div class="display-6 mb-2">Invoice not found</div>
                    <p class="text-body-secondary mb-0">
                        The requested invoice could not be loaded.
                    </p>
                </div>
            </div>

            <div v-else class="row g-4 align-items-start">
                <div class="col-12 col-xl-10">
                    <div class="card border-0 shadow-sm mb-4 overflow-hidden">
                        <div class="card-body p-4">
                            <div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
                                <div>
                                    <div class="text-uppercase text-body-secondary small fw-bold mb-1">
                                        Invoice details
                                    </div>

                                    <h1 class="h3 fw-bold mb-2">
                                        Invoice {{ invoiceNumber }}
                                    </h1>

                                    <div class="d-flex flex-wrap gap-2">
                                        <span class="badge rounded-pill text-bg-success">
                                            Paid
                                        </span>

                                        <span class="badge rounded-pill text-bg-secondary">
                                            {{ totalItems }} items
                                        </span>

                                        <span class="badge rounded-pill text-bg-dark border">
                                            Fiscalized
                                        </span>
                                    </div>
                                </div>

                                <div class="text-lg-end">
                                    <div class="text-body-secondary small">
                                        App invoice ID
                                    </div>
                                    <div class="fw-bold fs-5">
                                        {{ invoice.id }}
                                    </div>

                                    <div class="text-body-secondary small mt-2">
                                        Created at
                                    </div>
                                    <div class="fw-semibold">
                                        {{ formatDateTime(invoice.createdAt) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="text-body-secondary small fw-bold text-uppercase mb-2">
                                        Total amount
                                    </div>
                                    <div class="h3 fw-bold mb-0">
                                        {{ formatMoney(totalAmount) }}
                                    </div>
                                    <div class="text-body-secondary small mt-2">
                                        VAT included
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="text-body-secondary small fw-bold text-uppercase mb-2">
                                        Paid at
                                    </div>
                                    <div class="fw-bold fs-5">
                                        {{ formatDateTime(invoice.pursTime) }}
                                    </div>
                                    <div class="text-body-secondary small mt-2">
                                        Payment time
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="text-body-secondary small fw-bold text-uppercase mb-2">
                                        Fiscal invoice
                                    </div>
                                    <div class="fw-bold text-break">
                                        {{ invoice.pursCounter }}
                                    </div>
                                    <div class="text-body-secondary small mt-2">
                                        PURS invoice counter
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-header bg-transparent border-secondary-subtle p-4">
                            <div class="d-flex flex-column flex-lg-row justify-content-between gap-2">
                                <div>
                                    <h2 class="h5 fw-bold mb-1">
                                        Ordered Yu-Gi-Oh! sets
                                    </h2>
                                    <p class="text-body-secondary mb-0">
                                        Overview of all purchased card sets and quantities.
                                    </p>
                                </div>

                                <div class="text-lg-end">
                                    <div class="small text-body-secondary">
                                        Unique fiscal ID
                                    </div>
                                    <div class="small fw-semibold text-break">
                                        {{ invoice.pursId }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card-body p-0">
                            <div
                                v-for="item in invoiceItems"
                                :key="item.id"
                                class="p-4 border-bottom border-secondary-subtle"
                            >
                                <div class="row g-4 align-items-center">
                                    <div class="col-12 col-md-3 col-lg-2">
                                        <img
                                            :src="itemImage(item)"
                                            :alt="itemName(item)"
                                            class="img-fluid rounded-4 shadow-sm set-image"
                                            @error="setFallbackImage"
                                        >
                                    </div>

                                    <div class="col-12 col-md-9 col-lg-7">
                                        <div class="d-flex flex-wrap gap-2 mb-2">
                                            <span class="badge text-bg-primary">
                                                {{ item.itemType === 'set' ? 'Set' : 'Single card' }}
                                            </span>

                                            <span class="badge text-bg-secondary">
                                                {{ itemSubtitle(item) }}
                                            </span>
                                        </div>

                                        <h3 class="h4 fw-bold mb-2">
                                            {{ itemName(item) }}
                                        </h3>

                                        <div class="row g-3 small">
                                            <div class="col-12 col-md-6">
                                                <div class="text-body-secondary">
                                                    {{ itemDetailLabel(item) }}
                                                </div>
                                                <div class="fw-semibold">
                                                    {{ itemDetailValue(item) }}
                                                </div>
                                            </div>

                                            <div class="col-12 col-md-6">
                                                <div class="text-body-secondary">
                                                    {{ itemSecondDetailLabel(item) }}
                                                </div>
                                                <div class="fw-semibold">
                                                    {{ itemSecondDetailValue(item) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-12 col-lg-3">
                                        <div class="card bg-body-tertiary border-0 h-100">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span class="text-body-secondary">Quantity</span>
                                                    <span class="fw-bold">{{ item.count }}</span>
                                                </div>

                                                <div class="d-flex justify-content-between mb-2">
                                                    <span class="text-body-secondary">Price</span>
                                                    <span class="fw-bold">
                                                        {{ formatMoney(item.pricePerItem) }}
                                                    </span>
                                                </div>

                                                <hr>

                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span class="fw-semibold">Subtotal</span>
                                                    <span class="fw-bold fs-5">
                                                        {{ formatMoney(getItemTotal(item)) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card-footer bg-transparent p-4">
                            <div class="row justify-content-end">
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-body-secondary">Net amount</span>
                                        <span class="fw-semibold">{{ formatMoney(netAmount) }}</span>
                                    </div>

                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-body-secondary">VAT 20%</span>
                                        <span class="fw-semibold">{{ formatMoney(vatAmount) }}</span>
                                    </div>

                                    <hr>

                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="h5 fw-bold mb-0">Total</span>
                                        <span class="h4 fw-bold mb-0">
                                            {{ formatMoney(totalAmount) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-2">
                    <div class="receipt-wrapper sticky-xl-top">
                        <div class="receipt-paper">
                            <div class="text-center mb-2">
                                <div class="receipt-title">ФИСКАЛНИ РАЧУН</div>
                                <div class="receipt-small">DECKForge</div>
                                <div class="receipt-small">Online Card Store</div>
                                <div class="receipt-small">Београд, Србија</div>
                            </div>

                            <div class="receipt-line"></div>

                            <div class="receipt-row">
                                <span>Рачун:</span>
                                <strong>{{ invoiceNumber }}</strong>
                            </div>

                            <div class="receipt-row">
                                <span>Касир:</span>
                                <strong>Веб продавница</strong>
                            </div>

                            <div class="receipt-row">
                                <span>Датум:</span>
                                <strong>{{ formatDateTime(invoice.pursTime) }}</strong>
                            </div>

                            <div class="receipt-row">
                                <span>ПФР број:</span>
                            </div>

                            <div class="receipt-break">
                                {{ invoice.pursCounter }}
                            </div>

                            <div class="receipt-line"></div>

                            <div
                                v-for="item in invoiceItems"
                                :key="`receipt-${item.id}`"
                                class="receipt-item"
                            >
                                <div class="receipt-item-title">
                                    {{ itemName(item) }}
                                </div>

                                <div class="receipt-small mb-1">
                                    {{ itemCode(item) }}
                                </div>

                                <div class="receipt-row">
                                    <span>
                                        {{ item.count }} x {{ formatMoney(item.pricePerItem) }}
                                    </span>
                                    <strong>{{ formatMoney(getItemTotal(item)) }}</strong>
                                </div>
                            </div>

                            <div class="receipt-line"></div>

                            <div class="receipt-row">
                                <span>Пореска основица</span>
                                <strong>{{ formatMoney(netAmount) }}</strong>
                            </div>

                            <div class="receipt-row">
                                <span>ПДВ 20%</span>
                                <strong>{{ formatMoney(vatAmount) }}</strong>
                            </div>

                            <div class="receipt-total">
                                <span>УКУПНО</span>
                                <strong>{{ formatMoney(totalAmount) }}</strong>
                            </div>

                            <div class="receipt-row mt-2">
                                <span>Плаћено картицом</span>
                                <strong>{{ formatMoney(totalAmount) }}</strong>
                            </div>

                            <div class="receipt-line"></div>

                            <div class="receipt-small mb-1">
                                ПФР време:
                            </div>

                            <div class="receipt-break">
                                {{ formatDateTime(invoice.pursTime) }}
                            </div>

                            <div class="receipt-small mt-2 mb-1">
                                ПФР ИД:
                            </div>

                            <div class="receipt-break">
                                {{ invoice.pursId }}
                            </div>

                            <div class="text-center mt-3">
                                <img
                                    v-if="qrCodeUrl"
                                    :src="qrCodeUrl"
                                    alt="Fiscal verification QR code"
                                    class="receipt-qr"
                                >

                                <div class="receipt-small mt-2">
                                    Скенирајте QR код за проверу рачуна
                                </div>
                            </div>

                            <div class="receipt-line"></div>

                            <div class="text-center receipt-small">
                                КРАЈ ФИСКАЛНОГ РАЧУНА
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.set-image {
    width: 100%;
    max-height: 220px;
    object-fit: contain;
    background: #fff;
}

.receipt-wrapper {
    top: 1rem;
}

.receipt-paper {
    background: #f8f9fa;
    color: #111;
    border-radius: 0.35rem;
    padding: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 0.68rem;
    line-height: 1.25;
    box-shadow:
        0 0.5rem 1rem rgba(0, 0, 0, 0.35),
        inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.receipt-title {
    font-weight: 800;
    font-size: 0.85rem;
    letter-spacing: 0.03em;
}

.receipt-small {
    font-size: 0.62rem;
    color: #333;
}

.receipt-line {
    border-top: 1px dashed #444;
    margin: 0.55rem 0;
}

.receipt-row {
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
    margin-bottom: 0.25rem;
}

.receipt-row span {
    min-width: 0;
}

.receipt-row strong {
    text-align: right;
    font-weight: 800;
}

.receipt-item {
    margin-bottom: 0.55rem;
}

.receipt-item-title {
    font-weight: 800;
    margin-bottom: 0.2rem;
    word-break: break-word;
}

.receipt-total {
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 900;
    margin-top: 0.4rem;
}

.receipt-break {
    word-break: break-all;
    overflow-wrap: anywhere;
    font-size: 0.62rem;
    font-weight: 700;
}

.receipt-qr {
    width: 100%;
    max-width: 150px;
    background: #fff;
    padding: 0.25rem;
    border-radius: 0.25rem;
}

@media (max-width: 1199.98px) {
    .receipt-paper {
        max-width: 360px;
        margin-inline: auto;
        font-size: 0.75rem;
    }

    .receipt-small,
    .receipt-break {
        font-size: 0.68rem;
    }
}
</style>
