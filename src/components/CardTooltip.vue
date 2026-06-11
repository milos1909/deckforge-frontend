<script setup lang="ts">
import { getCardImage, setFallbackImage } from '@/helpers/image'
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

  if (props.card.attribute) stats.push(props.card.attribute)
  if (props.card.level) stats.push(`Level ${props.card.level}`)
  if (props.card.linkval) stats.push(`Link ${props.card.linkval}`)
  if (props.card.atk !== null) stats.push(`ATK ${props.card.atk}`)
  if (props.card.def !== null) stats.push(`DEF ${props.card.def}`)

  return stats.join(' / ')
})

const detailChips = computed(() => {
  return [
    props.card.race,
    props.card.archetype
  ].filter(Boolean)
})

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
      <img class="tooltip-image" :src="getCardImage(card.id)" :alt="card.name" @error="setFallbackImage" />

      <div class="tooltip-details">
        <div class="tooltip-heading">
          <strong>{{ card.name }}</strong>
          <span>{{ card.type }}</span>
        </div>

        <div v-if="statLine" class="tooltip-stats">
          {{ statLine }}
        </div>

        <div v-if="detailChips.length" class="tooltip-chips">
          <span v-for="detail in detailChips" :key="detail">{{ detail }}</span>
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
  gap: 1rem;
  max-width: 540px;
  max-height: calc(100vh - 24px);
  overflow-y: auto;
  padding: 1rem;
  pointer-events: none;
  position: fixed;
  text-align: left;
  width: 540px;
  z-index: 2000;
}

.tooltip-image {
  height: auto;
  width: 154px;
}

.tooltip-details {
  display: grid;
  gap: 0.55rem;
  min-width: 0;
}

.tooltip-heading {
  display: grid;
  gap: 0.2rem;
}

.tooltip-heading strong {
  color: #ffffff;
  font-size: 0.95rem;
  line-height: 1.2;
}

.tooltip-heading span,
.tooltip-stats {
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.3;
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
  color: #e5e7eb;
  font-size: 0.78rem;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 575.98px) {
  .card-tooltip {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }

  .tooltip-image {
    flex-basis: 96px;
    width: 96px;
  }
}
</style>
