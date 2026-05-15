<script setup lang="ts">
defineProps<{
  title: string
  date: string
  categories?: Array<{ id: number; name: string; slug: string }>
  tags?: Array<{ id: number; name: string; slug: string }>
  coverImage?: string
  readingTime: string
  wordCount: number
}>()
</script>

<template>
  <div id="post-top-cover" v-if="coverImage" class="relative w-full h-[50vh] min-h-[300px] max-h-[600px] overflow-hidden">
    <img :src="coverImage" :alt="title" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-[var(--anzhiyu-background,#fff)]/90 via-transparent to-transparent" />
  </div>

  <div class="post-header max-w-[800px] mx-auto px-4 pt-8" :class="{ '-mt-32 relative z-1': coverImage }">
    <h1 class="text-3xl md:text-4xl font-bold text-[var(--anzhiyu-fontcolor)] leading-tight mb-4">
      {{ title }}
    </h1>

    <div class="flex flex-wrap items-center gap-3 text-sm text-[var(--anzhiyu-secondtext)] mb-4">
      <!-- Date -->
      <span class="flex items-center gap-1">
        <i class="anzhiyufont anzhiyu-icon-calendar" />
        {{ date }}
      </span>

      <!-- Reading time -->
      <span class="flex items-center gap-1">
        <i class="anzhiyufont anzhiyu-icon-book-open" />
        {{ readingTime }}
      </span>

      <!-- Word count -->
      <span class="flex items-center gap-1">
        <i class="anzhiyufont anzhiyu-icon-pen-to-square" />
        {{ wordCount }} 字
      </span>
    </div>

    <!-- Categories -->
    <div v-if="categories && categories.length > 0" class="flex flex-wrap items-center gap-2 mb-2">
      <i class="anzhiyufont anzhiyu-icon-inbox text-sm text-[var(--anzhiyu-secondtext)]" />
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.slug}`"
        class="text-sm px-2 py-0.5 rounded bg-[var(--anzhiyu-main)]/10 text-[var(--anzhiyu-main)] no-underline hover:bg-[var(--anzhiyu-main)]/20 transition-colors"
      >
        {{ cat.name }}
      </NuxtLink>
    </div>

    <!-- Tags -->
    <div v-if="tags && tags.length > 0" class="flex flex-wrap items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-tag text-sm text-[var(--anzhiyu-secondtext)]" />
      <NuxtLink
        v-for="tag in tags"
        :key="tag.id"
        :to="`/tags/${tag.slug}`"
        class="text-xs px-2 py-0.5 rounded bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-secondtext)] border border-[var(--style-border-always)] no-underline hover:text-[var(--anzhiyu-main)] hover:border-[var(--anzhiyu-main)] transition-colors"
      >
        {{ tag.name }}
      </NuxtLink>
    </div>
  </div>
</template>
