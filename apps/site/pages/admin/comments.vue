<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('comments')
const { toRecord, toLines, fromLines, objectToKeyValueText, keyValueTextToObject } = useAdminFormHelpers()

const providerOptions = [
  { value: '', label: '关闭评论' },
  { value: 'twikoo', label: 'Twikoo' },
  { value: 'waline', label: 'Waline' },
  { value: 'valine', label: 'Valine' },
  { value: 'artalk', label: 'Artalk' },
  { value: 'giscus', label: 'Giscus' },
]

const form = reactive({
  commentsUse: '',
  commentsText: true,
  commentsLazyload: false,
  commentsCount: false,
  commentsCardPostCount: false,

  twikooEnvId: '',
  twikooRegion: '',
  twikooVisitor: false,
  twikooOptionText: '',

  valineAppId: '',
  valineAppKey: '',
  valinePageSize: 10,
  valineAvatar: 'mp',
  valineLang: 'zh-CN',
  valinePlaceholder: '',
  valineGuestInfo: '',
  valineRecordIP: false,
  valineServerURLs: '',
  valineBg: '',
  valineEmojiCDN: '',
  valineEnableQQ: true,
  valineRequiredFields: '',
  valineVisitor: false,
  valineMasterText: '',
  valineFriendsText: '',
  valineTagMeta: '',
  valineOptionText: '',

  walineServerURL: '',
  walineBg: '',
  walinePageview: false,
  walineMetaCss: false,
  walineImageUploader: true,
  walineOptionText: '',

  artalkServer: '',
  artalkSite: '',
  artalkVisitor: false,
  artalkOptionText: '',

  giscusRepo: '',
  giscusRepoId: '',
  giscusCategoryId: '',
  giscusThemeLight: 'light',
  giscusThemeDark: 'dark',
  giscusLang: 'zh-CN',
  giscusMapping: '',
  giscusCategory: '',
  giscusInputPosition: '',

  visitorMailEnable: true,
  visitorMailAddress: '',

  commentBarrageEnable: false,
  commentBarrageMax: 1,
  commentBarrageTime: 4000,
  commentBarrageAccessToken: '',
  commentBarrageMailMd5: '',

  newestCommentsEnable: false,
  newestCommentsLimit: 6,
  newestCommentsStorage: 10,
  newestCommentsAvatar: true,
})

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function hydrateForm() {
  const comments = toRecord(settings.value.comments)
  const twikoo = toRecord(settings.value.twikoo)
  const valine = toRecord(settings.value.valine)
  const waline = toRecord(settings.value.waline)
  const artalk = toRecord(settings.value.artalk)
  const giscus = toRecord(settings.value.giscus)
  const giscusTheme = toRecord(giscus.theme)
  const giscusOption = toRecord(giscus.option)
  const visitorMail = toRecord(settings.value.visitorMail)
  const commentBarrage = toRecord(settings.value.commentBarrage)
  const newestComments = toRecord(settings.value.newestComments)

  form.commentsUse = String(comments.use ?? '')
  form.commentsText = comments.text !== undefined ? Boolean(comments.text) : true
  form.commentsLazyload = comments.lazyload !== undefined ? Boolean(comments.lazyload) : false
  form.commentsCount = comments.count !== undefined ? Boolean(comments.count) : false
  form.commentsCardPostCount = comments.cardPostCount !== undefined
    ? Boolean(comments.cardPostCount)
    : Boolean(comments.card_post_count ?? false)

  const commentTwikoo = toRecord(comments.twikoo)
  form.twikooEnvId = String(twikoo.envId ?? commentTwikoo.envId ?? '')
  form.twikooRegion = String(twikoo.region ?? commentTwikoo.region ?? '')
  form.twikooVisitor = twikoo.visitor !== undefined ? Boolean(twikoo.visitor) : false
  form.twikooOptionText = objectToKeyValueText(twikoo.option)

  form.valineAppId = String(valine.appId ?? '')
  form.valineAppKey = String(valine.appKey ?? '')
  form.valinePageSize = Number(valine.pageSize ?? 10) || 10
  form.valineAvatar = String(valine.avatar ?? 'mp')
  form.valineLang = String(valine.lang ?? 'zh-CN')
  form.valinePlaceholder = String(valine.placeholder ?? '')
  form.valineGuestInfo = String(valine.guestInfo ?? valine.guest_info ?? '')
  form.valineRecordIP = valine.recordIP !== undefined ? Boolean(valine.recordIP) : false
  form.valineServerURLs = String(valine.serverURLs ?? '')
  form.valineBg = String(valine.bg ?? '')
  form.valineEmojiCDN = String(valine.emojiCDN ?? '')
  form.valineEnableQQ = valine.enableQQ !== undefined ? Boolean(valine.enableQQ) : true
  form.valineRequiredFields = String(valine.requiredFields ?? '')
  form.valineVisitor = valine.visitor !== undefined ? Boolean(valine.visitor) : false
  form.valineMasterText = toLines(valine.master)
  form.valineFriendsText = toLines(valine.friends)
  form.valineTagMeta = String(valine.tagMeta ?? '')
  form.valineOptionText = objectToKeyValueText(valine.option)

  form.walineServerURL = String(waline.serverURL ?? '')
  form.walineBg = String(waline.bg ?? '')
  form.walinePageview = waline.pageview !== undefined ? Boolean(waline.pageview) : false
  form.walineMetaCss = waline.metaCss !== undefined ? Boolean(waline.metaCss) : Boolean(waline.meta_css ?? false)
  form.walineImageUploader = waline.imageUploader !== undefined ? Boolean(waline.imageUploader) : true
  form.walineOptionText = objectToKeyValueText(waline.option)

  form.artalkServer = String(artalk.server ?? '')
  form.artalkSite = String(artalk.site ?? '')
  form.artalkVisitor = artalk.visitor !== undefined ? Boolean(artalk.visitor) : false
  form.artalkOptionText = objectToKeyValueText(artalk.option)

  form.giscusRepo = String(giscus.repo ?? '')
  form.giscusRepoId = String(giscus.repoId ?? '')
  form.giscusCategoryId = String(giscus.categoryId ?? '')
  form.giscusThemeLight = String(giscusTheme.light ?? 'light')
  form.giscusThemeDark = String(giscusTheme.dark ?? 'dark')
  form.giscusLang = String(giscusOption.lang ?? giscus['data-lang'] ?? 'zh-CN')
  form.giscusMapping = String(giscusOption.mapping ?? giscus['data-mapping'] ?? '')
  form.giscusCategory = String(giscusOption.category ?? giscus['data-category'] ?? '')
  form.giscusInputPosition = String(giscusOption.inputPosition ?? giscus['data-input-position'] ?? '')

  form.visitorMailEnable = visitorMail.enable !== undefined ? Boolean(visitorMail.enable) : true
  form.visitorMailAddress = String(visitorMail.mail ?? '')

  form.commentBarrageEnable = commentBarrage.enable !== undefined ? Boolean(commentBarrage.enable) : false
  form.commentBarrageMax = Number(commentBarrage.maxBarrage ?? 1) || 1
  form.commentBarrageTime = Number(commentBarrage.barrageTime ?? 4000) || 4000
  form.commentBarrageAccessToken = String(commentBarrage.accessToken ?? '')
  form.commentBarrageMailMd5 = String(commentBarrage.mailMd5 ?? '')

  form.newestCommentsEnable = newestComments.enable !== undefined ? Boolean(newestComments.enable) : false
  form.newestCommentsLimit = Number(newestComments.limit ?? 6) || 6
  form.newestCommentsStorage = Number(newestComments.storage ?? 10) || 10
  form.newestCommentsAvatar = newestComments.avatar !== undefined ? Boolean(newestComments.avatar) : true
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
      comments: {
        use: form.commentsUse,
        text: form.commentsText,
        lazyload: form.commentsLazyload,
        count: form.commentsCount,
        cardPostCount: form.commentsCardPostCount,
        twikoo: {
          envId: form.twikooEnvId.trim(),
          region: form.twikooRegion.trim(),
        },
      },
      twikoo: {
        envId: form.twikooEnvId.trim(),
        region: form.twikooRegion.trim(),
        visitor: form.twikooVisitor,
        option: keyValueTextToObject(form.twikooOptionText),
      },
      valine: {
        appId: form.valineAppId.trim(),
        appKey: form.valineAppKey.trim(),
        pageSize: form.valinePageSize,
        avatar: form.valineAvatar.trim(),
        lang: form.valineLang.trim(),
        placeholder: form.valinePlaceholder.trim(),
        guestInfo: form.valineGuestInfo.trim(),
        recordIP: form.valineRecordIP,
        serverURLs: form.valineServerURLs.trim(),
        bg: form.valineBg.trim(),
        emojiCDN: form.valineEmojiCDN.trim(),
        enableQQ: form.valineEnableQQ,
        requiredFields: form.valineRequiredFields.trim(),
        visitor: form.valineVisitor,
        master: fromLines(form.valineMasterText),
        friends: fromLines(form.valineFriendsText),
        tagMeta: form.valineTagMeta.trim(),
        option: keyValueTextToObject(form.valineOptionText),
      },
      waline: {
        serverURL: form.walineServerURL.trim(),
        bg: form.walineBg.trim(),
        pageview: form.walinePageview,
        metaCss: form.walineMetaCss,
        imageUploader: form.walineImageUploader,
        option: keyValueTextToObject(form.walineOptionText),
      },
      artalk: {
        server: form.artalkServer.trim(),
        site: form.artalkSite.trim(),
        visitor: form.artalkVisitor,
        option: keyValueTextToObject(form.artalkOptionText),
      },
      giscus: {
        repo: form.giscusRepo.trim(),
        repoId: form.giscusRepoId.trim(),
        categoryId: form.giscusCategoryId.trim(),
        theme: {
          light: form.giscusThemeLight.trim(),
          dark: form.giscusThemeDark.trim(),
        },
        option: {
          lang: form.giscusLang.trim(),
          mapping: form.giscusMapping.trim(),
          category: form.giscusCategory.trim(),
          inputPosition: form.giscusInputPosition.trim(),
        },
      },
      visitorMail: {
        enable: form.visitorMailEnable,
        mail: form.visitorMailAddress.trim(),
      },
      commentBarrage: {
        enable: form.commentBarrageEnable,
        maxBarrage: form.commentBarrageMax,
        barrageTime: form.commentBarrageTime,
        accessToken: form.commentBarrageAccessToken.trim(),
        mailMd5: form.commentBarrageMailMd5.trim(),
      },
      newestComments: {
        enable: form.newestCommentsEnable,
        limit: form.newestCommentsLimit,
        storage: form.newestCommentsStorage,
        avatar: form.newestCommentsAvatar,
      },
    })

    message.value = '评论配置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Comments</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">评论系统配置</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这里统一管理评论服务商、游客通知、最新评论和评论弹幕，所有复杂参数都已拆成字段或键值编辑，不再保留 JSON 大块输入。
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
        <h2 class="text-xl font-black text-text">全局评论开关</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">评论服务商</span>
            <select v-model="form.commentsUse" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
              <option v-for="option in providerOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.commentsText" label="显示评论文案" />
            <AdminToggleSwitch v-model="form.commentsLazyload" label="延迟加载评论" />
            <AdminToggleSwitch v-model="form.commentsCount" label="显示评论数量" />
            <AdminToggleSwitch v-model="form.commentsCardPostCount" label="卡片显示文章评论数" />
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Twikoo</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">环境 ID</span>
            <input v-model="form.twikooEnvId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">地域</span>
            <input v-model="form.twikooRegion" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <AdminToggleSwitch v-model="form.twikooVisitor" label="开启访客统计" class="w-full" />
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">高级参数</span>
            <textarea v-model="form.twikooOptionText" rows="5" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行 key=value，例如 env=prod" />
          </label>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Valine</h2>
        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">App ID</span>
              <input v-model="form.valineAppId" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">App Key</span>
              <input v-model="form.valineAppKey" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">每页条数</span>
              <input v-model.number="form.valinePageSize" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">头像类型</span>
              <input v-model="form.valineAvatar" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">语言</span>
              <input v-model="form.valineLang" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">服务端地址</span>
              <input v-model="form.valineServerURLs" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">输入框占位文案</span>
            <input v-model="form.valinePlaceholder" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">访客字段</span>
              <input v-model="form.valineGuestInfo" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="nick,mail,link" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">必填字段</span>
              <input v-model="form.valineRequiredFields" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="nick,mail" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">背景图</span>
              <input v-model="form.valineBg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">Emoji CDN</span>
              <input v-model="form.valineEmojiCDN" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <AdminToggleSwitch v-model="form.valineRecordIP" label="记录 IP" />
            <AdminToggleSwitch v-model="form.valineEnableQQ" label="启用 QQ 头像" />
            <AdminToggleSwitch v-model="form.valineVisitor" label="访客统计" />
          </div>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">博主标记</span>
            <textarea v-model="form.valineMasterText" rows="3" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个博主识别值" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">朋友标记</span>
            <textarea v-model="form.valineFriendsText" rows="3" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个朋友识别值" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">标签文案</span>
            <input v-model="form.valineTagMeta" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="博主,小伙伴,访客" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">高级参数</span>
            <textarea v-model="form.valineOptionText" rows="5" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行 key=value" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">Waline / Artalk / Giscus</h2>
        <div class="mt-5 space-y-6">
          <div class="rounded-3xl border border-border bg-background/60 p-5">
            <h3 class="text-lg font-black text-text">Waline</h3>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <input v-model="form.walineServerURL" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="服务端地址" >
              <input v-model="form.walineBg" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="背景图" >
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <AdminToggleSwitch v-model="form.walinePageview" label="页面浏览统计" />
              <AdminToggleSwitch v-model="form.walineMetaCss" label="启用 Meta CSS" />
              <AdminToggleSwitch v-model="form.walineImageUploader" label="启用图片上传" />
            </div>
            <textarea v-model="form.walineOptionText" rows="4" class="mt-4 w-full rounded-2xl border border-border bg-white/90 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Waline 高级参数，每行 key=value" />
          </div>

          <div class="rounded-3xl border border-border bg-background/60 p-5">
            <h3 class="text-lg font-black text-text">Artalk</h3>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <input v-model="form.artalkServer" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="服务端地址" >
              <input v-model="form.artalkSite" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="站点名称" >
            </div>
            <AdminToggleSwitch v-model="form.artalkVisitor" label="访客统计" class="mt-4 w-full" />
            <textarea v-model="form.artalkOptionText" rows="4" class="mt-4 w-full rounded-2xl border border-border bg-white/90 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Artalk 高级参数，每行 key=value" />
          </div>

          <div class="rounded-3xl border border-border bg-background/60 p-5">
            <h3 class="text-lg font-black text-text">Giscus</h3>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <input v-model="form.giscusRepo" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="repo" >
              <input v-model="form.giscusRepoId" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="repoId" >
              <input v-model="form.giscusCategoryId" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="categoryId" >
              <input v-model="form.giscusCategory" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="category" >
              <input v-model="form.giscusLang" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="lang" >
              <input v-model="form.giscusMapping" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="mapping" >
              <input v-model="form.giscusInputPosition" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="inputPosition" >
              <input v-model="form.giscusThemeLight" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="浅色主题" >
              <input v-model="form.giscusThemeDark" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 md:col-span-2" placeholder="深色主题" >
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">访客提醒与评论弹幕</h2>
        <div class="mt-5 space-y-5">
          <AdminToggleSwitch v-model="form.visitorMailEnable" label="启用访客邮件提醒" class="w-full" />
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">提醒邮箱</span>
            <input v-model="form.visitorMailAddress" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <AdminToggleSwitch v-model="form.commentBarrageEnable" label="启用评论弹幕" class="w-full" />
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">最大弹幕数</span>
              <input v-model.number="form.commentBarrageMax" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">持续时间</span>
              <input v-model.number="form.commentBarrageTime" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">Access Token</span>
              <input v-model="form.commentBarrageAccessToken" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">邮箱 MD5</span>
              <input v-model="form.commentBarrageMailMd5" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">最新评论卡片</h2>
        <div class="mt-5 space-y-5">
          <AdminToggleSwitch v-model="form.newestCommentsEnable" label="启用最新评论卡片" class="w-full" />
          <AdminToggleSwitch v-model="form.newestCommentsAvatar" label="显示评论头像" class="w-full" />
          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">展示条数</span>
              <input v-model.number="form.newestCommentsLimit" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">缓存数量</span>
              <input v-model.number="form.newestCommentsStorage" type="number" min="1" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
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
        {{ saving ? '保存中...' : '保存评论配置' }}
      </button>
    </div>
  </div>
</template>
