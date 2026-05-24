<script setup lang="ts">
const props = defineProps<{
  title: string
  url: string
  sites: string[]
}>()

const shareMap: Record<string, { label: string; buildUrl: (title: string, url: string) => string }> = {
  facebook: {
    label: 'Facebook',
    buildUrl: (_title, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  twitter: {
    label: 'Twitter',
    buildUrl: (title, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  wechat: {
    label: '微信',
    buildUrl: (_title, url) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`,
  },
  weibo: {
    label: '微博',
    buildUrl: (title, url) => `https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  qq: {
    label: 'QQ',
    buildUrl: (title, url) => `https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
}

const shareItems = computed(() => props.sites.map(site => site.trim()).filter(site => shareMap[site]).map(site => ({
  key: site,
  label: shareMap[site].label,
  href: shareMap[site].buildUrl(props.title, props.url),
})))
</script>

<template>
  <section v-if="shareItems.length" class="rounded-[28px] border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6 shadow-[var(--anzhiyu-shadow-border)]">
    <div class="mb-4 flex items-center gap-2">
      <i class="anzhiyufont anzhiyu-icon-share-nodes text-[var(--anzhiyu-main)]" />
      <h3 class="text-lg font-semibold text-[var(--anzhiyu-fontcolor)]">分享文章</h3>
    </div>

    <div class="flex flex-wrap gap-3">
      <a
        v-for="item in shareItems"
        :key="item.key"
        :href="item.href"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center rounded-full border border-[var(--style-border-always)] bg-[var(--anzhiyu-secondbg)] px-4 py-2 text-sm text-[var(--anzhiyu-fontcolor)] no-underline transition hover:border-[var(--anzhiyu-main)] hover:text-[var(--anzhiyu-main)]"
      >
        {{ item.label }}
      </a>
    </div>
  </section>
</template>
