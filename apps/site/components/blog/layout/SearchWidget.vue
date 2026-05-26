<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div
        v-if="isOpen"
        class="search-overlay"
        @click.self="closeSearch"
      >
        <div class="search-dialog">
          <!-- Search input -->
          <div class="search-input-row">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="inputRef"
              v-model="localQuery"
              type="text"
              class="search-input"
              :placeholder="placeholder"
              autocomplete="off"
              @keydown.escape.prevent="closeSearch"
            />
            <button
              v-if="localQuery"
              class="search-clear-btn"
              @click="clearQuery"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <kbd class="search-esc-hint">ESC</kbd>
          </div>

          <!-- Results area -->
          <div v-if="localQuery.length > 0" class="search-results-area">
            <!-- Loading -->
            <div v-if="pending" class="search-loading">
              <div class="search-spinner" />
              <span>搜索中...</span>
            </div>

            <!-- Results list -->
            <div v-else-if="results.length > 0" class="search-results-list">
              <NuxtLink
                v-for="item in results"
                :key="item.slug || item.id"
                :to="buildArticleLink(item)"
                class="search-result-item"
                @click="closeSearch"
              >
                <div class="result-title">{{ item.title }}</div>
                <div v-if="item.excerpt" class="result-excerpt">{{ truncateExcerpt(item.excerpt) }}</div>
                <div v-if="item.category" class="result-category">{{ item.category }}</div>
              </NuxtLink>
            </div>

            <!-- No results -->
            <div v-else class="search-no-results">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>未找到相关文章</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="search-empty">
            <span>输入关键词搜索文章</span>
            <div class="search-shortcuts">
              <kbd>Ctrl+K</kbd> 搜索
              <kbd>Esc</kbd> 关闭
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useSearchWidget } from '~/composables/frontend/useSearchWidget'
import { useSiteSettings } from '~/composables/frontend/useSiteSettings'

interface SearchResult {
  id: number
  title: string
  slug?: string | null
  excerpt?: string
  category?: string
  publishedAt?: string | null
  createdAt?: string | null
}

const { isOpen, closeSearch } = useSearchWidget()
const { settings } = useSiteSettings()

const placeholder = computed(() => settings.value.search?.placeholder || '搜索文章...')
const maxResults = computed(() => settings.value.search?.maxResults || 10)

const inputRef = ref<HTMLInputElement | null>(null)
const localQuery = ref('')
const results = ref<SearchResult[]>([])
const pending = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Focus input when overlay opens
watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    localQuery.value = ''
    results.value = []
  }
})

// Debounced search
watch(localQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(() => performSearch(), 300)
})

function clearQuery() {
  localQuery.value = ''
  results.value = []
  inputRef.value?.focus()
}

async function performSearch() {
  const q = localQuery.value.trim()
  if (!q) return

  pending.value = true
  try {
    const data = await $fetch<{ code: number, data: { items: SearchResult[] } }>('/api/search', {
      params: { q, pageSize: maxResults.value },
    })
    results.value = data?.data?.items || []
  } catch {
    results.value = []
  } finally {
    pending.value = false
  }
}

function truncateExcerpt(excerpt: string, maxLen = 150): string {
  if (!excerpt) return ''
  return excerpt.length > maxLen ? excerpt.slice(0, maxLen) + '...' : excerpt
}

function buildArticleLink(item: SearchResult): string {
  if (item.slug) {
    return `/posts/${item.slug}`
  }
  // Fallback: use date-based path from publishedAt/createdAt
  const date = new Date(item.publishedAt || item.createdAt || Date.now())
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `/articles/${year}/${month}/${item.id}`
}
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.search-dialog {
  width: 640px;
  max-width: 90vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--anzhiyu-card-bg) 88%, transparent);
  border: 1px solid var(--style-border-always);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Input row */
.search-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--style-border-always);
}

.search-icon {
  flex-shrink: 0;
  color: var(--anzhiyu-secondtext);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 18px;
  color: var(--anzhiyu-fontcolor);
}

.search-input::placeholder {
  color: var(--anzhiyu-secondtext);
}

.search-clear-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: var(--anzhiyu-secondbg);
  color: var(--anzhiyu-secondtext);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.search-clear-btn:hover {
  background: var(--anzhiyu-main);
  color: var(--anzhiyu-white);
}

.search-esc-hint {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  font-family: inherit;
  color: var(--anzhiyu-secondtext);
  background: var(--anzhiyu-secondbg);
  border: 1px solid var(--style-border-always);
  border-radius: 4px;
}

/* Results area */
.search-results-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: var(--anzhiyu-secondtext);
  font-size: 14px;
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--style-border-always);
  border-top-color: var(--anzhiyu-main);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-results-list {
  display: flex;
  flex-direction: column;
}

.search-result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
  text-decoration: none;
  color: var(--anzhiyu-fontcolor);
  transition: background 0.2s;
}

.search-result-item:hover {
  background: color-mix(in srgb, var(--anzhiyu-main) 8%, transparent);
}

.result-title {
  font-size: 15px;
  font-weight: 500;
}

.result-excerpt {
  font-size: 13px;
  color: var(--anzhiyu-secondtext);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-category {
  font-size: 12px;
  color: var(--anzhiyu-main);
}

/* No results */
.search-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--anzhiyu-secondtext);
  font-size: 14px;
}

/* Empty state */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--anzhiyu-secondtext);
  font-size: 14px;
}

.search-shortcuts {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.search-shortcuts kbd {
  padding: 1px 5px;
  font-size: 11px;
  font-family: inherit;
  background: var(--anzhiyu-secondbg);
  border: 1px solid var(--style-border-always);
  border-radius: 3px;
}

/* Transitions: fade-in backdrop + slide-down search card over 200ms ease-out */
.search-fade-enter-active {
  transition: opacity 0.2s ease-out;
}
.search-fade-enter-active .search-dialog {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}
.search-fade-leave-active {
  transition: opacity 0.15s ease-in;
}
.search-fade-leave-active .search-dialog {
  transition: transform 0.15s ease-in, opacity 0.15s ease-in;
}
.search-fade-enter-from {
  opacity: 0;
}
.search-fade-enter-from .search-dialog {
  transform: translateY(-12px);
  opacity: 0;
}
.search-fade-leave-to {
  opacity: 0;
}
.search-fade-leave-to .search-dialog {
  transform: translateY(-8px);
  opacity: 0;
}
</style>