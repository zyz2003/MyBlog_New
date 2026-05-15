<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleDark } = useTheme()
const configExpanded = ref(false)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToComments() {
  const el = document.getElementById('post-comment')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function scrollToToc() {
  const el = document.getElementById('post-toc')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function toggleSidebar() {
  document.documentElement.classList.toggle('hide-aside')
}
</script>

<template>
  <div id="rightside" class="fixed right-3 bottom-1/3 z-40 flex flex-col gap-1.5 transition-all duration-300">
    <!-- Hidden group (expandable) -->
    <div v-show="configExpanded" id="rightside-config-hide" class="flex flex-col gap-1.5">
      <button
        id="readmode"
        type="button"
        title="阅读模式"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm"
        @click="document.documentElement.classList.toggle('read-mode')"
      >
        <i class="anzhiyufont anzhiyu-icon-book-open" />
      </button>

      <button
        id="darkmode"
        type="button"
        title="深色模式"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm"
        @click="toggleDark"
      >
        <i v-if="isDark" class="anzhiyufont anzhiyu-icon-moon" />
        <i v-else class="anzhiyufont anzhiyu-icon-sun" />
      </button>

      <button
        id="hide-aside-btn"
        type="button"
        title="切换侧栏"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm"
        @click="toggleSidebar"
      >
        <i class="anzhiyufont anzhiyu-icon-arrows-left-right" />
      </button>

      <button
        id="mobile-toc-button"
        type="button"
        title="目录"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm md:hidden"
        @click="scrollToToc"
      >
        <i class="anzhiyufont anzhiyu-icon-list-ul" />
      </button>

      <button
        id="chat-btn"
        type="button"
        title="聊天"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm hidden"
      >
        <i class="anzhiyufont anzhiyu-icon-comment-sms" />
      </button>

      <a
        id="to_comment"
        title="评论"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm no-underline"
        href="#post-comment"
        @click.prevent="scrollToComments"
      >
        <i class="anzhiyufont anzhiyu-icon-comments" />
      </a>
    </div>

    <!-- Expand/collapse config gear -->
    <button
      id="rightside-config"
      type="button"
      title="设置"
      class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm"
      @click="configExpanded = !configExpanded"
    >
      <i class="anzhiyufont anzhiyu-icon-gear" />
    </button>

    <!-- Scroll to top (always visible) -->
    <button
      id="go-up"
      type="button"
      title="回到顶部"
      class="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--anzhiyu-card-bg)] text-[var(--anzhiyu-fontcolor)] hover:text-[var(--anzhiyu-white)] hover:bg-[var(--anzhiyu-main)] border border-[var(--style-border-always)] cursor-pointer transition-colors text-base shadow-sm"
      @click="scrollToTop"
    >
      <i class="anzhiyufont anzhiyu-icon-arrow-up" />
    </button>
  </div>
</template>
