    <script setup lang="ts">
        import Loading from '@/components/Loading.vue';
        import { getSetImage, setFallbackImage } from '@/helpers/image';
        import type { SetModel } from '@/models/set.model';
        import { DataService } from '@/services/data.service';
        import { computed, onMounted, ref, watch } from 'vue';

        const sets = ref<SetModel[]>([])
        const loading = ref(false)
        const totalResults = ref(0)
        const search = ref('')
        const currentPage = ref(1)
        const PAGE_SIZE = 18
        const totalPages = computed(() =>
            Math.ceil(totalResults.value / PAGE_SIZE)
        )
        
        async function loadSets() {
            loading.value = true

            try {
                const offset = ((currentPage.value - 1) * PAGE_SIZE)

                const rsp = await DataService.getSets(search.value, offset)
                
                sets.value = rsp.data.sets
                totalResults.value = rsp.data.total
            } finally {
                loading.value = false
            }
        }

        function nextPage() {
            currentPage.value++
        }

        function previousPage() {
            if (currentPage.value > 1) {
                currentPage.value--
            }
        }

        watch(search, () => {
            currentPage.value = 1
        })

        watch(currentPage, loadSets)

        onMounted(loadSets)
    </script>

    <template>
        <section class="banner d-flex justify-content-center align-items-center">
            <div class="text-center">
                <h1 class="display-3 fw-bold text-white">
                    Yu-Gi-Oh! Shop
                </h1>
                <p class="lead text-white">
                    Explore cards, sets and build your collection
                </p>
            </div>
        </section>
        <div class="container mt-3 mb-3 page-content">
            <div class="d-flex mb-3 align-items-center justify-content-center controls">
                <div class="search-wrapper">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input v-model="search" @input="loadSets" type="text" class="form-control search-bar" placeholder="Search sets...">
                </div>
            </div>
            <div class="d-flex flex-wrap gap-1 justify-content-center" v-if="sets.length > 0">
                <RouterLink
                    v-for="set in sets"
                    :key="set.set_name"
                    :to="`/set/${set.set_name}`"
                    class="card text-center text-decoration-none text-reset set-card"
                >
                    <div class="set-image-container">
                        <img
                            :src="getSetImage(set.set_code)"
                            class="card-img-top set-image"
                            :alt="set.set_name"
                            @error="(e) => setFallbackImage(e)"
                        >
                    </div>

                    <div class="card-body">
                        <h5 class="card-title">{{ set.set_name }}</h5>
                        <h6 class="card-subtitle mb-2 text-body-secondary">
                            {{ set.tcg_date }}
                        </h6>
                        <h4 class="card-subtitle mb-2 text-body-secondary">
                            {{ set.set_price }} €
                        </h4>
                    </div>
                </RouterLink>
            </div>
            <div v-else-if="loading" class="empty-state">
                <Loading />
            </div>
            <div v-else class="empty-state">
                <h4>No matching sets found</h4>
            </div>
            <div class="d-flex gap-2 justify-content-center align-items-center mt-4" v-if="sets.length > 0">
                <button
                    class="btn btn-outline-primary text-nowrap"
                    @click="previousPage"
                    :disabled="currentPage === 1"
                >
                    <i class="fa-solid fa-arrow-left"></i>
                </button>

                <span class="text-nowrap">
                    Page {{ currentPage }}/{{ totalPages }} of {{ totalResults }} total sets
                </span>

                <button
                    class="btn btn-outline-primary text-nowrap"
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                >
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    </template>

    <style scoped>
        .page-content {
            display: flex;
            flex-direction: column;
            flex: 1
        }

        .banner {
        height: 53vh;

        background:
            linear-gradient(
                rgba(0,0,0,0.5),
                rgba(0,0,0,0.5)
            ),
            url('/egyptian_gods_banner.jpg');

        background-size: cover;
        background-position: center;
        }

        .controls {
            gap: 5rem
        }

        .search-wrapper {
            position: relative;
        }

        .search-icon {
            position: absolute;

            left: 12px;
            top: 50%;

            transform: translateY(-50%);

            color: gray;
        }

        .search-bar {
            width: 300px;
            padding-left: 2.5rem;
        }

        .content {
            flex: 1
        }
        
        
        .set-image-container {
            height: 180px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .set-image {
            max-height: 140px;
            max-width: fit-content;
            justify-self: center;
            width: 90%;
            object-fit: contain;
        }

        .set-card {
            width: 12rem;
            height: 24rem;
            display: flex;
            flex-direction: column;
            transition: transform 0.2s ease,
                        box-shadow 0.2s ease;
        }

        .set-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
        }

        .empty-state {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

    </style>
