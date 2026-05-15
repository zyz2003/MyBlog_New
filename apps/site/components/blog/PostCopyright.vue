<script setup lang="ts">
import { useSiteSettings } from '@/composables/frontend/useSiteSettings'

const props = defineProps<{
  author?: string
  articleUrl?: string
  title?: string
}>()

const { settings } = useSiteSettings()
const config = useRuntimeConfig()

const author = computed(() => props.author || config.public.siteName)
const url = computed(() => props.articleUrl || (typeof window !== 'undefined' ? window.location.href : ''))
</script>

<template>
  <div class="post-copyright max-w-[800px] mx-auto px-4 my-8">
    <div class="relative overflow-hidden rounded-2xl border border-[var(--style-border-always)] bg-[var(--anzhiyu-card-bg)] p-6">
      <!-- Copyright icon background -->
      <div class="copyright-cc-box absolute -top-4 -right-4 text-8xl opacity-5 text-[var(--anzhiyu-main)] select-none">
        <i class="anzhiyufont anzhiyu-icon-copyright" />
      </div>

      <div class="relative z-1 space-y-3">
        <!-- Author -->
        <div class="flex items-center gap-2 text-sm">
          <span class="text-[var(--anzhiyu-secondtext)]">文章作者：</span>
          <span class="text-[var(--anzhiyu-fontcolor)] font-medium">{{ author }}</span>
        </div>

        <!-- Article link -->
        <div class="flex items-center gap-2 text-sm">
          <span class="text-[var(--anzhiyu-secondtext)]">文章链接：</span>
          <a :href="url" class="text-[var(--anzhiyu-main)] no-underline hover:underline break-all">{{ url }}</a>
        </div>

        <!-- License -->
        <div class="flex items-center gap-2 text-sm">
          <span class="text-[var(--anzhiyu-secondtext)]">版权声明：</span>
          <span class="text-[var(--anzhiyu-fontcolor)]">
            本博客所有文章除特别声明外，均采用
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" class="text-[var(--anzhiyu-main)] no-underline hover:underline">CC BY-NC-SA 4.0</a>
            许可协议。转载请注明出处！
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
