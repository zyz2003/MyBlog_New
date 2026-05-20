<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('analytics')
const { toRecord } = useAdminFormHelpers()

const form = reactive({
  googleAnalyticsId: '',
  googleAnalyticsDebug: false,

  baiduAnalyticsEnable: false,
  baiduAnalyticsId: '',
  baiduAnalyticsToken: '',
  baiduAnalyticsScript: '',

  busuanziSiteUv: false,
  busuanziSitePv: false,
  busuanziPagePv: false,

  laEnable: false,
  laCk: '',
  laLingQueMonitorId: '',

  umamiEnable: false,
  umamiApiHost: '',
  umamiWebsiteId: '',
  umamiToken: '',
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function hydrateForm() {
  const googleAnalytics = toRecord(settings.value.googleAnalytics)
  const baiduAnalytics = toRecord(settings.value.baiduAnalytics)
  const busuanzi = toRecord(settings.value.busuanzi)
  const la = toRecord(settings.value.LA ?? settings.value.la51)
  const umami = toRecord(settings.value.umami)

  form.googleAnalyticsId = String(googleAnalytics.id ?? '')
  form.googleAnalyticsDebug = googleAnalytics.debug !== undefined ? Boolean(googleAnalytics.debug) : false

  form.baiduAnalyticsEnable = baiduAnalytics.enable !== undefined ? Boolean(baiduAnalytics.enable) : false
  form.baiduAnalyticsId = String(baiduAnalytics.id ?? '')
  form.baiduAnalyticsToken = String(baiduAnalytics.token ?? '')
  form.baiduAnalyticsScript = String(baiduAnalytics.script ?? '')

  form.busuanziSiteUv = busuanzi.siteUv !== undefined ? Boolean(busuanzi.siteUv) : Boolean(busuanzi.site_uv)
  form.busuanziSitePv = busuanzi.sitePv !== undefined ? Boolean(busuanzi.sitePv) : Boolean(busuanzi.site_pv)
  form.busuanziPagePv = busuanzi.pagePv !== undefined ? Boolean(busuanzi.pagePv) : Boolean(busuanzi.page_pv)

  form.laEnable = la.enable !== undefined ? Boolean(la.enable) : false
  form.laCk = String(la.ck ?? '')
  form.laLingQueMonitorId = String(la.LingQueMonitorID ?? '')

  form.umamiEnable = umami.enable !== undefined ? Boolean(umami.enable) : false
  form.umamiApiHost = String(umami.apiHost ?? '')
  form.umamiWebsiteId = String(umami.websiteId ?? '')
  form.umamiToken = String(umami.token ?? '')
}

watch(
  settings,
  () => {
    hydrateForm()
  },
  { deep: true, immediate: true },
)

async function handleSave() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await save({
      googleAnalytics: {
        id: form.googleAnalyticsId.trim(),
        debug: form.googleAnalyticsDebug,
      },
      baiduAnalytics: {
        enable: form.baiduAnalyticsEnable,
        id: form.baiduAnalyticsId.trim(),
        token: form.baiduAnalyticsToken.trim(),
        script: form.baiduAnalyticsScript.trim(),
      },
      busuanzi: {
        siteUv: form.busuanziSiteUv,
        sitePv: form.busuanziSitePv,
        pagePv: form.busuanziPagePv,
      },
      LA: {
        enable: form.laEnable,
        ck: form.laCk.trim(),
        LingQueMonitorID: form.laLingQueMonitorId.trim(),
      },
      umami: {
        enable: form.umamiEnable,
        apiHost: form.umamiApiHost.trim(),
        websiteId: form.umamiWebsiteId.trim(),
        token: form.umamiToken.trim(),
      },
    })

    message.value = '统计配置已保存。'
    await refresh()
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败，请稍后重试。'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(75,141,248,0.08),rgba(255,255,255,0.74))] p-6 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Analytics</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">统计分析配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里统一接管 Google Analytics、百度统计、不蒜子、灵雀监控和 Umami，保存后前台脚本和计数器会按配置生效。
      </p>
    </section>

    <div v-if="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ message }}
    </div>
    <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Google / 百度</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">Google Analytics ID</span>
            <input v-model="form.googleAnalyticsId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="G-XXXXXXXXXX" >
          </label>
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.googleAnalyticsDebug = !form.googleAnalyticsDebug">
            <span class="text-sm text-text">Google Analytics 调试模式</span>
            <span class="text-sm text-muted">{{ form.googleAnalyticsDebug ? '已开启' : '已关闭' }}</span>
          </button>

          <div class="mt-2 h-px bg-border/70" />

          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.baiduAnalyticsEnable = !form.baiduAnalyticsEnable">
            <span class="text-sm text-text">启用百度统计</span>
            <span class="text-sm text-muted">{{ form.baiduAnalyticsEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.baiduAnalyticsId" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="统计 ID" >
            <input v-model="form.baiduAnalyticsToken" type="text" class="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Token" >
          </div>
          <input v-model="form.baiduAnalyticsScript" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="脚本地址或片段标识" >
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">不蒜子</h2>
        <div class="mt-5 grid gap-4">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.busuanziSiteUv = !form.busuanziSiteUv">
            <span class="text-sm text-text">显示站点访客数</span>
            <span class="text-sm text-muted">{{ form.busuanziSiteUv ? '已开启' : '已关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.busuanziSitePv = !form.busuanziSitePv">
            <span class="text-sm text-text">显示站点浏览量</span>
            <span class="text-sm text-muted">{{ form.busuanziSitePv ? '已开启' : '已关闭' }}</span>
          </button>
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.busuanziPagePv = !form.busuanziPagePv">
            <span class="text-sm text-text">显示页面浏览量</span>
            <span class="text-sm text-muted">{{ form.busuanziPagePv ? '已开启' : '已关闭' }}</span>
          </button>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">灵雀监控</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.laEnable = !form.laEnable">
            <span class="text-sm text-text">启用灵雀监控</span>
            <span class="text-sm text-muted">{{ form.laEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <input v-model="form.laCk" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="CK" >
          <input v-model="form.laLingQueMonitorId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="LingQueMonitorID" >
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Umami</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.umamiEnable = !form.umamiEnable">
            <span class="text-sm text-text">启用 Umami</span>
            <span class="text-sm text-muted">{{ form.umamiEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <input v-model="form.umamiApiHost" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="API Host" >
          <input v-model="form.umamiWebsiteId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Website ID" >
          <input v-model="form.umamiToken" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Token" >
        </div>
      </article>
    </section>

    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary"
        :disabled="loading || saving"
        @click="refresh"
      >
        刷新
      </button>
      <button
        type="button"
        class="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-primary/90 disabled:opacity-60"
        :disabled="loading || saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存统计配置' }}
      </button>
    </div>
  </div>
</template>
