<script setup lang="ts">
import { getCardImage, setFallbackImage } from '@/helpers/image'
import { formatCardStatValue, getAttributeIcon, getRaceIcon } from '@/helpers/card'
import { formatDisplayDate } from '@/helpers/date'
import type { CardModel } from '@/models/card.model'
import { computed, ref } from 'vue'

const props = defineProps<{
  card: CardModel
}>()

const visible = ref(false)
const tooltipStyle = ref({
  left: '0px',
  top: '0px'
})

const statLine = computed(() => {
  const stats: string[] = []
  const isLinkMonster = props.card.type.includes('Link')

  if (props.card.atk != null) stats.push(`ATK/${formatCardStatValue('ATK', props.card.atk)}`)
  if (!isLinkMonster && props.card.def != null) stats.push(`DEF/${formatCardStatValue('DEF', props.card.def)}`)
  if (props.card.linkval != null) stats.push(`Link-${props.card.linkval}`)

  return stats.join(' ')
})

const raceIcon = computed(() => {
  return getRaceIcon(props.card.race)
})

const attributeIcon = computed(() => {
  return getAttributeIcon(props.card.attribute)
})

const showLevel = computed(() => {
  return !props.card.type.includes('Link') && props.card.level != null
})

const releaseDate = computed(() => {
  return formatDisplayDate(props.card.tcgDate, '')
})

const cardPrice = computed(() => {
  const price = Number(props.card.cardmarketPrice ?? 0)

  return price > 0 ? price.toFixed(2) : ''
})

function hideBrokenIcon(event: Event) {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}

function showTooltip(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const tooltipWidth = 540
  const gap = 12
  const left = rect.right + tooltipWidth + gap > window.innerWidth
    ? rect.left - tooltipWidth - gap
    : rect.right + gap

  tooltipStyle.value = {
    left: `${Math.max(gap, left)}px`,
    top: `${Math.max(gap, rect.top)}px`
  }

  visible.value = true
}

function hideTooltip() {
  visible.value = false
}
</script>

<template>
  <span class="card-tooltip-target" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot />
  </span>

  <Teleport to="body">
    <div v-if="visible" class="card-tooltip bg-dark" :style="tooltipStyle">
      <div class="tooltip-media">
        <img class="tooltip-image" :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />

        <div v-if="cardPrice || releaseDate" class="tooltip-market-meta">
          <span v-if="cardPrice">{{ cardPrice }} €</span>
          <span v-if="releaseDate">{{ releaseDate }}</span>
        </div>
      </div>

      <div class="tooltip-details">
        <div class="tooltip-heading">
          <div class="tooltip-title-block">
            <strong>{{ card.name }}</strong>
            <span class="tooltip-type-line">
              [{{ card.race }}<img v-if="raceIcon" :src="raceIcon" :alt="card.race" class="race-icon" @error="hideBrokenIcon">/{{ card.type }}]
            </span>
          </div>

          <div v-if="card.attribute || showLevel" class="tooltip-meta-block">
            <span v-if="card.attribute" class="tooltip-meta-item">
              <img :src="attributeIcon!" :alt="card.attribute" @error="hideBrokenIcon">
              {{ card.attribute }}
            </span>

            <span v-if="showLevel" class="tooltip-meta-item">
              <img src="/level.png" alt="Level" @error="hideBrokenIcon">
              {{ card.level }}
            </span>
          </div>
        </div>

        <div v-if="statLine" class="tooltip-stats">
          {{ statLine }}
        </div>

        <p>{{ card.description }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.card-tooltip-target {
  display: block;
  min-width: 0;
}

.card-tooltip {
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
  max-width: 540px;
  max-height: calc(100vh - 24px);
  overflow-y: auto;
  padding: 1rem 1.05rem;
  pointer-events: none;
  position: fixed;
  text-align: left;
  width: 540px;
  z-index: 2000;
}

.tooltip-media {
  flex: 0 0 auto;
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  width: 154px;
}

.tooltip-image {
  height: auto;
  width: 100%;
}

.tooltip-market-meta {
  color: #cbd5e1;
  display: grid;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 0.15rem;
  line-height: 1.2;
  text-align: center;
}

.tooltip-market-meta span:first-child {
  color: #ffffff;
}

.tooltip-details {
  display: grid;
  gap: 0.7rem;
  min-width: 0;
}

.tooltip-heading {
  align-items: start;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.tooltip-heading strong {
  color: #ffffff;
  font-size: 1.02rem;
  font-weight: 800;
  line-height: 1.25;
}

.tooltip-stats {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e5e7eb;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.25;
  padding: 0.35rem 0.5rem;
  width: fit-content;
}

.tooltip-title-block {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.tooltip-type-line {
  align-items: center;
  color: #b8c2d2;
  display: inline-flex;
  flex-wrap: wrap;
  font-size: 0.8rem;
  gap: 0.15rem;
  line-height: 1.35;
}

.race-icon {
  height: 14px;
  width: 14px;
  object-fit: contain;
}

.tooltip-meta-block {
  align-items: flex-end;
  color: #d8dee8;
  display: grid;
  flex: 0 0 auto;
  font-size: 0.78rem;
  font-weight: 600;
  gap: 0.3rem;
  justify-items: end;
  line-height: 1.2;
  text-align: right;
  padding-top: 0.05rem;
}

.tooltip-meta-item {
  align-items: center;
  display: inline-flex;
  gap: 0.25rem;
  white-space: nowrap;
}

.tooltip-meta-item img {
  height: 16px;
  object-fit: contain;
  width: 16px;
}

.tooltip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tooltip-chips span {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: #e5e7eb;
  font-size: 0.72rem;
  line-height: 1;
  padding: 0.3rem 0.45rem;
}

.card-tooltip p {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #eef2f7;
  font-size: 0.82rem;
  line-height: 1.58;
  margin: 0;
  padding-top: 0.65rem;
  white-space: pre-line;
}

@media (max-width: 575.98px) {
  .card-tooltip {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }

  .tooltip-image {
    width: 100%;
  }

  .tooltip-media {
    width: 96px;
  }
}
</style>
