import type { PluginAdapterExtended } from './types'

/**
 * Friends Links Plugin
 * Demonstrates page mount point - registers a /friends page in the database
 */
export default {
  meta: {
    name: 'friends-links',
    label: '友链管理',
    type: 'feature',
    version: '1.0.0',
    author: 'Blog Team',
    description: '博客友链页面插件，支持添加和管理友情链接',
    icon: 'i-heroicons-link',
  },
  configSchema: {
    title: {
      type: 'string',
      label: '页面标题',
      description: '友链页面的标题',
      default: '友情链接',
    },
    description: {
      type: 'textarea',
      label: '页面描述',
      description: '在友链页面顶部显示的描述文字',
      default: '欢迎交换友链，请通过留言或邮件与我联系',
    },
    categories: {
      type: 'multi-select',
      label: '链接分类',
      description: '选择要显示的链接分类',
      options: [
        { label: '技术博客', value: 'tech' },
        { label: '个人网站', value: 'personal' },
        { label: '组织机构', value: 'org' },
      ],
      default: ['tech', 'personal'],
    },
    showAvatar: {
      type: 'boolean',
      label: '显示头像',
      description: '在链接卡片中显示网站图标',
      default: true,
    },
  },
  mountPoints: ['page'],
  pages: {
    '/friends': {
      title: '友情链接',
      componentCode: `<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-2">{{ title }}</h1>
    <p class="text-gray-500 mb-8">{{ description }}</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="link in friends" :key="link.url" class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
        <img v-if="showAvatar" :src="link.avatar" :alt="link.name" class="w-10 h-10 rounded-full bg-gray-100" />
        <div class="min-w-0">
          <a :href="link.url" target="_blank" class="font-medium text-gray-900 hover:text-blue-600">{{ link.name }}</a>
          <p class="text-sm text-gray-500 truncate">{{ link.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('友情链接')
const description = ref('欢迎交换友链，请通过留言或邮件与我联系')
const showAvatar = ref(true)
const friends = ref([
  { name: 'Vue.js', url: 'https://vuejs.org', avatar: 'https://vuejs.org/logo.svg', desc: '渐进式 JavaScript 框架' },
  { name: 'Nuxt', url: 'https://nuxt.com', avatar: 'https://nuxt.com/icon.png', desc: 'Vue.js 全栈框架' },
  { name: 'Vite', url: 'https://vitejs.dev', avatar: 'https://vitejs.dev/logo.svg', desc: '下一代前端构建工具' },
])
</script>`,
      showInNav: true,
      navLabel: '友链',
      navOrder: 10,
    },
  },
} satisfies PluginAdapterExtended
