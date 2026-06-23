<script setup lang="ts">
    import Loading from '@/components/Loading.vue'
    import type { CardModel } from '@/models/card.model'
    import type { SetModel } from '@/models/set.model'
    import { CardService } from '@/services/card.service'
    import { SetService } from '@/services/set.service'
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id

const card = ref<CardModel>()
const sets = ref<SetModel[]>([]) 

const loading = ref(false)

async function loadCard() {
    loading.value = true

    try {
        const rsp = await CardService.getCardById(Number(id))
        card.value = rsp.data

        for(const set of card.value?.card_sets ?? []) {
            const rsp = await SetService.getSetByName(set.setName)
            sets.value.push(rsp.data.set_details)
            sets.value = sets.value.filter(
                (set, index, self) => index === self.findIndex(s => s.setName === set.setName)
            )
        }
    } finally {
        loading.value = false
    }
}

onMounted(loadCard)
</script>

<template>
    <Loading v-if="loading"/>

    <div v-else class="container py-4">

        <section class="card-details p-4 mb-4">
            <div class="row g-4 align-items-start">
                <div class="col-lg-3 text-center">
                    <img :src="`http://localhost:3300/images/cards/${card?.id}.jpg`" :alt="card?.name" class="img-fluid rounded shadow card-image">
                </div>
                <div class="col-lg-9">
                    <p class="text-muted text-uppercase mb-1">
                        Yu-Gi-Oh Card
                    </p>
                    <h1 class="display-5 fw-bold mb-4">
                        {{ card?.name }}
                    </h1>
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <th>Type</th>
                                <td>{{ card?.type }}</td>
                            </tr>
                            <tr>
                                <th>Typing</th>
                                <td>{{ card?.race }}</td>
                            </tr>
                            <tr v-if="card?.attribute">
                                <th>Attribute</th>
                                <td>{{ card.attribute }}</td>
                            </tr>
                            <tr v-if="card?.archetype">
                                <th>Archetype</th>
                                <td>{{ card.archetype }}</td>
                            </tr>
                            <tr v-if="card?.level">
                                <th>Level</th>
                                <td>{{ card.level }}</td>
                            </tr>
                            <tr v-if="card?.atk">
                                <th>ATK</th>
                                <td>{{ card.atk }}</td>
                            </tr>
                            <tr v-if="card?.def">
                                <th>DEF</th>
                                <td>{{ card.def }}</td>
                            </tr>
                            <tr v-if="card?.linkval">
                                <th>Link Rating</th>
                                <td>{{ card.linkval }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <section class="p-4 mb-4">
            <h3 class="mb-3">
                Description
            </h3>
            <p class="description mb-0">
                {{ card?.description }}
            </p>
        </section>
        <section class="sets-section p-4" v-if="card?.card_sets?.length">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">
                    Available In Sets
                </h3>
                <span class="text-muted small">
                    {{ sets.length }} sets
                </span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Set</th>
                            <th>Code</th>
                            <th>Price</th>
                            <th class="text-end">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="set in sets" :key="set.setCode">
                            <td class="fw-semibold">
                                {{ set.setName }}
                            </td>
                            <td>
                                <span class="badge text-bg-secondary">
                                    {{ set.setCode }}
                                </span>
                            </td>
                            <td>
                                {{ Number(set.price).toFixed(2) }} €
                            </td>
                            <td class="text-end">
                                <RouterLink
                                    :to="`/set/${set.setName}`"
                                    class="btn btn-sm btn-outline-primary"
                                >
                                    View Details
                                </RouterLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<style scoped>
.card-details {
    background: white;
}

.card-image {
    width: 100%;
    max-width: 250px;

    transition: .2s;
}

.card-image:hover {
    transform: translateY(-4px);
}

.description {
    white-space: pre-line;
    line-height: 1.7;
}
</style>
