<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '#components'
import { Input } from '#components'
import { Tabs, TabsList, TabsTrigger } from '#components'
import { Store, ExternalLink, Search } from 'lucide-vue-next'

const searchQuery = ref('')
const activeCategory = ref('all')

// 占位数据（Phase 8 实现真实 API）
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
          <TabsTrigger v-for="cat in categories" :key="cat" :value="cat">
            {{ cat === 'all' ? '全部' : cat }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div class="relative flex-1 max-w-sm ml-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="搜索插件..." class="pl-10" />
      </div>
    </div>

    <!-- 占位提示 -->
    <div
      class="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/30 rounded-lg"
    >
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
