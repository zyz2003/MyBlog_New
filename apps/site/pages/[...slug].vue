<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : param
})

const { getPageBySlug } = usePublicApi()

const { data } = await useAsyncData(
  () => `page-${slug.value}`,
  () => getPageBySlug(slug.value),
  { watch: [slug] },
)

if (!data.value?.data) {
  throw createError({ statusCode: 404, message: '页面不存在' })
}

const page = computed(() => data.value!.data)

useSeoMeta({
  title: () => page.value?.seoTitle || page.value?.title || '',
  ogTitle: () => page.value?.seoTitle || page.value?.title || '',
  description: () => page.value?.seoDescription || '',
  ogDescription: () => page.value?.seoDescription || '',
})
</script>

<template>
  <ClientOnly v-if="page">
    <DynamicPageRenderer :code="page.componentCode" />
    <template #fallback>
      <div class="py-12 text-center text-gray-400">
        加载中...
      </div>
    </template>
  </ClientOnly>
</template>
