<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ isEdit ? '编辑文章' : '新建文章' }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          {{ isEdit ? '修改文章内容和信息' : '创建一篇新的博客文章' }}
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink
          to="/admin/articles"
          class="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          返回列表
        </NuxtLink>
        <button
          @click="saveArticle('draft')"
          :disabled="saving"
          class="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          保存草稿
        </button>
        <button
          @click="saveArticle('published')"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ saving ? '保存中...' : (isEdit ? '更新发布' : '发布文章') }}
        </button>
      </div>
    </div>

    <!-- 表单 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：主要内容 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 标题 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文章标题 *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="请输入文章标题"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <!-- 编辑器 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文章内容 *
          </label>
          <!-- 简化版：使用 textarea，未来可替换为富文本编辑器 -->
          <textarea
            id="content"
            v-model="form.content"
            rows="20"
            placeholder="支持 Markdown 语法..."
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          ></textarea>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            支持 Markdown 语法，未来将提供富文本编辑器
          </p>
        </div>
      </div>

      <!-- 右侧：设置 -->
      <div class="space-y-6">
        <!-- 发布设置 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4">发布设置</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                状态
              </label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="scheduled">定时发布</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Slug（URL 后缀）
              </label>
              <input
                v-model="form.slug"
                type="text"
                placeholder="自定义 URL（留空自动生成）"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 分类 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4">分类</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label
              v-for="category in categories"
              :key="category.id"
              class="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                :value="category.id"
                :checked="form.categoryIds.includes(category.id)"
                @change="toggleCategory(category.id)"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</span>
            </label>
            <p v-if="categories.length === 0" class="text-xs text-gray-500 dark:text-gray-400">
              暂无分类，请先创建分类
            </p>
          </div>
          <NuxtLink to="/admin/categories" class="text-xs text-blue-600 hover:underline mt-2 inline-block">
            管理分类
          </NuxtLink>
        </div>

        <!-- 标签 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4">标签</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label
              v-for="tag in tags"
              :key="tag.id"
              class="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                :value="tag.id"
                :checked="form.tagIds.includes(tag.id)"
                @change="toggleTag(tag.id)"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ tag.name }}</span>
            </label>
            <p v-if="tags.length === 0" class="text-xs text-gray-500 dark:text-gray-400">
              暂无标签，请先创建标签
            </p>
          </div>
          <NuxtLink to="/admin/tags" class="text-xs text-blue-600 hover:underline mt-2 inline-block">
            管理标签
          </NuxtLink>
        </div>

        <!-- 封面图 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4">封面图</h3>
          <input
            v-model="form.coverImage"
            type="url"
            placeholder="输入图片 URL"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm mb-3"
          />
          <div v-if="form.coverImage" class="mt-3 rounded-lg overflow-hidden">
            <img :src="form.coverImage" alt="封面预览" class="w-full h-32 object-cover" />
          </div>
        </div>

        <!-- 摘要 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-4">摘要</h3>
          <textarea
            v-model="form.summary"
            rows="3"
            placeholder="文章摘要，用于列表页显示"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm resize-none"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// 是否是编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = ref({
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  status: 'draft',
  categoryIds: [],
  tagIds: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
})

const categories = ref([])
const tags = ref([])
const saving = ref(false)

// 切换分类
const toggleCategory = (id) => {
  const index = form.value.categoryIds.indexOf(id)
  if (index === -1) {
    form.value.categoryIds.push(id)
  } else {
    form.value.categoryIds.splice(index, 1)
  }
}

// 切换标签
const toggleTag = (id) => {
  const index = form.value.tagIds.indexOf(id)
  if (index === -1) {
    form.value.tagIds.push(id)
  } else {
    form.value.tagIds.splice(index, 1)
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const data = await $fetch('/api/categories')
    categories.value = data.data || []
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

// 加载标签
const loadTags = async () => {
  try {
    const data = await $fetch('/api/tags')
    tags.value = data.data || []
  } catch (e) {
    console.error('Failed to load tags:', e)
  }
}

// 加载文章（编辑模式）
const loadArticle = async () => {
  if (!isEdit.value) return

  try {
    const article = await $fetch(`/api/articles/${route.params.id}`)
    form.value = {
      ...article,
      categoryIds: article.categories?.map((c) => c.id) || [],
      tagIds: article.tags?.map((t) => t.id) || [],
    }
  } catch (e) {
    console.error('Failed to load article:', e)
    alert('加载文章失败')
  }
}

// 保存文章
const saveArticle = async (status) => {
  // 验证必填字段
  if (!form.value.title.trim()) {
    alert('请输入文章标题')
    return
  }
  if (!form.value.content.trim()) {
    alert('请输入文章内容')
    return
  }

  try {
    saving.value = true

    const payload = {
      ...form.value,
      status,
    }

    if (isEdit.value) {
      // 更新
      await $fetch(`/api/articles/${route.params.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      // 创建
      const result = await $fetch('/api/articles', {
        method: 'POST',
        body: payload,
      })
      // 跳转到编辑页
      router.push(`/admin/articles/edit/${result.id}`)
      return
    }

    alert('保存成功')
  } catch (e) {
    console.error('Failed to save article:', e)
    alert('保存失败：' + (e.data?.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([loadCategories(), loadTags(), loadArticle()])
})
</script>
