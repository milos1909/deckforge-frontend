import { computed, ref } from "vue"

export function usePagination(pageSize: number) {
    const currentPage = ref(1)
    const totalResults = ref(0)
    const totalPages = computed(() =>
        Math.max(1, Math.ceil(totalResults.value / pageSize))
    )
    const offset = computed(() =>
        (currentPage.value - 1) * pageSize
    )

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

    return {
        pageSize,
        offset,
        currentPage,
        totalResults,
        totalPages,
        nextPage,
        previousPage
    }
}