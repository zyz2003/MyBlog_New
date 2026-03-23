# Phase 5: 后台管理 (Admin Dashboard) - Research

**Researched:** 2026-03-23
**Domain:** Admin Dashboard UI - Nuxt 3 + Vue 3 + shadcn-vue + Pinia
**Confidence:** HIGH

## Summary

Phase 5 implements the admin dashboard UI for the blog system. The research covers shadcn-vue integration with Nuxt 3, admin dashboard patterns, authentication flow with JWT tokens, form validation, file upload UX, and data table patterns.

**Primary recommendation:** Use shadcn-vue (via shadcn-nuxt module) for UI components, Pinia with persisted state plugin for auth management, Nuxt 3 route middleware for protected pages, and native $fetch with interceptors for API calls.

## Standard Stack

### Core

| Library          | Version | Purpose                 | Why Standard                                                            |
| ---------------- | ------- | ----------------------- | ----------------------------------------------------------------------- |
| **Nuxt 3**       | 3.11+   | Application framework   | Already in use, provides SSR, file routing, auto-imports                |
| **Vue 3**        | 3.4+    | UI framework            | Already in use, Composition API                                         |
| **TypeScript**   | 5.7+    | Type safety             | Already configured, strict mode                                         |
| **Tailwind CSS** | 3.4+    | Atomic CSS              | Already configured, shadcn-vue foundation                               |
| **shadcn-vue**   | Latest  | UI component primitives | Copies source to project, full customization, Radix-based accessibility |
| **Pinia**        | 2.1+    | State management        | Official Vue 3 store, Nuxt 3 auto-integration                           |

### Supporting

| Library                         | Version | Purpose                  | When to Use                                    |
| ------------------------------- | ------- | ------------------------ | ---------------------------------------------- |
| **pinia-plugin-persistedstate** | Latest  | localStorage persistence | Auth token persistence, user preferences       |
| **lucide-vue-next**             | Latest  | Icon library             | Consistent icon set, tree-shakable             |
| **VueUse**                      | Latest  | Composable utilities     | useLocalStorage, useToggle, useDark (optional) |
| **VeeValidate**                 | 4.x     | Form validation          | Via shadcn-vue Form component integration      |

### Installation

```bash
# Install shadcn-nuxt module
pnpm dlx nuxi@latest module add shadcn-nuxt

# Install Pinia (if not already installed)
pnpm add pinia @pinia/nuxt

# Install persistedstate plugin
pnpm add pinia-plugin-persistedstate

# Install lucide icons
pnpm add lucide-vue-next

# Initialize shadcn-vue
pnpm dlx shadcn-vue@latest init

# Add components as needed
pnpm dlx shadcn-vue@latest add button card table input label select dialog dropdown-menu separator badge avatar navigation-menu sidebar form toast
```

### alternatives Considered

| Instead of                  | Could Use           | Tradeoff                                                   |
| --------------------------- | ------------------- | ---------------------------------------------------------- |
| shadcn-vue                  | Element Plus        | Less customizable, larger bundle                           |
| shadcn-vue                  | Naive UI            | Different design language, larger bundle                   |
| pinia-plugin-persistedstate | Manual localStorage | More boilerplate, error-prone                              |
| $fetch                      | Axios               | Axios has interceptors built-in, but $fetch is Nuxt-native |
| VeeValidate                 | FormKit             | FormKit is more opinionated, paid pro version              |

## Architecture Patterns

### Recommended Project Structure

