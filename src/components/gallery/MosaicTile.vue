<script setup lang="ts">
defineProps<{
  imageUrl: string
  imageAlt: string
  isWide?: boolean
  isFullSpan?: boolean
}>()
</script>

<template>
  <div
    :class="{
      'wide-image': isWide,
      'full-span': isFullSpan
    }"
    class="group relative overflow-hidden rounded-lg hover:cursor-help focus-within:ring-2 focus-within:ring-indigo-500"
  >
    <img
      :src="imageUrl"
      :alt="imageAlt"
      loading="lazy"
      class="mosaic-image transition-opacity group-hover:opacity-50 group-focus-within:opacity-50"
    />
    <slot />
  </div>
</template>

<style scoped>
.mosaic-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wide-image {
  grid-column: span 2 / auto;
}

.full-span {
  grid-column: span 4 / auto;
}

@media (max-width: 640px) {
  .wide-image,
  .full-span {
    grid-column: span 1 / auto;
  }
}
</style>
