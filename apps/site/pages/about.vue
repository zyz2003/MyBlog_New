<script setup lang="ts">
definePageMeta({ layout: 'blog' })

if (import.meta.server) {
  useSeoMeta({
    title: '关于',
    ogTitle: '关于',
    description: '关于本站',
    ogDescription: '关于本站',
  })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">关于</h1>
    <article class="prose max-w-none">
      <p>这是一个个人博客系统，使用 Nuxt 3 构建，支持 SSR 渲染。</p>
      <h2>技术栈</h2>
      <ul>
        <li>前端: Nuxt 3 + Vue 3 + UnoCSS</li>
        <li>后端: Nitro + Drizzle ORM + SQLite</li>
        <li>编辑器: Vditor (Markdown)</li>
      </ul>
      <h2>功能</h2>
      <ul>
        <li>文章发布与管理</li>
        <li>分类与标签系统</li>
        <li>全文搜索</li>
        <li>RSS 订阅</li>
        <li>SEO 优化</li>
        <li>主题切换</li>
        <li>插件扩展</li>
      </ul>
      <h2>联系</h2>
      <p>如有问题或建议，欢迎通过以下方式联系：</p>
      <ul>
        <li>GitHub: <a href="https://github.com" class="text-blue-600 hover:underline" target="_blank" rel="noopener">查看项目</a></li>
      </ul>
    </article>
  </div>
</template>