```
apps/site/
├── components/
│   ├── ui/                    # shadcn-vue components (auto-added by CLI)
│   │   ├── button/
│   │   ├── card/
│   │   ├── table/
│   │   ├── input/
│   │   ├── dialog/
│   │   └── ...
│   ├── layouts/
│   │   └── AdminLayout.vue    # Admin shell with sidebar + header
│   ├── admin/
│   │   ├── Sidebar.vue        # Collapsible navigation sidebar
│   │   ├── Header.vue         # Top bar with user menu
│   │   ├── posts/
│   │   │   ├── PostList.vue   # Article list table
│   │   │   └── PostEditor.vue # Article editor
│   │   ├── media/
│   │   │   └── MediaLibrary.vue
│   │   └── settings/
│   │       └── SettingsForm.vue
│   └── common/
│       ├── EmptyState.vue     # Reusable empty state component
│       └── LoadingFade.vue    # Progressive loading animation
├── pages/
│   └── admin/
│       ├── login.vue          # Login page
│       ├── dashboard.vue      # Main dashboard (optional)
│       ├── posts/
│       │   ├── index.vue      # Article list
│       │   └── [id].vue       # Article editor (create/edit)
│       ├── media/
│       │   └── index.vue      # Media library
│       ├── categories/
│       │   └── index.vue      # Category management
│       ├── tags/
│       │   └── index.vue      # Tag management
│       ├── themes/
│       │   └── index.vue      # Theme management
│       ├── plugins/
│       │   └── index.vue      # Plugin management
│       └── settings/
│           └── index.vue      # Site settings
├── middleware/
│   └── auth.global.ts         # Global auth middleware for admin routes
├── stores/
│   ├── auth.ts                # Auth store with token persistence
│   └── ui.ts                  # UI state (sidebar collapsed, etc.)
├── composables/
│   ├── useAuth.ts             # Auth composable for API calls
│   └── useApi.ts              # Generic API composable
├── server/
│   └── api/v1/                # Existing API (Phase 4)
└── utils/
    └── api.ts                 # API utilities ($fetch with interceptors)
```

### Pattern 1: Authentication Flow

**What:** JWT-based authentication with localStorage persistence

**When to use:** All admin pages require authentication

**Example:**

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import type { UserObject } from '~/server/services/auth.service'

