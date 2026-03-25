<script setup lang="ts">
import { computed } from 'vue'
import { Search, Bell } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { useAuthStore } from '~/stores/auth'
import UserMenu from './UserMenu.vue'
import Breadcrumb from './Breadcrumb.vue'
import type { UserObject } from '~/server/services/auth.service'

const props = defineProps<{
  user?: UserObject | null
  title?: string
}>()

const authStore = useAuthStore()
const currentUser = computed(() => props.user ?? authStore.user)
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="flex h-[72px] items-center gap-3 px-4 md:px-7">
      <SidebarTrigger class="text-slate-600 hover:text-slate-900" />
      <Breadcrumb class="hidden min-w-0 flex-1 md:flex" />
      <div class="relative hidden w-full max-w-md lg:block">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="搜索文章、分类或设置..."
          class="h-9 border-slate-200 bg-slate-50 pl-9 focus-visible:bg-white"
        />
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full text-slate-500">
          <Bell class="h-4 w-4" />
        </Button>
        <UserMenu v-if="currentUser" :user="currentUser" />
      </div>
    </div>
    <div class="flex items-center gap-2 border-t border-slate-100 px-4 py-2 md:hidden">
      <Search class="pointer-events-none h-4 w-4 text-slate-400" />
      <Input
        placeholder="搜索..."
        class="h-9 border-slate-200 bg-slate-50"
      />
    </div>
  </header>
</template>
