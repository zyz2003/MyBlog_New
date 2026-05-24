<script setup lang="ts">
defineProps<{
  items: Array<{ img: string; link?: string; text?: string }>
}>()
</script>

<template>
  <section class="rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6 shadow-[var(--anzhiyu-shadow-border)]">
    <div class="mb-4 flex items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-gift text-[var(--anzhiyu-main)]" />
      <h3 class="text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">赞赏支持</h3>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <a
        v-for="item in items"
        :key="`${item.img}-${item.text}`"
        :href="item.link || 'javascript:void(0)'"
        class="group rounded-[24px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-secondbg)] p-4 text-center no-underline transition hover:-translate-y-1 hover:border-[var(--anzhiyu-main)]"
        :target="item.link ? '_blank' : undefined"
        :rel="item.link ? 'noreferrer' : undefined"
      >
        <img :src="item.img" :alt="item.text || '赞赏码'" class="mx-auto aspect-square w-full max-w-[180px] rounded-2xl object-cover">
        <p class="mt-3 text-sm font-medium text-[var(--anzhiyu-fontcolor)]">{{ item.text || '支持一下' }}</p>
      </a>
    </div>
  </section>
</template>