export interface AuthState {
  token: string | null
  user: UserObject | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    isLoggedIn: false,
  }),

  actions: {
    setAuth(token: string, user: UserObject) {
      this.token = token
      this.user = user
      this.isLoggedIn = true
    },

    logout() {
      this.token = null
      this.user = null
      this.isLoggedIn = false
      // API call to blacklist token
      return $fetch('/api/v1/auth/logout', { method: 'POST' })
    },
  },

  persist: {
    storage: persistedState.localStorage,
    paths: ['token', 'user'], // Only persist these fields
  },
})
```

**Source:** [Pinia documentation](https://pinia.vuejs.org/), [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/)

### Pattern 2: Protected Routes with Middleware

**What:** Route middleware to check authentication before accessing admin pages

**When to use:** All pages under `/admin/*`

**Example:**

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Only apply to admin routes
  if (!to.path.startsWith('/admin')) {
    return
  }

  // Skip login page
  if (to.path === '/admin/login') {
    return
  }

  // Check for token in store (loaded from localStorage)
  const authStore = useAuthStore()

  if (!authStore.token) {
    // Redirect to login with return URL
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.path)}`)
  }

  // Optionally verify token is still valid
  try {
    await $fetch('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
  } catch {
    // Token invalid, clear auth and redirect
    authStore.logout()
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.path)}`)
  }
})
```

**Source:** [Nuxt 3 Route Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)

### Pattern 3: API Composable with Error Handling

**What:** Reusable composable for API calls with auth headers and error handling

**When to use:** All components that fetch data from API

**Example:**

```typescript
// composables/useApi.ts
export function useApi() {
  const authStore = useAuthStore()
  const toast = useToast() // from shadcn-vue toast

  const getAuthHeaders = () => ({
    headers: {
      Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
    },
  })

  const handleApiError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage
    toast.create({
      title: '错误',
      description: message,
      variant: 'destructive',
    })
  }

  const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T | null> => {
    try {
      return await $fetch(url, {
        ...options,
        ...getAuthHeaders(),
      })
    } catch (error) {
      handleApiError(error, '请求失败')
      return null
    }
  }

  return {
    fetchApi,
    getAuthHeaders,
  }
}
```

### Pattern 4: Data Table with Pagination

**What:** Table component with server-side pagination, sorting, filtering

**When to use:** Article list, media library, category/tag management

**Example:**

```vue
<!-- components/admin/posts/PostList.vue -->
<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Post } from '~/server/schemas/posts'

interface PostListResponse {
  success: true
  data: Post[]
  meta: {
    total: number
    limit: number
    offset: number
    totalPages: number
    currentPage: number
  }
}

const { fetchApi } = useApi()

const posts = ref<Post[]>([])
const meta = ref<PostListResponse['meta']>({
  total: 0,
  limit: 10,
  offset: 0,
  totalPages: 0,
  currentPage: 1,
})
const loading = ref(false)

// Query parameters
const filters = ref({
  category: '',
  tag: '',
  status: '',
  search: '',
  sort: 'createdAt',
  order: 'desc' as 'asc' | 'desc',
})

async function loadPosts(page = 1) {
  loading.value = true
  const limit = meta.value.limit
  const offset = (page - 1) * limit

  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...filters.value,
  })

  const response = await fetchApi<PostListResponse>(`/api/v1/posts?${query}`)

  if (response?.success) {
    posts.value = response.data
    meta.value = response.meta
  }

  loading.value = false
}

// Pagination helpers
const totalPages = computed(() => meta.value.totalPages)
const currentPage = computed(() => meta.value.currentPage)
</script>

<template>
  <div class="w-full">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead class="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="post in posts" :key="post.id">
            <TableCell>{{ post.title }}</TableCell>
            <TableCell>
              <Badge :variant="post.status === 'published' ? 'default' : 'secondary'">
                {{ post.status }}
              </Badge>
            </TableCell>
            <TableCell>{{ post.category?.name || '-' }}</TableCell>
            <TableCell>
              <div class="flex gap-1">
                <Badge v-for="tag in post.tags" :key="tag.id" variant="outline">
                  {{ tag.name }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(post.createdAt) }}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" @click="$router.push(`/admin/posts/${post.id}`)">
                编辑
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <Button variant="outline" :disabled="currentPage === 1" @click="loadPosts(currentPage - 1)">
        上一页
      </Button>
      <span class="text-sm text-muted-foreground">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <Button
        variant="outline"
        :disabled="currentPage === totalPages"
        @click="loadPosts(currentPage + 1)"
      >
        下一页
      </Button>
    </div>
  </div>
</template>
```

**Source:** [shadcn-vue Table](https://shadcn-vue.com/docs/components/table)

### Pattern 5: File Upload with Progress

**What:** Drag-and-drop file upload with progress indicator

**When to use:** Media library upload

**Example:**

```vue
<!-- components/admin/media/UploadArea.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useDropzone } from 'vue3-dropzone'

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const emit = defineEmits<{
  uploadComplete: [media: MediaRecord]
}>()

const uploads = ref<UploadProgress[]>([])
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: handleFiles,
  multiple: true,
})

const { fetchApi } = useApi()

async function handleFiles(files: File[]) {
  for (const file of files) {
    const upload: UploadProgress = {
      file,
      progress: 0,
      status: 'pending',
    }
    uploads.value.push(upload)
    await uploadFile(upload)
  }
}

async function uploadFile(upload: UploadProgress) {
  upload.status = 'uploading'

  const formData = new FormData()
  formData.append('file', upload.file)

  try {
    // Note: $fetch doesn't support progress events natively
    // Use native fetch for progress tracking
    const response = await fetch('/api/v1/media', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          upload.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
    })

    const result = await response.json()

    if (result.success) {
      upload.status = 'success'
      emit('uploadComplete', result.data)
    } else {
      upload.status = 'error'
      upload.error = result.error?.message
    }
  } catch (error) {
    upload.status = 'error'
    upload.error = error instanceof Error ? error.message : 'Upload failed'
  }
}

function cancelUpload(upload: UploadProgress) {
  // AbortController would be needed for actual cancellation
  upload.status = 'error'
  upload.error = 'Cancelled'
}
</script>

<template>
  <div
    v-bind="getRootProps()"
    class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
    :class="{ 'border-primary bg-primary/5': isDragActive }"
  >
    <input v-bind="getInputProps()" />
    <div class="space-y-2">
      <p class="text-lg">
        <template v-if="isDragActive"> 释放以上传文件 </template>
        <template v-else> 拖拽文件到此处，或点击选择文件 </template>
      </p>
      <p class="text-sm text-muted-foreground">支持图片、文档等格式</p>
    </div>
  </div>

  <!-- Upload progress list -->
  <div class="mt-4 space-y-2">
    <div
      v-for="upload in uploads"
      :key="upload.file.name"
      class="flex items-center gap-3 p-3 border rounded-md"
    >
      <div class="flex-1">
        <p class="text-sm font-medium">{{ upload.file.name }}</p>
        <div class="h-2 bg-secondary rounded-full mt-1">
          <div
            class="h-full bg-primary rounded-full transition-all"
            :style="{ width: `${upload.progress}%` }"
          />
        </div>
      </div>
      <span class="text-sm text-muted-foreground">{{ upload.progress }}%</span>
      <Button
        v-if="upload.status === 'uploading'"
        variant="ghost"
        size="sm"
        @click="cancelUpload(upload)"
      >
        取消
      </Button>
    </div>
  </div>
</template>
```

**Note:** For proper progress tracking, consider using `vue3-dropzone` or native fetch with `onUploadProgress`.

### Anti-Patterns to Avoid

- **Don't store tokens in Pinia only:** Must persist to localStorage to survive page refresh
- **Don't use global middleware for API routes:** API has its own middleware, frontend middleware is for page routing
- **Don't skip token validation:** Always verify token on initial page load before showing admin content
- **Don't block on every API call:** Only check token expiry on page load, not every request
- **Don't use skeletons for loading:** Per decisions, use progressive fade-in animation instead

## Don't Hand-Roll

| Problem              | Don't Build                      | Use Instead                           | Why                                            |
| -------------------- | -------------------------------- | ------------------------------------- | ---------------------------------------------- |
| UI Components        | Custom buttons, inputs, dialogs  | shadcn-vue                            | Accessible, customizable, consistent design    |
| Form Validation      | Custom validation logic          | VeeValidate + shadcn Form             | Battle-tested, schema-based, good DX           |
| File Upload Progress | Raw XMLHttpRequest               | vue3-dropzone or native fetch         | Handles edge cases, browser compatibility      |
| Token Storage        | Manual localStorage handling     | pinia-plugin-persistedstate           | Automatic sync, SSR-safe                       |
| Icons                | Custom SVG icons                 | lucide-vue-next                       | Consistent style, tree-shakable                |
| Toast Notifications  | Custom notification system       | shadcn-vue Toast (Sonner)             | Accessible, position management                |
| Sidebar              | Custom collapsible sidebar       | shadcn-vue Sidebar                    | Handles mobile, keyboard nav, focus management |
| Data Table           | Raw HTML table with custom logic | shadcn-vue Table + TanStack Vue Table | Sorting, filtering, pagination built-in        |

**Key insight:** shadcn-vue provides unstyled, accessible primitives that copy source code into your project, giving full customization while maintaining best practices.

## Common Pitfalls

### Pitfall 1: Token Expiry Not Handled

**What goes wrong:** Token expires but UI doesn't detect it, leading to silent API failures

**Why it happens:** Only checking for token existence, not validity

**How to avoid:**

```typescript
// middleware/auth.global.ts
try {
  await $fetch('/api/v1/auth/me', { headers })
} catch (error) {
  if (error.statusCode === 401) {
    authStore.logout()
    return navigateTo('/admin/login')
  }
}
```

**Warning signs:** User sees blank admin pages after token expiry

### Pitfall 2: SSR/CSR Mismatch with localStorage

**What goes wrong:** Pinia store tries to access localStorage during SSR, causing hydration errors

**Why it happens:** persistedstate plugin needs client-side only execution

**How to avoid:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['pinia-plugin-persistedstate/nuxt'],
  piniaPluginPersistedstate: {
    storage: 'localStorage', // Only runs on client
  },
})
```

**Warning signs:** "localStorage is not defined" errors in console

### Pitfall 3: Admin Layout Not Responsive

**What goes wrong:** Sidebar overlaps content on smaller screens

**Why it happens:** Desktop-first approach without mobile breakpoints

**How to avoid:**

```vue
<SidebarProvider :collapsible="'offcanvas'">
  <!-- Mobile: offcanvas overlay, Desktop: inline -->
</SidebarProvider>
```

**Warning signs:** Horizontal scrollbar on viewport < 1024px

### Pitfall 4: Form State Lost on Navigation

**What goes wrong:** User navigates away from edit form, loses unsaved changes

**Why it happens:** No dirty check before navigation

**How to avoid:**

```typescript
// Use Vue Router beforeRouteLeave or Nuxt's onBeforeRouteLeave
onBeforeRouteLeave((to, from) => {
  if (form.dirty && !form.saved) {
    return confirm('有未保存的更改，确定要离开吗？')
  }
})
```

**Warning signs:** User complains about lost work

### Pitfall 5: Upload Progress Not Showing

**What goes wrong:** File upload appears frozen (no progress feedback)

**Why it happens:** $fetch doesn't expose upload progress events

**How to avoid:** Use native fetch or axios for file uploads:

```typescript
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    progress.value = Math.round((e.loaded * 100) / e.total)
  }
})
```

**Warning signs:** Upload appears instant or frozen at 0%

## Code Examples

### Login Page

```vue
<!-- pages/admin/login.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { useRouter, useRoute } from '#app'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(2, '用户名至少 2 个字符'),
    password: z.string().min(6, '密码至少 6 个字符'),
  })
)

const { handleSubmit, errors } = useForm({
  validationSchema: formSchema,
})

const loading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true

  try {
    const response = await $fetch('/api/v1/auth/login', {
      method: 'POST',
      body: values,
    })

    if (response.success) {
      authStore.setAuth(response.data.token, response.data.user)

      toast({
        title: '登录成功',
        description: `欢迎回来，${response.data.user.username}`,
      })

      // Redirect to original destination or dashboard
      const redirect = (route.query.redirect as string) || '/admin/posts'
      await router.push(redirect)
    }
  } catch (error) {
    toast({
      title: '登录失败',
      description: error instanceof Error ? error.message : '用户名或密码错误',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>后台管理登录</CardTitle>
        <CardDescription>输入用户名和密码登录</CardDescription>
      </CardHeader>
      <form @submit="onSubmit">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="username">用户名</Label>
            <Input
              id="username"
              v-model="values.username"
              type="text"
              placeholder="请输入用户名"
              :disabled="loading"
            />
            <p v-if="errors.username" class="text-sm text-destructive">
              {{ errors.username }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="password">密码</Label>
            <Input
              id="password"
              v-model="values.password"
              type="password"
              placeholder="请输入密码"
              :disabled="loading"
            />
            <p v-if="errors.password" class="text-sm text-destructive">
              {{ errors.password }}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
```

### Admin Layout with Sidebar

```vue
<!-- components/layouts/AdminLayout.vue -->
<script setup lang="ts">
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  {
    group: '内容管理',
    items: [
      { name: '文章管理', icon: 'FileText', path: '/admin/posts' },
      { name: '媒体库', icon: 'Image', path: '/admin/media' },
      { name: '分类管理', icon: 'Folder', path: '/admin/categories' },
      { name: '标签管理', icon: 'Tags', path: '/admin/tags' },
    ],
  },
  {
    group: '系统管理',
    items: [
      { name: '主题管理', icon: 'Palette', path: '/admin/themes' },
      { name: '插件管理', icon: 'Puzzle', path: '/admin/plugins' },
      { name: '站点设置', icon: 'Settings', path: '/admin/settings' },
    ],
  },
]

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <SidebarProvider class="min-h-screen">
    <Sidebar>
      <SidebarHeader class="border-b p-4">
        <h2 class="text-lg font-semibold">博客管理后台</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup v-for="section in navigation" :key="section.group">
          <SidebarGroupLabel>{{ section.group }}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in section.items" :key="item.name">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith(item.path)">
                <NuxtLink :to="item.path">
                  <Icon :name="item.icon" class="w-5 h-5" />
                  <span>{{ item.name }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="flex items-center gap-3 w-full">
              <Avatar class="w-8 h-8">
                <AvatarFallback>{{ authStore.user?.username?.[0]?.toUpperCase() }}</AvatarFallback>
              </Avatar>
              <div class="text-left">
                <p class="text-sm font-medium">{{ authStore.user?.username }}</p>
                <p class="text-xs text-muted-foreground">{{ authStore.user?.role }}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" class="w-[200px]">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="router.push('/admin/settings')"> 设置 </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="handleLogout">
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>

    <main class="flex-1 overflow-auto p-6">
      <slot />
    </main>
  </SidebarProvider>
</template>
```

### Simple Markdown Editor

````vue
<!-- components/admin/posts/SimpleEditor.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const textareaRef = ref<HTMLTextAreaElement>()

function insertText(before: string, after = '') {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.slice(start, end)

  const newText = content.value.slice(0, start) + before + selectedText + after + content.value.slice(end)
  content.value = newText

  // Restore cursor position
  nextTick(() => {
    textarea.focus()
    textarea.selectionStart = start + before.length
    textarea.selectionEnd = end + before.length
  })
}

function insertHeading(level: number) {
  const prefix = '#'.repeat(level) + ' '
  insertText(prefix)
}

function insertImage() {
  const url = prompt('请输入图片 URL:')
  if (url) {
    insertText(`![图片描述](${url})`)
  }
}
</script>

<template>
  <div class="border rounded-md">
    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-2 border-b bg-muted/50">
      <Button variant="ghost" size="sm" @click="insertHeading(1)" title="标题 1">
        H1
      </Button>
      <Button variant="ghost" size="sm" @click="insertHeading(2)" title="标题 2">
        H2
      </Button>
      <Button variant="ghost" size="sm" @click="insertHeading(3)" title="标题 3">
        H3
      </Button>
      <Separator orientation="vertical" class="h-6 mx-2" />
      <Button variant="ghost" size="sm" @click="insertText('**', '**')" title="加粗">
        <strong>B</strong>
      </Button>
      <Button variant="ghost" size="sm" @click="insertText('*', '*')" title="斜体">
        <em>I</em>
      </Button>
      <Button variant="ghost" size="sm" @click="insertText('- [ ] ', '')" title="任务列表">
        ☐
      </Button>
      <Separator orientation="vertical" class="h-6 mx-2" />
      <Button variant="ghost" size="sm" @click="insertText('> ', '')" title="引用">
        ❝
      </Button>
      <Button variant="ghost" size="sm" @click="insertText('```\n', '\n```')" title="代码块">
        {'</>'}
      </Button>
      <Button variant="ghost" size="sm" @click="insertImage()" title="插入图片">
        🖼️
      </Button>
    </div>

    <!-- Editor -->
    <textarea
      ref="textareaRef"
      v-model="content"
      class="w-full min-h-[400px] p-4 font-mono text-sm resize-y focus:outline-none"
      placeholder="使用 Markdown 语法编写文章..."
    />
  </div>
</template>
````

## State of the Art

| Old Approach                     | Current Approach                   | When Changed | Impact                                    |
| -------------------------------- | ---------------------------------- | ------------ | ----------------------------------------- |
| Component libraries (Element UI) | shadcn-vue (copy source)           | 2024         | Full customization, no runtime dependency |
| Vuex                             | Pinia                              | 2023         | Better TypeScript, lighter weight         |
| Options API                      | Composition API + `<script setup>` | 2023         | Better code organization, type inference  |
| Nuxt 2 Options API               | Nuxt 3 Composition API             | 2023         | Better DX, auto-imports                   |
| CSS frameworks (Bootstrap)       | Tailwind CSS + shadcn              | 2024         | Smaller bundles, custom designs           |

**Deprecated/outdated:**

- Vuex: Use Pinia instead (Vuex 5 cancelled, Pinia is official recommendation)
- Nuxt 2: EOL, use Nuxt 3 (current LTS)
- Options API for new code: Use Composition API with `<script setup>`

## Open Questions

1. **TanStack Vue Table integration**
   - What we know: shadcn-vue Table is unstyled, TanStack provides advanced features
   - What's unclear: Whether to add TanStack Vue Table for complex sorting/filtering
   - Recommendation: Start with basic shadcn Table, add TanStack if needed for advanced features

2. **Toast notification library choice**
   - What we know: shadcn-vue uses Sonner (vue-sonner) for toasts
   - What's unclear: Current shadcn-vue Toast component availability
   - Recommendation: Use vue-sonner or shadcn-vue Toast as available

3. **Simple editor vs WYSIWYG for Phase 5**
   - What we know: Phase 5 uses simple editor, Phase 9 upgrades to TipTap + Vditor
   - What's unclear: How much Markdown toolbar functionality to include
   - Recommendation: Basic toolbar only (headings, bold, italic, links, images, code blocks)

## Validation Architecture

### Test Framework

| Property           | Value                             |
| ------------------ | --------------------------------- |
| Framework          | Vitest (already configured)       |
| Config file        | `apps/site/vitest.config.ts`      |
| Quick run command  | `pnpm -C apps/site test:run`      |
| Full suite command | `pnpm -C apps/site test:coverage` |

### Phase Requirements → Test Map

| Req ID   | Behavior         | Test Type   | Automated Command                                        | File Exists? |
| -------- | ---------------- | ----------- | -------------------------------------------------------- | ------------ |
| ADMIN-01 | 后台布局组件渲染 | Component   | `vitest run tests/components/admin/AdminLayout.test.ts`  | ❌ Wave 0    |
| ADMIN-02 | 文章列表展示分页 | Component   | `vitest run tests/components/admin/PostList.test.ts`     | ❌ Wave 0    |
| ADMIN-03 | 文章编辑表单验证 | Component   | `vitest run tests/components/admin/PostEditor.test.ts`   | ❌ Wave 0    |
| ADMIN-04 | 媒体库上传功能   | Component   | `vitest run tests/components/admin/MediaLibrary.test.ts` | ❌ Wave 0    |
| ADMIN-05 | 分类标签 CRUD    | Integration | `vitest run tests/admin/categories.test.ts`              | ❌ Wave 0    |
| ADMIN-06 | 插件管理页面     | Component   | `vitest run tests/components/admin/PluginsList.test.ts`  | ❌ Wave 0    |
| ADMIN-07 | 主题管理切换     | Integration | `vitest run tests/admin/themes.test.ts`                  | ❌ Wave 0    |
| ADMIN-08 | 设置页面表单     | Component   | `vitest run tests/components/admin/SettingsForm.test.ts` | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `pnpm -C apps/site test:run`
- **Per wave merge:** `pnpm -C apps/site test:coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/site/tests/components/admin/` — Component test directory
- [ ] `apps/site/tests/admin/` — Integration test directory
- [ ] `apps/site/tests/fixtures/auth.ts` — Auth fixtures
- [ ] `apps/site/tests/mocks/api.ts` — API mock handlers
- [ ] Test utils for component mounting with Pinia

## Sources

### Primary (HIGH confidence)

- [shadcn-vue Documentation](https://www.shadcn-vue.com/) - Component installation and usage
- [Nuxt 3 Documentation](https://nuxt.com/docs) - File routing, middleware, data fetching
- [Pinia Documentation](https://pinia.vuejs.org/) - Store patterns, Nuxt integration
- [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/) - localStorage persistence

### Secondary (MEDIUM confidence)

- [Nuxt 3 Route Middleware Examples](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Vue 3 Composition API Best Practices](https://vuejs.org/guide/reusability/composables.html)
- Web search results for admin dashboard patterns

### Tertiary (LOW confidence)

- Community patterns from GitHub repositories (verified against official docs)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Based on official shadcn-vue, Nuxt 3, and Pinia documentation
- Architecture: HIGH - Follows established patterns from official sources
- Pitfalls: MEDIUM - Based on common Vue/Nuxt issues, some inferred from documentation

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (90 days - stable ecosystem)
