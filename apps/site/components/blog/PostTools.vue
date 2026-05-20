<script setup lang="ts">
const props = defineProps<{
  categories?: Array<{ id: number, name: string, slug: string }>
  url: string
  title: string
}>()

const { ptool } = useSiteSettings()

function copyUrl() {
  navigator.clipboard.writeText(props.url).then(() => {
    window.dispatchEvent(new CustomEvent('site:snackbar', { detail: { message: '文章链接已复制' } }))
  }).catch(() => {})
}

function shareWeibo() {
  const shareUrl = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=720,height=560')
}

function openMode() {
  if (!ptool.value.mode) {
    return
  }
  navigateTo(ptool.value.mode, { external: /^https?:\/\//.test(ptool.value.mode) })
}
</script>

<template>
  <div v-if="ptool.enable" class="post-tools mx-auto max-w-[980px] px-4">
    <div class="post-tools-card">
      <div v-if="ptool.categories && (categories?.length || 0) > 0" class="post-tools-categories">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="post-tool-chip"
        >
          {{ category.name }}
        </NuxtLink>
      </div>

      <div class="post-tools-actions">
        <button v-if="ptool.shareMobile" type="button" class="post-tool-action" @click="copyUrl">
          <i class="anzhiyufont anzhiyu-icon-link" />
          <span>分享链接</span>
        </button>
        <button v-if="ptool.shareWeibo" type="button" class="post-tool-action" @click="shareWeibo">
          <i class="anzhiyufont anzhiyu-icon-weibo" />
          <span>分享到微博</span>
        </button>
        <button v-if="ptool.shareCopyurl" type="button" class="post-tool-action" @click="copyUrl">
          <i class="anzhiyufont anzhiyu-icon-copy" />
          <span>复制链接</span>
        </button>
        <button v-if="ptool.mode" type="button" class="post-tool-action post-tool-action-primary" @click="openMode">
          <i class="anzhiyufont anzhiyu-icon-gift" />
          <span>赞助支持</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-tools-card {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.15rem;
  border: 1px solid var(--style-border-always);
  border-radius: 24px;
  background: var(--anzhiyu-card-bg);
  box-shadow: var(--anzhiyu-shadow-border);
}

.post-tools-categories,
.post-tools-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.post-tool-chip,
.post-tool-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.5rem;
  padding: 0.55rem 0.95rem;
  border: 1px solid var(--style-border-always);
  border-radius: 999px;
  background: color-mix(in srgb, var(--anzhiyu-main) 5%, var(--anzhiyu-card-bg));
  color: var(--anzhiyu-fontcolor);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-tool-chip:hover,
.post-tool-action:hover {
  color: var(--anzhiyu-main);
  border-color: color-mix(in srgb, var(--anzhiyu-main) 32%, transparent);
  transform: translateY(-1px);
}

.post-tool-action-primary {
  background: color-mix(in srgb, var(--anzhiyu-main) 14%, white);
}
</style>
