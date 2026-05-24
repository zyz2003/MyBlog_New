<script setup lang="ts">
const props = defineProps<{
  wordCount: number
  readingTime: string
  publishDate: string
  updateDate?: string
  categories: Array<{ id: number; name: string; slug: string }>
}>()
</script>

<template>
  <div class="post-info-bar mx-auto max-w-[980px] px-4">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[18px] border border-[var(--style-border-always)] bg-[color-mix(in_srgb,var(--anzhiyu-card-bg)_94%,white)] px-5 py-3 text-sm text-[var(--anzhiyu-secondtext)] shadow-[var(--anzhiyu-shadow-border)]">
      <span class="inline-flex items-center gap-1.5">
        <i class="anzhiyufont anzhiyu-icon-calendar-days text-[var(--anzhiyu-main)]" />
        {{ publishDate }}
      </span>

      <span class="text-[var(--style-border)]">·</span>

      <span class="inline-flex items-center gap-1.5">
        <i class="anzhiyufont anzhiyu-icon-pen-to-square text-[var(--anzhiyu-main)]" />
        {{ wordCount }}字
      </span>

      <span class="text-[var(--style-border)]">·</span>

      <span class="inline-flex items-center gap-1.5">
        <i class="anzhiyufont anzhiyu-icon-clock text-[var(--anzhiyu-main)]" />
        {{ readingTime }}
      </span>

      <template v-if="categories.length > 0">
        <span class="text-[var(--style-border)]">·</span>

        <span class="inline-flex items-center gap-1.5">
          <i class="anzhiyufont anzhiyu-icon-folder text-[var(--anzhiyu-main)]" />
          <NuxtLink
            v-for="(cat, index) in categories"
            :key="cat.id"
            :to="`/categories/${cat.slug}`"
            class="text-[var(--anzhiyu-secondtext)] no-underline hover:text-[var(--anzhiyu-main)]"
          >
            {{ cat.name }}<span v-if="index < categories.length - 1">,</span>
          </NuxtLink>
        </span>
      </template>

      <template v-if="updateDate && updateDate !== publishDate">
        <span class="text-[var(--style-border)]">·</span>
        <span class="inline-flex items-center gap-1.5 text-[var(--anzhiyu-fontcolor)]">
          <i class="anzhiyufont anzhiyu-icon-history text-[var(--anzhiyu-main)]" />
          更新于 {{ updateDate }}
        </span>
      </template>
    </div>
  </div>
</template>