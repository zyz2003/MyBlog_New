<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { adminNavigation } from '~/config/admin-navigation'
import { useAuthStore } from '~/stores/auth'
import UserMenu from './UserMenu.vue'
import {
  FileText,
  Image,
  Folder,
  Tags,
  Palette,
  Puzzle,
  Settings,
  LayoutDashboard,
} from 'lucide-vue-next'

// Icon mapping for lucide-vue-next components
const iconMap: Record<string, any> = {
  FileText,
  Image,
  Folder,
  Tags,
  Palette,
  Puzzle,
  Settings,
  LayoutDashboard,
}

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <Sidebar
    collapsible="offcanvas"
    class="border-r border-slate-200 bg-[#f8fafc]"
  >
    <SidebarHeader class="border-b border-slate-200 px-[18px] py-7">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-sm">
          <span class="text-xs font-semibold">博</span>
        </div>
        <div class="min-w-0">
          <p class="truncate text-[18px] font-semibold text-slate-900">博客管理</p>
          <p class="truncate text-xs text-slate-500">Admin Console</p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent class="px-2 py-4">
      <SidebarGroup v-for="group in adminNavigation" :key="group.group">
        <SidebarGroupLabel class="px-2 text-[11px] font-semibold tracking-wide text-slate-500">
          {{ group.group }}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="item.name">
              <SidebarMenuButton
                :as-child="true"
                :is-active="isActive(item.path)"
                class="h-10 rounded-[10px] text-slate-600 data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm"
              >
                <NuxtLink :to="item.path" class="flex w-full items-center gap-2">
                  <component
                    :is="iconMap[item.icon]"
                    v-if="iconMap[item.icon]"
                    class="h-4 w-4"
                  />
                  <span>{{ item.name }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t border-slate-200 bg-white p-4">
      <UserMenu v-if="authStore.user" :user="authStore.user" />
    </SidebarFooter>
  </Sidebar>
</template>
