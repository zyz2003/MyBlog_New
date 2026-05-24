<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const { comments } = useSiteSettings()

const commentsEnabled = computed(() => Boolean(comments.value.twikoo.envId))
</script>

<template>
  <div class="card-widget recent-comments-widget mb-4 rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-4">
    <div class="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--anzhiyu-secondtext)]">最新评论</div>

    <div class="rounded-2xl bg-[var(--anzhiyu-main)]/4 px-4 py-4 text-sm leading-6">
      <template v-if="commentsEnabled">
        <div class="mb-2 flex items-center gap-2 text-[var(--anzhiyu-fontcolor)]">
          <i class="anzhiyufont anzhiyu-icon-comments text-[var(--anzhiyu-main)]" />
          <span class="font-medium">评论系统已启用</span>
        </div>
        <p class="mb-3 text-xs text-[var(--anzhiyu-secondtext)]">
          访客可以在文章页直接留言交流，右侧评论快捷按钮也已经可用。
        </p>
        <NuxtLink
          to="/articles"
          class="inline-flex items-center gap-1 rounded-full bg-[var(--anzhiyu-card-bg)] px-3 py-1.5 text-xs text-[var(--anzhiyu-main)] no-underline transition-colors hover:bg-[var(--anzhiyu-main)] hover:text-white"
        >
          去文章页参与讨论
        </NuxtLink>
      </template>

      <template v-else>
        <div class="mb-2 flex items-center gap-2 text-[var(--anzhiyu-fontcolor)]">
          <i class="anzhiyufont anzhiyu-icon-comments text-[var(--anzhiyu-secondtext)]" />
          <span class="font-medium">站点暂未启用评论展示</span>
        </div>
        <p class="text-xs text-[var(--anzhiyu-secondtext)]">
          当前侧边栏不再显示占位提示。等后台补充 Twikoo 配置后，这里会切换为真实评论入口状态。
        </p>
      </template>
    </div>
  </div>
</template>
