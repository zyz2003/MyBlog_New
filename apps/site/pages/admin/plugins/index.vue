<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import PluginList from '~/components/admin/plugins/PluginList.vue'
import PluginMarketplace from '~/components/admin/plugins/PluginMarketplace.vue'
import PluginConfigForm from '~/components/admin/plugins/PluginConfigForm.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#components'
import { useToast } from '#imports'
import { Puzzle, Store } from 'lucide-vue-next'
import { usePluginAdminStore, type Plugin, type PluginConfig } from '~/stores/pluginAdmin'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

useHead({
  title: '插件管理 - 后台管理',
})

const toast = useToast()
const pluginStore = usePluginAdminStore()

const activeTab = ref('installed')

const handleToggle = async (pluginId: string, enabled: boolean) => {
  const result = await pluginStore.togglePlugin(pluginId, enabled)
  if (result.success) {
    toast.add({
      title: enabled ? '插件已启用' : '插件已禁用',
      description: enabled ? '插件功能现已可用' : '插件已被禁用',
    })
  } else {
    toast.add({
      title: '操作失败',
      description: '请稍后重试',
      variant: 'destructive',
    })
  }
}

const handleConfigure = (plugin: Plugin) => {
  pluginStore.openConfig(plugin)
}

const handleSearch = (query: string) => {
  console.log('Search query:', query)
}

const handleCategoryChange = (category: string) => {
  console.log('Category changed:', category)
}

const handleStatusChange = (status: string) => {
  console.log('Status changed:', status)
}

const handleSaveConfig = async (config: PluginConfig) => {
  if (pluginStore.configPlugin) {
    const result = await pluginStore.savePluginConfig(pluginStore.configPlugin.id, config)
    if (result.success) {
      toast.add({
        title: '配置保存成功',
        description: '插件配置已更新',
      })
      pluginStore.closeConfig()
    } else {
      toast.add({
        title: '配置保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }
}

onMounted(() => {
  pluginStore.fetchPlugins()
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- 页面头部 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">插件管理</h1>
          <p class="text-muted-foreground mt-1">
            管理已安装的插件和浏览插件市场
          </p>
        </div>
      </div>

      <!-- Tab 切换 -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="installed">
            <Puzzle class="w-4 h-4 mr-2" />
            已安装插件
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Store class="w-4 h-4 mr-2" />
            插件市场
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" class="mt-6">
          <div class="bg-card rounded-lg border p-6">
            <PluginList
              :plugins="pluginStore.plugins"
              :loading="pluginStore.loading"
              @toggle="handleToggle"
              @configure="handleConfigure"
              @search="handleSearch"
              @category-change="handleCategoryChange"
              @status-change="handleStatusChange"
            />
          </div>
        </TabsContent>

        <TabsContent value="marketplace" class="mt-6">
          <div class="bg-card rounded-lg border p-6">
            <PluginMarketplace />
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <!-- 配置弹窗 -->
    <PluginConfigForm
      v-model:open="pluginStore.configOpen"
      :plugin="pluginStore.configPlugin"
      :config="pluginStore.config"
      @save="handleSaveConfig"
    />
  </AdminLayout>
</template>
