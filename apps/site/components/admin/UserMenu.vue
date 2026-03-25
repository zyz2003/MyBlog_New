<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import type { UserObject } from '~/server/services/auth.service'

const props = defineProps<{
  user: UserObject
}>()

const router = useRouter()
const authStore = useAuthStore()

const userInitial = computed(() => {
  return props.user?.username?.charAt(0).toUpperCase() || 'U'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/admin/login')
}

const handleSettings = () => {
  router.push('/admin/settings')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 outline-none transition-colors hover:bg-slate-50">
      <Avatar class="h-7 w-7">
        <AvatarFallback class="bg-sky-500 text-white">
          {{ userInitial }}
        </AvatarFallback>
      </Avatar>
      <span class="hidden max-w-24 truncate text-sm font-medium text-slate-700 md:inline-block">{{ user.username }}</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56 border-slate-200">
      <DropdownMenuLabel>
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">{{ user.username }}</span>
          <span class="text-xs text-slate-500">{{ user.email }}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleSettings" class="gap-2 text-slate-700">
        <Settings class="h-4 w-4" />
        <span>设置中心</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout" class="gap-2 text-red-600 focus:text-red-600">
        <LogOut class="h-4 w-4" />
        <span>退出登录</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
