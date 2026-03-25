<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent } from '#components'
import { Button } from '#components'
import { Badge } from '#components'
import { Input } from '#components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#components'
import { Store, Download, Search, ExternalLink, Star, ArrowDownToLine } from 'lucide-vue-next'

interface MarketplacePlugin {
  id: string
  name: string
  description: string
  author: string
  icon?: string
  category: string
  rating: number
  downloads: number
  isInstalled: boolean
  installUrl?: string
}

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = ['all', 'SEO', '编辑器', '统计', '社交', '安全', '其他']

// 占位数据（Phase 8 实现真实 API）
const marketplacePlugins: MarketplacePlugin[] = [
  // TODO: 从 API 获取数据
]

const filteredPlugins = computed(() => {
  let result = marketplacePlugins

  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  return result
})
</script>

<template>
  <div class="space-y-4">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Store class="w-5 h-5 text-primary" />
        <h2 class="text-lg font-semibold">插件市场</h2>
      </div>
      <Button variant="outline" size="sm">
        <ExternalLink class="w-4 h-4 mr-2" />
        浏览更多插件
      </Button>
    </div>

    <!-- 分类和搜索 -->
    <div class="flex items-center gap-2">
      <Tabs v-model="activeCategory">
        <TabsList>
          <TabsTrigger
            v-for="cat in categories"
            :key="cat"
            :value="cat"
          >
            {{ cat === 'all' ? '全部' : cat }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div class="relative flex-1 max-w-sm ml-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="搜索插件..."
          class="pl-10"
        />
      </div>
    </div>

    <!-- 占位提示 -->
    <div class="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/30 rounded-lg">
      <Store class="w-16 h-16 mb-4 opacity-20" />
      <p class="text-lg font-medium">插件市场即将上线</p>
      <p class="text-sm mt-2">Phase 8 将支持在线浏览和安装插件</p>
      <Button variant="outline" class="mt-4">
        <ExternalLink class="w-4 h-4 mr-2" />
        查看官方插件列表
      </Button>
    </div>
  </div>
</template>
