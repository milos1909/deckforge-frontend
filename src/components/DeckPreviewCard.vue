<script setup lang="ts">
import { formatDisplayDate } from '@/helpers/date'
import { getCroppedCardImage } from '@/helpers/image'
import { DECK_TYPE_LABELS } from '@/models/deck.model'
import type { DeckSummaryModel } from '@/models/deck.model'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    deck: DeckSummaryModel
    dateLabel?: string
    dateValue?: string | null
    showDescription?: boolean
    showVisibility?: boolean
}>(), {
    dateLabel: 'Updated',
    dateValue: null,
    showDescription: false,
    showVisibility: false
})

const displayDate = computed(() => props.dateValue || props.deck.updatedAt || props.deck.createdAt)

function formatViews(value: number | undefined) {
    const count = value ?? 0
    return `${count.toLocaleString()} ${count === 1 ? 'view' : 'views'}`
}

function hideBrokenCover(event: Event) {
    const image = event.target as HTMLImageElement
    image.style.display = 'none'
}
</script>

<template>
    <RouterLink :to="`/deck/${deck.id}`" class="deck-preview-card">
        <img
            v-if="deck.coverCardId"
            :src="getCroppedCardImage(deck.coverCardId)"
            :alt="`${deck.name} cover`"
            class="deck-cover"
            @error="hideBrokenCover"
        >

        <div class="deck-cover-shade"></div>

        <div v-if="showVisibility" class="deck-card-topline">
            <span class="visibility-badge">
                <i :class="deck.isPublic ? 'fa-solid fa-earth-americas' : 'fa-solid fa-lock'"></i>
                {{ deck.isPublic ? 'Public' : 'Private' }}
            </span>
        </div>

        <span v-if="deck.type" class="deck-type-badge" :class="`deck-type-${deck.type}`">
            {{ DECK_TYPE_LABELS[deck.type] }}
        </span>

        <div class="deck-card-content">
            <h2>{{ deck.name }}</h2>

            <template v-if="showDescription">
                <p v-if="deck.description">{{ deck.description }}</p>
                <p v-else>No description has been added yet.</p>
            </template>

            <div class="deck-card-meta">
                <span>
                    {{ dateLabel }} {{ formatDisplayDate(displayDate) }}
                </span>
                <span>
                    <i class="fa-solid fa-eye"></i>
                    {{ formatViews(deck.viewCount) }}
                </span>
            </div>
        </div>
    </RouterLink>
</template>

<style scoped>
.deck-preview-card {
    aspect-ratio: 1.75;
    background: #212529;
    border: 1px solid #cfd6e0;
    border-radius: 6px;
    color: #ffffff;
    display: block;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    transition: box-shadow 0.18s, transform 0.18s;
}

.deck-preview-card:hover {
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
    transform: translateY(-2px);
}

.deck-cover {
    height: 100%;
    inset: 0;
    object-fit: cover;
    object-position: center 30%;
    position: absolute;
    width: 100%;
}

.deck-cover-shade {
    background: linear-gradient(to bottom, rgba(9, 14, 23, 0.1) 18%, rgba(9, 14, 23, 0.92) 100%);
    inset: 0;
    position: absolute;
}

.deck-card-topline {
    left: 0.75rem;
    position: absolute;
    top: 0.75rem;
}

.visibility-badge {
    align-items: center;
    background: rgba(15, 23, 42, 0.82);
    border-radius: 4px;
    color: #ffffff;
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 700;
    gap: 0.35rem;
    padding: 0.3rem 0.5rem;
}

.deck-type-badge {
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.3rem 0.5rem;
    position: absolute;
    right: 0.75rem;
    top: 0.75rem;
}

.deck-type-meta {
    background: #9f1239;
}

.deck-type-rogue {
    background: #0f766e;
}

.deck-type-casual {
    background: #475569;
}

.deck-type-anime {
    background: #6d28d9;
}

.deck-card-content {
    bottom: 0;
    left: 0;
    padding: 1rem;
    position: absolute;
    right: 0;
}

.deck-card-content h2 {
    font-size: 1.08rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    overflow-wrap: anywhere;
}

.deck-card-content p {
    color: #d8dee8;
    display: -webkit-box;
    font-size: 0.82rem;
    margin-bottom: 0.55rem;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.deck-card-meta {
    align-items: center;
    color: #e8edf5;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.75rem;
    gap: 0.75rem;
    justify-content: space-between;
}

@media (max-width: 575.98px) {
    .deck-preview-card {
        aspect-ratio: 1.75;
    }
}
</style>
