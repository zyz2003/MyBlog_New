<script setup lang="ts">
import { ref, watch } from 'vue'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Image,
  ListTodo,
  Link,
  List,
  ListOrdered,
} from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '使用 Markdown 语法编写内容...',
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLTextAreaElement>()

// Insert markdown at cursor position
function insertMarkdown(before: string, after: string = '', placeholder: string = '') {
  if (!editorRef.value) return

  const textarea = editorRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = props.modelValue

  const selectedText = text.substring(start, end) || placeholder
  const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)

  emit('update:modelValue', newText)

  // Restore cursor position
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + before.length,
      end + before.length
    )
  }, 0)
}

// Toolbar actions
function addHeading1() {
  insertMarkdown('# ', '')
}

function addHeading2() {
  insertMarkdown('## ', '')
}

function addHeading3() {
  insertMarkdown('### ', '')
}

function addBold() {
  insertMarkdown('**', '**', '粗体文本')
}

function addItalic() {
  insertMarkdown('*', '*', '斜体文本')
}

function addQuote() {
  insertMarkdown('> ', '')
}

function addCode() {
  insertMarkdown('```\n', '\n```', '代码片段')
}

function addImage() {
  const imageUrl = prompt('请输入图片 URL:')
  if (imageUrl) {
    insertMarkdown(`![图片描述](${imageUrl})\n`, '')
  }
}

function addLink() {
  const linkText = prompt('请输入链接文本:')
  if (!linkText) return
  const url = prompt('请输入链接 URL:')
  if (url) {
    insertMarkdown(`[${linkText}](${url})`, '')
  }
}

function addBulletList() {
  insertMarkdown('- ', '')
}

function addNumberedList() {
  insertMarkdown('1. ', '')
}

function addTodoList() {
  insertMarkdown('- [ ] ', '')
}

// Preview mode
const showPreview = ref(false)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/80 p-2 backdrop-blur">
      <!-- Headings Group -->
      <div class="flex items-center gap-1 rounded-lg bg-white/60 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-sky-100 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500"
          :disabled="readonly"
          @click="addHeading1"
          title="一级标题"
        >
          <Heading1 class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-sky-100 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500"
          :disabled="readonly"
          @click="addHeading2"
          title="二级标题"
        >
          <Heading2 class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-sky-100 hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500"
          :disabled="readonly"
          @click="addHeading3"
          title="三级标题"
        >
          <Heading3 class="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" class="mx-1 h-6 bg-slate-300" />

      <!-- Text Formatting Group -->
      <div class="flex items-center gap-1 rounded-lg bg-white/60 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
          :disabled="readonly"
          @click="addBold"
          title="粗体"
        >
          <Bold class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-emerald-100 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
          :disabled="readonly"
          @click="addItalic"
          title="斜体"
        >
          <Italic class="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" class="mx-1 h-6 bg-slate-300" />

      <!-- Block Elements Group -->
      <div class="flex items-center gap-1 rounded-lg bg-white/60 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-amber-100 hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500"
          :disabled="readonly"
          @click="addQuote"
          title="引用"
        >
          <Quote class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-violet-100 hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500"
          :disabled="readonly"
          @click="addCode"
          title="代码块"
        >
          <Code class="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" class="mx-1 h-6 bg-slate-300" />

      <!-- Lists Group -->
      <div class="flex items-center gap-1 rounded-lg bg-white/60 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-rose-100 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500"
          :disabled="readonly"
          @click="addBulletList"
          title="无序列表"
        >
          <List class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-rose-100 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500"
          :disabled="readonly"
          @click="addNumberedList"
          title="有序列表"
        >
          <ListOrdered class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-rose-100 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500"
          :disabled="readonly"
          @click="addTodoList"
          title="任务列表"
        >
          <ListTodo class="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" class="mx-1 h-6 bg-slate-300" />

      <!-- Media Group -->
      <div class="flex items-center gap-1 rounded-lg bg-white/60 p-1 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-indigo-100 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
          :disabled="readonly"
          @click="addLink"
          title="插入链接"
        >
          <Link class="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-md text-slate-600 transition-all hover:bg-indigo-100 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
          :disabled="readonly"
          @click="addImage"
          title="插入图片"
        >
          <Image class="h-4 w-4" />
        </Button>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <Separator orientation="vertical" class="mx-1 h-6 bg-slate-300" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-8 border-slate-300 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow focus-visible:ring-2 focus-visible:ring-sky-500"
          @click="showPreview = !showPreview"
        >
          <span v-if="showPreview">编辑</span>
          <span v-else>预览</span>
        </Button>
      </div>
    </div>

    <!-- Editor / Preview -->
    <div class="relative">
      <Textarea
        v-show="!showPreview"
        ref="editorRef"
        :model-value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        class="min-h-[400px] w-full resize-y rounded-none border-0 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <div
        v-show="showPreview"
        class="prose prose-slate max-w-none px-4 py-3"
        v-html="renderMarkdown(modelValue)"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Simple markdown render (placeholder - in production use a real markdown parser)
function renderMarkdown(text: string): string {
  if (!text) return ''

  // Basic markdown rendering (for preview only)
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```\n?([\s\S]*?)\n?```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-sky-600 hover:underline">$1</a>')
    // Line breaks
    .replace(/\n$/gim, '<br />')

  return html
}
</script>

<style scoped>
.prose :deep(blockquote) {
  border-left: 3px solid #e2e8f0;
  padding-left: 1rem;
  color: #64748b;
}

.prose :deep(pre) {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose :deep(code) {
  background: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose :deep(pre code) {
  background: transparent;
  padding: 0;
}

.prose :deep(h1), .prose :deep(h2), .prose :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.prose :deep(ul), .prose :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}
</style>
