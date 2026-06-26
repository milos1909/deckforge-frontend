<script lang="ts" setup>
import DeckPreviewCard from '@/components/DeckPreviewCard.vue'
import Loading from '@/components/Loading.vue'
import { useAuth } from '@/hooks/auth.hook'
import type { InvoiceModel } from '@/models/invoice.model'
import type { UserModel } from '@/models/user.model'
import { UserService } from '@/services/user.service'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { auth } = useAuth()

const user = ref<UserModel | null>(null)
const loading = ref(true)
const loadError = ref(false)

const decks = computed(() => user.value?.decks ?? [])
const invoices = computed(() => user.value?.invoices ?? [])
const totalSpent = computed(() =>
    invoices.value.reduce((total, invoice) => total + getInvoiceTotal(invoice), 0)
)

function getInvoiceTotal(invoice: InvoiceModel) {
    return (invoice.invoiceItems ?? []).reduce((total, item) => {
        return total + item.pricePerItem * item.count
    }, 0)
}

function getInvoiceItemCount(invoice: InvoiceModel) {
    return (invoice.invoiceItems ?? []).reduce((total, item) => total + item.count, 0)
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR'
    }).format(value)
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(value))
}

onMounted(async () => {
    if (!auth.value) {
        await router.replace('/login')
        return
    }

    try {
        const rsp = await UserService.getProfile()
        user.value = rsp.data
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="profile-page">
        <div v-if="loading" class="profile-state">
            <Loading />
        </div>

        <div v-else-if="loadError || !user" class="profile-state">
            <div class="text-center">
                <i class="fa-solid fa-circle-exclamation state-icon"></i>
                <h1 class="h4 fw-bold">Profile could not be loaded</h1>
                <p class="text-secondary mb-0">Please refresh the page and try again.</p>
            </div>
        </div>

        <template v-else>
            <section class="profile-overview">
                <div class="container profile-overview-inner">
                    <div class="identity-block">
                        <div class="profile-avatar" aria-hidden="true">
                            {{ user.username.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                            <p class="section-label mb-1">My account</p>
                            <h1 class="h2 fw-bold mb-1">{{ user.username }}</h1>
                            <p class="text-secondary mb-0">{{ user.email }}</p>
                        </div>
                    </div>

                    <div class="profile-stats">
                        <div class="profile-stat">
                            <strong>{{ decks.length }}</strong>
                            <span>Decks</span>
                        </div>
                        <div class="profile-stat">
                            <strong>{{ invoices.length }}</strong>
                            <span>Invoices</span>
                        </div>
                        <div class="profile-stat">
                            <strong>{{ formatCurrency(totalSpent) }}</strong>
                            <span>Total spent</span>
                        </div>
                    </div>
                </div>
            </section>

            <main class="container profile-content">
                <section class="profile-section">
                    <div class="section-heading">
                        <div>
                            <p class="section-label mb-1">Collection</p>
                            <h2 class="h4 fw-bold mb-0">My Decks</h2>
                        </div>
                        <RouterLink to="/deckbuilder" class="btn btn-primary btn-sm">
                            <i class="fa-solid fa-plus"></i>
                            New deck
                        </RouterLink>
                    </div>

                    <div v-if="decks.length" class="deck-list">
                        <DeckPreviewCard
                            v-for="deck in decks"
                            :key="deck.id"
                            :deck="deck"
                            date-label="Updated"
                            :date-value="deck.updatedAt || deck.createdAt"
                            show-visibility
                        />
                    </div>

                    <div v-else class="empty-section">
                        <i class="fa-solid fa-layer-group"></i>
                        <div>
                            <h3 class="h6 fw-bold mb-1">No saved decks yet</h3>
                            <p class="text-secondary mb-0">Your saved decks will appear here.</p>
                        </div>
                    </div>
                </section>

                <section class="profile-section">
                    <div class="section-heading">
                        <div>
                            <p class="section-label mb-1">Purchase history</p>
                            <h2 class="h4 fw-bold mb-0">Invoices</h2>
                        </div>
                    </div>

                    <div v-if="invoices.length" class="invoice-table-wrap">
                        <table class="table invoice-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Paid at</th>
                                    <th>Items</th>
                                    <th class="text-end">Total</th>
                                    <th class="invoice-action-column"><span class="visually-hidden">Open</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="invoice in invoices" :key="invoice.id">
                                    <td class="fw-semibold">#{{ String(invoice.id).padStart(6, '0') }}</td>
                                    <td>{{ formatDate(invoice.pursTime) }}</td>
                                    <td>{{ getInvoiceItemCount(invoice) }}</td>
                                    <td class="text-end fw-bold">{{ formatCurrency(getInvoiceTotal(invoice)) }}</td>
                                    <td class="text-end">
                                        <RouterLink
                                            :to="`/invoice/${invoice.id}`"
                                            class="btn btn-outline-primary btn-sm invoice-link"
                                            :aria-label="`Open invoice ${invoice.id}`"
                                            title="Open invoice"
                                        >
                                            <i class="fa-solid fa-arrow-right"></i>
                                        </RouterLink>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else class="empty-section">
                        <i class="fa-solid fa-file-invoice"></i>
                        <div>
                            <h3 class="h6 fw-bold mb-1">No invoices yet</h3>
                            <p class="text-secondary mb-0">Completed purchases will appear here.</p>
                        </div>
                    </div>
                </section>
            </main>
        </template>
    </div>
</template>

<style scoped>
.profile-page {
    background: #f5f6f8;
    flex: 1;
}

.profile-state {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 520px;
}

.state-icon {
    color: #64748b;
    font-size: 2rem;
    margin-bottom: 0.75rem;
}

.profile-overview {
    background: #ffffff;
    border-bottom: 1px solid #dfe4ec;
}

.profile-overview-inner {
    align-items: center;
    display: flex;
    gap: 2rem;
    justify-content: space-between;
    padding-bottom: 2rem;
    padding-top: 2rem;
}

.identity-block {
    align-items: center;
    display: flex;
    gap: 1rem;
    min-width: 0;
}

.profile-avatar {
    align-items: center;
    background: #212529;
    border-radius: 6px;
    color: #ffffff;
    display: flex;
    flex: 0 0 64px;
    font-size: 1.65rem;
    font-weight: 800;
    height: 64px;
    justify-content: center;
}

.section-label {
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
}

.profile-stats {
    align-items: stretch;
    display: flex;
}

.profile-stat {
    border-left: 1px solid #dfe4ec;
    display: flex;
    flex-direction: column;
    min-width: 120px;
    padding: 0.35rem 1.25rem;
}

.profile-stat strong {
    color: #172033;
    font-size: 1.1rem;
}

.profile-stat span {
    color: #64748b;
    font-size: 0.8rem;
}

.profile-content {
    padding-bottom: 3rem;
    padding-top: 2rem;
}

.profile-section + .profile-section {
    border-top: 1px solid #dfe4ec;
    margin-top: 2.5rem;
    padding-top: 2.5rem;
}

.section-heading {
    align-items: center;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.deck-list {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.paid-badge {
    align-items: center;
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 700;
    gap: 0.35rem;
}

.empty-section {
    align-items: center;
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    display: flex;
    gap: 0.85rem;
    min-height: 110px;
    padding: 1.25rem;
}

.empty-section > i {
    color: #64748b;
    font-size: 1.5rem;
}

.invoice-table-wrap {
    background: #ffffff;
    border: 1px solid #dfe4ec;
    border-radius: 6px;
    overflow-x: auto;
}

.invoice-table th,
.invoice-table td {
    padding: 0.9rem 1rem;
    white-space: nowrap;
}

.invoice-table thead th {
    background: #f8fafc;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
}

.invoice-action-column {
    width: 54px;
}

.paid-badge {
    background: #dcfce7;
    border-radius: 4px;
    color: #166534;
    padding: 0.25rem 0.5rem;
}

.invoice-link {
    align-items: center;
    display: inline-flex;
    height: 30px;
    justify-content: center;
    padding: 0;
    width: 32px;
}

@media (max-width: 991.98px) {
    .profile-overview-inner {
        align-items: flex-start;
        flex-direction: column;
    }

    .profile-stats {
        width: 100%;
    }

    .profile-stat {
        flex: 1;
    }

    .deck-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 575.98px) {
    .profile-overview-inner,
    .profile-content {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .profile-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .profile-stat {
        min-width: 0;
        padding: 0.5rem 0.75rem;
    }

    .profile-stat:last-child {
        grid-column: 1 / -1;
    }

    .deck-list {
        grid-template-columns: 1fr;
    }

}
</style>
