<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '~/components/ui/toast/use-toast'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-vue-next'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  status: 'draft' | 'published' | 'archived' | 'reviewing'
  authorId: string
  categoryId: string | null
  category?: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string; slug: string }[]
  viewCount: number
  likeCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const router = useRouter()
const route = useRoute()
const { toast } = useToast()

// Loading state
const loading = ref(false)
const saving = ref(false)

// Post data
const post = ref<Partial<Post>>({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
  categoryId: null,
  tags: [],
})

// Categories and tags
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// Form validation errors
const errors = ref<Record<string, string>>({})

// Auto-save timer
let autoSaveTimer: NodeJS.Timeout | null = null

// Is new post mode
const isNewPost = computed(() => route.params.id === 'new' || route.params.id === 'undefined')

// Is edit mode
const isEditMode = computed(() => !isNewPost.value)

// Fetch post data
async function fetchPost() {
  if (isNewPost.value) return

  loading.value = true
  try {
    const data = await $fetch<Post>(`/api/v1/posts/${route.params.id}`)
    post.value = {
      ...data,
      tags: data.tags || [],
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    toast({
      title: '加载失败',
      description: '无法加载文章数据',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}

// Fetch categories
async function fetchCategories() {
  try {
    categories.value = await $fetch<Category[]>('/api/v1/categories')
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// Fetch tags
async function fetchTags() {
  try {
    tags.value = await $fetch<Tag[]>('/api/v1/tags')
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

// Generate slug from title
function generateSlug() {
  if (!post.value.title) return
  const slug = post.value.title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  post.value.slug = slug
}

// Validate form
function validateForm(): boolean {
  errors.value = {}

  if (!post.value.title || post.value.title.trim().length < 2) {
    errors.value.title = '标题至少需要 2 个字符'
  }

  if (!post.value.slug) {
    errors.value.slug = 'Slug 不能为空'
  }

  if (!post.value.content) {
    errors.value.content = '内容不能为空'
  }

  return Object.keys(errors.value).length === 0
}

// Save post
async function savePost() {
  if (!validateForm()) {
    toast({
      title: '验证失败',
      description: '请检查表单填写是否正确',
      variant: 'destructive',
    })
    return
  }

  saving.value = true
  try {
    const payload = {
      title: post.value.title,
      slug: post.value.slug,
      content: post.value.content,
      excerpt: post.value.excerpt,
      coverImage: post.value.coverImage,
      seoTitle: post.value.seoTitle,
      seoDescription: post.value.seoDescription,
      status: post.value.status,
      categoryId: post.value.categoryId,
      tagIds: post.value.tags?.map(t => t.id) || [],
    }

    if (isNewPost.value) {
      // Create new post
      const data = await $fetch<Post>('/api/v1/posts', {
        method: 'POST',
        body: payload,
      })
      toast({
        title: '创建成功',
        description: '文章已创建',
      })
      router.push(`/admin/posts/${data.id}`)
    } else {
      // Update existing post
      await $fetch<Post>(`/api/v1/posts/${route.params.id}`, {
        method: 'PUT',
        body: payload,
      })
      toast({
        title: '保存成功',
        description: '文章已更新',
      })
    }
  } catch (error) {
    console.error('Failed to save post:', error)
    toast({
      title: '保存失败',
      description: '请稍后重试',
      variant: 'destructive',
    })
  } finally {
    saving.value = false
  }
}

// Auto-save draft
async function autoSave() {
  if (isNewPost.value || !post.value.id || saving.value) return

  // Only auto-save if there are changes
  const payload = {
    title: post.value.title,
    slug: post.value.slug,
    content: post.value.content,
    excerpt: post.value.excerpt,
    status: 'draft' as const,
  }

  try {
    await $fetch(`/api/v1/posts/${post.value.id}`, {
      method: 'PUT',
      body: payload,
    })
  } catch (error) {
    console.error('Auto-save failed:', error)
  }
}

// Delete post
async function handleDelete() {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await $fetch(`/api/v1/posts/${route.params.id}`, { method: 'DELETE' })
    toast({
      title: '删除成功',
      description: '文章已删除',
    })
    router.push('/admin/posts')
  } catch (error) {
    console.error('Failed to delete post:', error)
    toast({
      title: '删除失败',
      description: '请稍后重试',
      variant: 'destructive',
    })
  }
}

// Navigate back
function handleBack() {
  router.back()
}

// Handle tag selection
function handleTagSelect(tagId: string) {
  const tag = tags.value.find(t => t.id === tagId)
  if (!tag) return

  if (!post.value.tags) {
    post.value.tags = []
  }

  const exists = post.value.tags.some(t => t.id === tagId)
  if (!exists) {
    post.value.tags.push(tag)
  }
}

// Remove tag
function removeTag(tagId: string) {
  if (!post.value.tags) return
  post.value.tags = post.value.tags.filter(t => t.id !== tagId)
}

// Watch for title changes to auto-generate slug
watch(
  () => post.value.title,
  (newTitle) => {
    if (isNewPost.value && !post.value.slug) {
      generateSlug()
    }
  }
)

// Setup auto-save interval
onMounted(() => {
  fetchPost()
  fetchCategories()
  fetchTags()

  // Auto-save every 30 seconds
  autoSaveTimer = setInterval(() => {
    if (isEditMode.value && post.value.id) {
      autoSave()
    }
  }, 30000)
})

// Cleanup
onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="handleBack">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">
              {{ isNewPost ? '新建文章' : '编辑文章' }}
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              {{ isNewPost ? '创建一篇新博客文章' : '修改文章内容和设置' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Button v-if="isEditMode" variant="outline" @click="handleDelete">
            <Trash2 class="h-4 w-4 mr-2" />
            删除
          </Button>
          <Button variant="outline">
            <Eye class="h-4 w-4 mr-2" />
            预览
          </Button>
          <Button @click="savePost" :disabled="saving">
            <Save class="h-4 w-4 mr-2" />
            {{ saving ? '保存中...' : '保存' }}
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-slate-500">加载中...</div>
      </div>

      <!-- Form -->
      <template v-else>
        <!-- Main Content Card -->
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>填写文章的标题、Slug 和正文内容</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Title -->
            <div class="space-y-2">
              <Label for="title">标题 <span class="text-red-500">*</span></Label>
              <Input
                id="title"
                v-model="post.title"
                placeholder="输入文章标题"
                :class="{ 'border-red-500': errors.title }"
              />
              <p v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</p>
            </div>

            <!-- Slug -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="slug">Slug <span class="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="generateSlug"
                  class="h-6 text-xs"
                >
                  从标题生成
                </Button>
              </div>
              <Input
                id="slug"
                v-model="post.slug"
                placeholder="article-url-slug"
                :class="{ 'border-red-500': errors.slug }"
              />
              <p v-if="errors.slug" class="text-sm text-red-500">{{ errors.slug }}</p>
            </div>

            <!-- Excerpt -->
            <div class="space-y-2">
              <Label for="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                v-model="post.excerpt"
                placeholder="文章摘要，用于列表页显示"
                rows="3"
              />
            </div>

            <!-- Content -->
            <div class="space-y-2">
              <Label for="content">正文内容 <span class="text-red-500">*</span></Label>
              <Textarea
                id="content"
                v-model="post.content"
                placeholder="使用 Markdown 语法编写文章内容"
                rows="20"
                class="font-mono text-sm"
                :class="{ 'border-red-500': errors.content }"
              />
              <p v-if="errors.content" class="text-sm text-red-500">{{ errors.content }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Settings Card -->
        <Card>
          <CardHeader>
            <CardTitle>文章设置</CardTitle>
            <CardDescription>配置文章的分类、标签、状态等属性</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Category -->
            <div class="space-y-2">
              <Label for="category">分类</Label>
              <Select v-model="post.categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无分类</SelectItem>
                  <SelectItem
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Tags -->
            <div class="space-y-2">
              <Label>标签</Label>
              <div class="flex flex-wrap gap-2 mb-2">
                <Badge
                  v-for="tag in post.tags"
                  :key="tag.id"
                  variant="secondary"
                  class="cursor-pointer"
                  @click="removeTag(tag.id)"
                >
                  {{ tag.name }}
                  <span class="ml-1">×</span>
                </Badge>
              </div>
              <Select @update:model-value="handleTagSelect">
                <SelectTrigger>
                  <SelectValue placeholder="添加标签" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="tag in tags"
                    :key="tag.id"
                    :value="tag.id"
                    :disabled="post.tags?.some(t => t.id === tag.id)"
                  >
                    {{ tag.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <Label for="status">状态</Label>
              <Select v-model="post.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="reviewing">审核中</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <!-- Cover Image -->
            <div class="space-y-2">
              <Label for="coverImage">封面图 URL</Label>
              <Input
                id="coverImage"
                v-model="post.coverImage"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <!-- SEO Section -->
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">SEO 设置</h3>
                <p class="text-xs text-slate-500">优化搜索引擎显示的标题和描述</p>
              </div>

              <div class="space-y-2">
                <Label for="seoTitle">SEO 标题</Label>
                <Input
                  id="seoTitle"
                  v-model="post.seoTitle"
                  placeholder="搜索引擎显示的标题（可选）"
                />
              </div>

              <div class="space-y-2">
                <Label for="seoDescription">SEO 描述</Label>
                <Textarea
                  id="seoDescription"
                  v-model="post.seoDescription"
                  placeholder="搜索引擎显示的描述（可选）"
                  rows="3"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </AdminLayout>
</template>
