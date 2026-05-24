<script setup lang="ts">
defineProps<{
  mode: number
  previous?: {
    title: string
    path: string
    coverImage?: string | null
  } | null
  next?: {
    title: string
    path: string
    coverImage?: string | null
  } | null
}>()
</script>

<template>
  <section v-if="previous || next" class="grid gap-4" :class="mode >= 3 ? 'md:grid-cols-1' : 'md:grid-cols-2'">
    <NuxtLink
      v-if="mode < 3 && previous"
      :to="previous.path"
      class="group rounded-[26px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-5 no-underline transition hover:-translate-y-1 hover:border-[var(--anzhiyu-main)]"
    >
      <p class="text-xs uppercase tracking-[0.18em] text-[var(--anzhiyu-secondtext)]">上一篇</p>
      <h4 class="mt-3 text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">{{ previous.title }}</h4>
    </NuxtLink>

    <NuxtLink
      v-if="next"
      :to="next.path"
      class="group overflow-hidden rounded-[26px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] no-underline transition hover:-translate-y-1 hover:border-[var(--anzhiyu-main)]"
      :class="mode >= 3 ? 'grid md:grid-cols-[220px_minmax(0,1fr)]' : 'p-5'"
    >
      <img
        v-if="mode === 4 && next.coverImage"
        :src="next.coverImage"
        :alt="next.title"
        class="h-full min-h-[160px] w-full object-cover"
      >
      <div class="p-5">
        <p class="text-xs uppercase tracking-[0.18em] text-[var(--anzhiyu-secondtext)]">下一篇</p>
        <h4 class="mt-3 text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">{{ next.title }}</h4>
      </div>
    </NuxtLink>
  </section>
</template>
