<script setup lang="ts">
/**
 * App entry point
 * Each page defines its own layout via definePageMeta({ layout: 'xxx' })
 * Frontend pages use 'default' (theme layout), admin uses 'admin'
 * Theme CSS Variables are injected by plugins/theme-init.ts
 *
 * Page transitions (per D-01): configured via app.pageTransition in nuxt.config.ts
 * with name="page" mode="out-in". CSS classes in transitions.css handle the animation.
 * Scroll-reveal animations: use useScrollReveal() composable in child components.
 * Reduced motion: use useReducedMotion() composable to respect user preferences.
 */
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
