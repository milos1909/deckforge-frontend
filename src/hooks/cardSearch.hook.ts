import type { CardModel } from "@/models/card.model"
import  { DataService } from "@/services/data.service"
import { ref, computed } from "vue"

export function useCardSearch(pageSize: number) {
    const cards = ref<CardModel[]>([])
    const loading = ref(false)
    const currentPage = ref(1)
    const totalResults = ref(0)

    const totalPages = computed(() =>
        Math.max(1, Math.ceil(totalResults.value / pageSize))
    )
   
    const search = ref('')
    const selectedType = ref('')
    const selectedArchetype = ref('')
    const selectedRace = ref('')
    const selectedAttribute = ref('')
    const selectedLevel = ref<number | ''>('')
    const selectedLinkval = ref<number | ''>('')
    const selectedScale = ref<number | ''>('')
    const selectedSortBy = ref('')
    const selectedSortDirection = ref<'ASC' | 'DESC'>('ASC')

    const showAdvancedFilters = ref(false)
    
    const cardTypes = ref<string[]>([])
    const archetypes = ref<string[]>([])
    const races = ref<string[]>([])
    const attributes = ref<string[]>([])
    const levels = computed(() => Array.from({ length: 12 }, (_, index) => index + 1))
    const linkValues = computed(() => Array.from({ length: 6 }, (_, index) => index + 1))
    const scales = computed(() => Array.from({ length: 13 }, (_, index) => index))

    const hasSelectedType = computed(() => selectedType.value !== '')
    const isMonster = computed(() => selectedType.value.includes('Monster'))
    const isLink = computed(() => selectedType.value.includes('Link'))
    const isPendulum = computed(() => selectedType.value.includes('Pendulum'))
    const isSimpleType = computed(() =>
        selectedType.value.includes('Spell') ||
        selectedType.value.includes('Trap') ||
        selectedType.value.includes('Skill')
    )

    const sortOptions = computed(() => ['name', 'tcgDate', 'atk', 'def'])

    function sortOptionLabel(sortOption: string) {
        if (sortOption === 'name') return 'Name'
        if (sortOption === 'tcgDate') return 'Release date'
        
        return sortOption.toUpperCase()
    }

    
    async function loadCards() {
        loading.value = true

        try {
            const offset = ((currentPage.value - 1) * pageSize)
            
            const rsp = await DataService.getCards(search.value, pageSize, offset, activeFilters())

            cards.value = rsp.data.cards
            totalResults.value = rsp.data.total  
        } finally {
            loading.value = false
        }
    }

    function activeFilters() {
        return {
            type: selectedType.value || undefined,
            archetype: selectedArchetype.value || undefined,
            race: selectedRace.value || undefined,
            attribute: selectedAttribute.value || undefined,
            level: selectedLevel.value || undefined,
            linkval: selectedLinkval.value || undefined,
            scale: selectedScale.value || undefined,
            sortBy: selectedSortBy.value || undefined,
            sortDirection: selectedSortBy.value ? selectedSortDirection.value : undefined
        }
    }

    async function loadFilterOptions() {
        const [typesRsp, archetypesRsp, attributesRsp] = await Promise.allSettled([
            DataService.getCardTypes(),
            DataService.getCardArchetypes(),
            DataService.getCardAttributes()
        ])

        if (typesRsp.status === 'fulfilled') {
            cardTypes.value = typesRsp.value.data
        }

        if (archetypesRsp.status === 'fulfilled') {
            archetypes.value = archetypesRsp.value.data
        }

        if (attributesRsp.status === 'fulfilled') {
            attributes.value = attributesRsp.value.data
        }
    }

    async function loadRaces() {
        races.value = []

        if (!selectedType.value) return

        try {
            const rsp = await DataService.getCardRaces(selectedType.value)
            races.value = rsp.data
        } catch (e) {
            races.value = []
        }
    }

    async function applyFilters() {
        if (currentPage.value !== 1) {
            currentPage.value = 1
            return
        }

        await loadCards()
    }

    async function resetFilters() {
        search.value = ''
        selectedType.value = ''
        selectedArchetype.value = ''
        selectedRace.value = ''
        selectedAttribute.value = ''
        selectedLevel.value = ''
        selectedLinkval.value = ''
        selectedScale.value = ''
        selectedSortBy.value = ''
        selectedSortDirection.value = 'DESC'
        showAdvancedFilters.value = false
        races.value = []
        
        if (currentPage.value !== 1) {
            currentPage.value = 1
            return
        }

        await loadCards()
    }

    function resetTypeSpecificFilters() {
        selectedRace.value = ''
        selectedAttribute.value = ''
        selectedLevel.value = ''
        selectedLinkval.value = ''
        selectedScale.value = ''
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

    return {
        cards,
        loading,
        currentPage,
        totalResults,
        totalPages,

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
        isSimpleType,
        sortOptions,
        sortOptionLabel,

        loadCards,
        loadFilterOptions,
        loadRaces,
        applyFilters,
        resetFilters,
        resetTypeSpecificFilters,
        nextPage,
        previousPage
    }
}
