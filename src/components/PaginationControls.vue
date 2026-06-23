<script setup lang="ts">
defineProps<{
    currentPage: number
    totalPages: number
    totalResults: number
}>()

defineEmits<{
    previous: []
    next: []
}>()
</script>

<template>
    <div class="pagination-controls">
        <button
            class="btn btn-outline-primary btn-sm"
            @click="$emit('previous')"
            :disabled="currentPage === 1"
        >
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <span class="small text-secondary">
            Page {{ currentPage }}/{{ totalPages }} - {{ totalResults }} results
        </span>

        <button
            class="btn btn-outline-primary btn-sm"
            @click="$emit('next')"
            :disabled="currentPage >= totalPages"
        >
            <i class="fa-solid fa-arrow-right"></i>
        </button>
    </div>
</template>

<style scoped>
.pagination-controls {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

@media (max-width: 575.98px) {
    .pagination-controls {
        width: 100%;
    }
}
</style>
