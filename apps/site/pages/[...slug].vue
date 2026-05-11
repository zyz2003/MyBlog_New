<script setup lang="ts">
definePageMeta({ layout: 'frontend-default' })

const route = useRoute()
const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : param
})

const { getPageBySlug } = usePublicApi()

// Fetch database page
const { data } = await useAsyncData(
  () => `page-${slug.value}`,
  () => getPageBySlug(slug.value),
  { watch: [slug] },
)

const pageData = computed(() => data.value?.data)

useSeoMeta({
  title: () => pageData.value?.seoTitle || pageData.value?.title || '',
  ogTitle: () => pageData.value?.seoTitle || pageData.value?.title || '',
  description: () => pageData.value?.seoDescription || '',
  ogDescription: () => pageData.value?.seoDescription || '',
})
</script>

<template>
  <ClientOnly v-if="pageData">
    <DynamicPageRenderer :code="pageData.componentCode" />
    <template #fallback>
      <div class="py-12 text-center text-gray-400">
        加载中...
      </div>
    </template>
  </ClientOnly>
</template>