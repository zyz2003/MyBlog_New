<script setup lang="ts">
import '~/assets/css/variables.css'

const { user, logout } = useAuth()
const { currentGroup } = useAdminNavigation()

const sidebarCollapsed = ref(false)
const showSearch = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('admin_sidebar_collapsed')
  if (saved === 'true') {
    sidebarCollapsed.value = true
  }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('admin_sidebar_collapsed', String(sidebarCollapsed.value))
}
</script>

<template>
  <div class="admin-console relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#edf5ff_0%,#f6f9fd_42%,#fcfdff_100%)] text-text dark:bg-[linear-gradient(180deg,#09111d_0%,#0b1220_42%,#0e1524_100%)]">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-20 top-16 h-72 w-72 rounded-full bg-sky-400/12 blur-3xl" />
      <div class="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
      <div class="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl" />
    </div>

    <div class="relative flex min-h-screen">
      <AdminCommonSidebar
        :collapsed="sidebarCollapsed"
        @toggle-collapse="toggleSidebar"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <AdminCommonNavbar :user="user" @logout="logout" @search="showSearch = true">
          <AdminCommonBreadcrumb />
        </AdminCommonNavbar>

        <main class="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 md:px-8">
          <div class="mx-auto max-w-[1520px]">
            <div
              v-if="currentGroup"
              class="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80"
            >
              <span :class="currentGroup.icon" class="h-4 w-4" />
              <span>{{ currentGroup.label }}</span>
            </div>

            <div class="rounded-[28px] border border-white/55 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_20px_60px_rgba(43,74,116,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(13,19,31,0.82)] md:p-6">
              <slot />
            </div>
          </div>
        </main>
      </div>
    </div>

    <AdminCommonCommandPalette v-if="showSearch" @close="showSearch = false" />
  </div>
</template>

<style scoped>
.admin-console {
  --color-primary: #4b8df8;
  --color-primary-rgb: 75 141 248;
  --color-secondary: #6f8db4;
  --color-secondary-rgb: 111 141 180;
  --color-accent: #22b8cf;
  --color-accent-rgb: 34 184 207;
  --color-background: #f7fbff;
  --color-background-rgb: 247 251 255;
  --color-surface: #ffffff;
  --color-surface-rgb: 255 255 255;
  --color-surface-2: #eef5ff;
  --color-surface-2-rgb: 238 245 255;
  --color-text: #172033;
  --color-text-rgb: 23 32 51;
  --color-text-muted: #6a7a96;
  --color-text-muted-rgb: 106 122 150;
  --color-border: #dbe7f5;
  --color-border-rgb: 219 231 245;
  --anzhiyu-main: #4b8df8;
}

:global(.dark) .admin-console {
  --color-primary: #7bb0ff;
  --color-primary-rgb: 123 176 255;
  --color-secondary: #93abc9;
  --color-secondary-rgb: 147 171 201;
  --color-accent: #4fd4de;
  --color-accent-rgb: 79 212 222;
  --color-background: #0f1726;
  --color-background-rgb: 15 23 38;
  --color-surface: #162033;
  --color-surface-rgb: 22 32 51;
  --color-surface-2: #1e2a40;
  --color-surface-2-rgb: 30 42 64;
  --color-text: #ecf4ff;
  --color-text-rgb: 236 244 255;
  --color-text-muted: #9db0cb;
  --color-text-muted-rgb: 157 176 203;
  --color-border: #2a3a55;
  --color-border-rgb: 42 58 85;
  --anzhiyu-main: #7bb0ff;
}
</style>
