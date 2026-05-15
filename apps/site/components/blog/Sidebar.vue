<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

interface Props {
  enabled?: boolean
  widgets?: string[]
  sidebarWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  widgets: () => ['announcement', 'archive', 'categories', 'wechat', 'recent_comments'],
  sidebarWidth: '280px',
})

const { settings } = useSiteSettings()
const sidebarConfig = computed(() => settings.value?.sidebar ?? {})

const widgetList = computed(() => {
  return (props.widgets || sidebarConfig.widgets || ['announcement', 'archive', 'categories', 'wechat', 'recent_comments'])
})

const widgetMap: Record<string, string> = {
  announcement: 'BlogAnnounceWidget',
  archive: 'BlogArchiveWidget',
  categories: 'BlogCategoriesWidget',
  wechat: 'BlogWechatWidget',
  recent_comments: 'BlogRecentCommentsWidget',
}
</script>

<template>
  <aside
    v-if="enabled && widgetList.length > 0"
    class="sidebar-widget"
    :style="{ width: sidebarWidth }"
  >
    <div class="sidebar-widgets sticky top-6">
      <template v-for="name in widgetList" :key="name">
        <BlogAnnounceWidget v-if="name === 'announcement'" />
        <BlogArchiveWidget v-else-if="name === 'archive'" />
        <BlogCategoriesWidget v-else-if="name === 'categories'" />
        <BlogWechatWidget v-else-if="name === 'wechat'" />
        <BlogRecentCommentsWidget v-else-if="name === 'recent_comments'" />
      </template>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-widget {
  flex-shrink: 0;
  min-width: 0;
}

@media (max-width: 1024px) {
  .sidebar-widget {
    display: none;
  }
}
</style>
