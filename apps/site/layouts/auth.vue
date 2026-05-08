<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
    </div>

    <!-- Login card -->
    <div class="w-full max-w-md relative">
      <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-amber-100 dark:border-gray-700">
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-center">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="i-heroicons-command-line w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">博客管理系统</h1>
          <p class="text-amber-100 text-sm mt-1">请登录以继续</p>
        </div>

        <!-- Form -->
        <div class="p-8">
          <slot />
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-amber-600/60 text-sm mt-6">
        &copy; {{ new Date().getFullYear() }} 博客系统. All rights reserved.
      </p>
    </div>
  </div>
</template>