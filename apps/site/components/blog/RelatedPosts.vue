<script setup lang="ts">
defineProps<{
  items: Array<{
    id: number
    title: string
    path: string
    date: string
    coverImage?: string | null
  }>
}>()
</script>

<template>
  <section v-if="items.length" class="rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6 shadow-[var(--anzhiyu-shadow-border)]">
    <div class="mb-4 flex items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-book-open-reader text-[var(--anzhiyu-main)]" />
      <h3 class="text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">相关文章</h3>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="item.path"
        class="group overflow-hidden rounded-[22px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-secondbg)] no-underline transition hover:-translate-y-1 hover:border-[var(--anzhiyu-main)]"
      >
        <img v-if="item.coverImage" :src="item.coverImage" :alt="item.title" class="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]">
        <div class="space-y-2 p-4">
          <h4 class="line-clamp-2 text-base font-semibold text-[var(--anzhiyu-fontcolor)]">{{ item.title }}</h4>
          <p class="text-sm text-[var(--anzhiyu-secondtext)]">{{ item.date }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
