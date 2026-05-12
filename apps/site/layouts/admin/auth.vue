<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
    </div>

    <!-- Login card -->
    <div class="w-full max-w-md relative">
      <div class="bg-surface rounded-2xl shadow-xl overflow-hidden border border-border">
        <!-- Header -->
        <div class="bg-primary px-8 py-6 text-center">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="i-heroicons-command-line w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">博客管理系统</h1>
          <p class="text-white/70 text-sm mt-1">请登录以继续</p>
        </div>

        <!-- Form -->
        <div class="p-8">
          <slot />
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-muted text-sm mt-6">
        &copy; {{ new Date().getFullYear() }} 博客系统. All rights reserved.
      </p>
    </div>
  </div>
</template>