<template>
  <div class="admin-console admin-auth relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#edf5ff_0%,#f7fbff_45%,#ffffff_100%)] px-4 py-10 dark:bg-[linear-gradient(145deg,#09111d_0%,#0d1625_45%,#111b2d_100%)]">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute left-[-6rem] top-[8%] h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
      <div class="absolute right-[-4rem] top-[16%] h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
      <div class="absolute bottom-[-6rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
    </div>

    <div class="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-[rgba(255,255,255,0.82)] shadow-[0_30px_120px_rgba(35,74,116,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(8,14,24,0.78)] lg:grid-cols-[1.05fr_0.95fr]">
      <div class="hidden flex-col justify-between bg-[linear-gradient(160deg,rgba(75,141,248,0.92),rgba(34,184,207,0.9))] p-10 text-white lg:flex">
        <div>
          <div class="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/16">
            <span class="i-heroicons-command-line h-8 w-8" />
          </div>
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">AnZhiYu CMS</p>
          <h1 class="mt-4 text-4xl font-black leading-tight">重构后的博客后台，应该像一个真正的控制台。</h1>
          <p class="mt-5 max-w-xl text-sm leading-7 text-white/78">
            在这里统一管理内容、前台体验、主题配置与平台扩展，不再回到零散配置和手改源码的旧工作流。
          </p>
        </div>

        <div class="grid gap-4">
          <div class="rounded-3xl border border-white/14 bg-white/10 p-5">
            <p class="text-sm font-semibold">内容中台</p>
            <p class="mt-2 text-sm leading-6 text-white/72">文章、页面、分类、标签、媒体与草稿统一管理。</p>
          </div>
          <div class="rounded-3xl border border-white/14 bg-white/10 p-5">
            <p class="text-sm font-semibold">前台配置闭环</p>
            <p class="mt-2 text-sm leading-6 text-white/72">后台可改、数据可存、前台真实生效，配置链路保持统一。</p>
          </div>
        </div>
      </div>

      <div class="p-6 md:p-10">
        <div class="mx-auto max-w-md">
          <div class="mb-8 lg:hidden">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-sky-500/20">
              <span class="i-heroicons-command-line h-7 w-7" />
            </div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">AnZhiYu CMS</p>
            <h1 class="mt-3 text-3xl font-black tracking-tight text-text">登录后台</h1>
            <p class="mt-2 text-sm leading-7 text-muted">继续进入内容、配置和平台管理控制台。</p>
          </div>

          <div class="hidden lg:block">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">Admin Access</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight text-text">欢迎回来</h2>
            <p class="mt-2 text-sm leading-7 text-muted">请登录后继续管理站点内容、视觉配置与平台扩展。</p>
          </div>

          <div class="mt-8 rounded-[28px] border border-border/70 bg-surface/86 p-6 shadow-sm">
            <slot />
          </div>

          <p class="mt-6 text-center text-xs text-muted">
            © {{ new Date().getFullYear() }} My Blog CMS · 后台访问仅限授权用户
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-console {
  --color-primary: #4b8df8;
  --color-primary-rgb: 75 141 248;
  --color-secondary: #6f8db4;
  --color-secondary-rgb: 111 141 180;
  --color-accent: #22b8cf;
  --color-accent-rgb: 34 184 207;
  --color-background: #f7fbff;
  --color-background-rgb: 247 251 255;
  --color-surface: #ffffff;
  --color-surface-rgb: 255 255 255;
  --color-surface-2: #eef5ff;
  --color-surface-2-rgb: 238 245 255;
  --color-text: #172033;
  --color-text-rgb: 23 32 51;
  --color-text-muted: #6a7a96;
  --color-text-muted-rgb: 106 122 150;
  --color-border: #dbe7f5;
  --color-border-rgb: 219 231 245;
  --anzhiyu-main: #4b8df8;
}

:global(.dark) .admin-console {
  --color-primary: #7bb0ff;
  --color-primary-rgb: 123 176 255;
  --color-secondary: #93abc9;
  --color-secondary-rgb: 147 171 201;
  --color-accent: #4fd4de;
  --color-accent-rgb: 79 212 222;
  --color-background: #0f1726;
  --color-background-rgb: 15 23 38;
  --color-surface: #162033;
  --color-surface-rgb: 22 32 51;
  --color-surface-2: #1e2a40;
  --color-surface-2-rgb: 30 42 64;
  --color-text: #ecf4ff;
  --color-text-rgb: 236 244 255;
  --color-text-muted: #9db0cb;
  --color-text-muted-rgb: 157 176 203;
  --color-border: #2a3a55;
  --color-border-rgb: 42 58 85;
  --anzhiyu-main: #7bb0ff;
}
</style>
