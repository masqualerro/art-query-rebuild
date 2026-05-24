<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type MasonryGalleryItem = {
  id: string
  imageUrl: string
  imageAlt: string
} & Record<string, any>

const props = defineProps<{
  items: MasonryGalleryItem[]
  canLoadMore?: boolean
  loadingMore?: boolean
  requireScrollBeforeLoadMore?: boolean
}>()

defineSlots<{
  default(props: { item: any }): any
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const loadedIds = ref(new Set<string>())
const sentinel = ref<HTMLElement | null>(null)
const hasScrolled = ref(false)
let observer: IntersectionObserver | null = null

function markLoaded(id: string) {
  loadedIds.value = new Set(loadedIds.value).add(id)
}

function disconnectObserver() {
  observer?.disconnect()
  observer = null
}

function observeSentinel() {
  disconnectObserver()

  if (!props.canLoadMore || !sentinel.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (
        entry.isIntersecting &&
        props.canLoadMore &&
        !props.loadingMore &&
        (!props.requireScrollBeforeLoadMore || hasScrolled.value)
      ) {
        emit('loadMore')
      }
    },
    { rootMargin: '600px 0px' }
  )

  observer.observe(sentinel.value)
}

function handleScroll() {
  if (window.scrollY > 80) {
    hasScrolled.value = true
  }
}

watch(
  () => props.items.map((item) => item.id),
  (ids) => {
    const visibleIds = new Set(ids)
    loadedIds.value = new Set([...loadedIds.value].filter((id) => visibleIds.has(id)))
    nextTick(observeSentinel)
  }
)

watch(
  () => [props.canLoadMore, props.loadingMore],
  () => {
    nextTick(observeSentinel)
  }
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  observeSentinel()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  disconnectObserver()
})
</script>

<template>
  <div class="tumblr-masonry-gallery">
    <article
      v-for="item in items"
      :key="item.id"
      :class="{ loaded: loadedIds.has(item.id) }"
      class="masonry-entry group relative overflow-hidden rounded-lg bg-zinc-100 focus-within:ring-2 focus-within:ring-indigo-500 dark:bg-zinc-900"
    >
      <img
        :src="item.imageUrl"
        :alt="item.imageAlt"
        :width="item.imageWidth || item.thumbnail?.width || item.images?.[0]?.width || undefined"
        :height="item.imageHeight || item.thumbnail?.height || item.images?.[0]?.height || undefined"
        loading="lazy"
        decoding="async"
        class="masonry-image"
        @load="markLoaded(item.id)"
        @error="markLoaded(item.id)"
      />

      <slot :item="item" />
    </article>

    <div
      v-if="canLoadMore"
      ref="sentinel"
      class="masonry-sentinel"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.tumblr-masonry-gallery {
  column-count: 4;
  column-gap: 4px;
}

.masonry-entry {
  display: inline-block;
  width: 100%;
  margin: 0 0 4px;
  break-inside: avoid;
}

.masonry-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  opacity: 0;
  transition: opacity 450ms ease;
}

.masonry-entry.loaded .masonry-image {
  opacity: 1;
}

.masonry-entry.loaded:hover .masonry-image,
.masonry-entry.loaded:focus-within .masonry-image {
  opacity: 0.5;
}

.masonry-sentinel {
  display: inline-block;
  width: 100%;
  height: 1px;
  break-inside: avoid;
}

@media (max-width: 1024px) {
  .tumblr-masonry-gallery {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .tumblr-masonry-gallery {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .tumblr-masonry-gallery {
    column-count: 1;
  }
}
</style>
