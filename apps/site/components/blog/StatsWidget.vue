<script setup lang="ts">
defineProps<{ articles?: number; categories?: number; tags?: number }>()
</script>

<template>
  <div class="card-widget rounded-2xl bg-[var(--anzhiyu-card-bg)] border border-[var(--style-border-always)] p-4 mb-4">
    <div class="flex justify-around">
      <div class="text-center">
        <div class="text-xl font-bold text-[var(--anzhiyu-main)]">{{ articles ?? 0 }}</div>
        <div class="text-[10px] text-[var(--anzhiyu-secondtext)] uppercase">文章</div>
      </div>
      <div class="text-center">
        <div class="text-xl font-bold text-[var(--anzhiyu-main)]">{{ categories ?? 0 }}</div>
        <div class="text-[10px] text-[var(--anzhiyu-secondtext)] uppercase">分类</div>
      </div>
      <div class="text-center">
        <div class="text-xl font-bold text-[var(--anzhiyu-main)]">{{ tags ?? 0 }}</div>
        <div class="text-[10px] text-[var(--anzhiyu-secondtext)] uppercase">标签</div>
      </div>
    </div>
  </div>
</template>
