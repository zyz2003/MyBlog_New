<script setup lang="ts">
// Test page for Phase 1 verification
const title = 'My Blog'
const features = [
  'Nuxt 3 SSR + SPA Hybrid',
  'UnoCSS Atomic CSS',
  'TypeScript Strict Mode',
  'SQLite + Drizzle ORM',
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md mx-auto text-center p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ title }}
      </h1>
      <p class="text-gray-600 mb-6">
        Personal blog system built with Nuxt 3
      </p>
      <div class="space-y-2">
        <div
          v-for="feature in features"
          :key="feature"
          class="flex items-center justify-center gap-2 text-sm text-gray-500"
        >
          <span class="i-heroicons-check-circle text-green-500" />
          {{ feature }}
        </div>
      </div>
      <div class="mt-8 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-700">
          If you can see this page with styling, the setup is working!
        </p>
      </div>
    </div>
  </div>
</template>
