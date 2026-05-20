<script setup lang="ts">
definePageMeta({
  layout: 'admin-default',
  middleware: ['admin-auth'],
})

const { settings, loading, save, refresh } = useAdminSettings('general')

type SocialLinkItem = {
  name: string
  url: string
  icon: string
}

type FooterSocialItem = {
  title: string
  link: string
  icon: string
  side: 'left' | 'right'
}

type FooterLinkItem = {
  title: string
  link: string
}

type FooterLinkGroup = {
  title: string
  links: FooterLinkItem[]
}

type BadgeItem = {
  link: string
  shields: string
  message: string
}

type FooterBarLinkItem = {
  text: string
  link: string
}

const form = reactive({
  siteTitle: '',
  favicon: '',
  footerCustomText: '',

  avatarImg: '',
  avatarEffect: false,

  authorStatusEnable: false,
  authorStatusImg: '',
  authorStatusSkillsText: '',

  runtimeEnable: false,
  runtimeLaunchTime: '',
  runtimeWorkImg: '',
  runtimeWorkDescription: '',
  runtimeOffdutyImg: '',
  runtimeOffdutyDescription: '',

  error404Enable: true,
  error404Subtitle: '',
  error404Background: '',
  errorImgFlink: '',
  errorImgPostPage: '',

  footerSocialBarEnable: true,
  footerSocialBarCenterImg: '',
  footerOwnerEnable: true,
  footerOwnerSince: new Date().getFullYear(),
  footerListEnable: true,
  footerListRandomFriends: 0,
  footerBadgeEnable: false,
  footerBarEnable: true,
  footerBarCcEnable: false,
  footerBarCcLink: '',
  footerBarAuthorLink: '',
  footerBarSubtitleEnable: false,
  footerBarSubtitleEffect: false,
  footerBarSubtitleStartDelay: 300,
  footerBarSubtitleTypeSpeed: 150,
  footerBarSubtitleBackSpeed: 50,
  footerBarSubtitleLoop: true,
  footerBarSubtitleSource: '',
  footerBarSubtitleText: '',
})

const socialLinks = ref<SocialLinkItem[]>([])
const footerSocials = ref<FooterSocialItem[]>([])
const footerLinkGroups = ref<FooterLinkGroup[]>([])
const badgeItems = ref<BadgeItem[]>([])
const footerBarLinks = ref<FooterBarLinkItem[]>([])

const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

function toRecord(value: unknown) {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : []
}

function toLineText(value: unknown) {
  return toStringArray(value).join('\n')
}

function fromLineText(value: string) {
  return value
    .split(/\r?\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeSocialLink(item: unknown): SocialLinkItem {
  const record = toRecord(item)
  return {
    name: String(record.name ?? ''),
    url: String(record.url ?? ''),
    icon: String(record.icon ?? ''),
  }
}

function normalizeFooterSocial(item: unknown, side: 'left' | 'right' = 'left'): FooterSocialItem {
  const record = toRecord(item)
  return {
    title: String(record.title ?? ''),
    link: String(record.link ?? ''),
    icon: String(record.icon ?? ''),
    side: String(record.side ?? side) === 'right' ? 'right' : 'left',
  }
}

function normalizeFooterGroup(item: unknown): FooterLinkGroup {
  const record = toRecord(item)
  const links = Array.isArray(record.links)
    ? record.links.map((link) => {
        const linkRecord = toRecord(link)
        return {
          title: String(linkRecord.title ?? ''),
          link: String(linkRecord.link ?? ''),
        }
      })
    : []

  return {
    title: String(record.title ?? ''),
    links,
  }
}

function normalizeBadgeItem(item: unknown): BadgeItem {
  const record = toRecord(item)
  return {
    link: String(record.link ?? ''),
    shields: String(record.shields ?? ''),
    message: String(record.message ?? ''),
  }
}

function normalizeFooterBarLink(item: unknown): FooterBarLinkItem {
  const record = toRecord(item)
  return {
    text: String(record.text ?? ''),
    link: String(record.link ?? ''),
  }
}

function addSocialLink() {
  socialLinks.value.push({ name: '', url: '', icon: '' })
}

function removeSocialLink(index: number) {
  socialLinks.value.splice(index, 1)
}

function addFooterSocial(side: 'left' | 'right') {
  footerSocials.value.push({ title: '', link: '', icon: '', side })
}

function removeFooterSocial(index: number) {
  footerSocials.value.splice(index, 1)
}

function addFooterGroup() {
  footerLinkGroups.value.push({ title: '', links: [{ title: '', link: '' }] })
}

function removeFooterGroup(index: number) {
  footerLinkGroups.value.splice(index, 1)
}

function addFooterGroupLink(groupIndex: number) {
  footerLinkGroups.value[groupIndex]?.links.push({ title: '', link: '' })
}

function removeFooterGroupLink(groupIndex: number, linkIndex: number) {
  footerLinkGroups.value[groupIndex]?.links.splice(linkIndex, 1)
}

function addBadgeItem() {
  badgeItems.value.push({ link: '', shields: '', message: '' })
}

function removeBadgeItem(index: number) {
  badgeItems.value.splice(index, 1)
}

function addFooterBarLink() {
  footerBarLinks.value.push({ text: '', link: '' })
}

function removeFooterBarLink(index: number) {
  footerBarLinks.value.splice(index, 1)
}

function hydrateForm() {
  const avatar = toRecord(settings.value.avatar)
  const footer = toRecord(settings.value.footer)
  const footerSocialBar = toRecord(settings.value.footerSocialBar)
  const footerOwner = toRecord(settings.value.footerOwner)
  const footerList = toRecord(settings.value.footerList)
  const footerBar = toRecord(settings.value.footerBar)
  const footerRuntime = toRecord(settings.value.footerRuntime)
  const footerBadge = toRecord(settings.value.footerBdageitem)
  const footerNestedSocialBar = toRecord(footer.socialBar)
  const footerNestedOwner = toRecord(footer.owner)
  const footerNestedList = toRecord(footer.list)
  const footerNestedBar = toRecord(footer.footerBar)
  const footerNestedRuntime = toRecord(footer.runtime)
  const footerNestedBadge = toRecord(footer.bdageitem)
  const footerSubtitle = toRecord(footerNestedBar.subTitle)
  const footerCc = toRecord(footerNestedBar.cc)
  const authorStatus = toRecord(settings.value.author_status)
  const runtime = Object.keys(footerRuntime).length ? footerRuntime : toRecord(settings.value.runtime)
  const error404 = toRecord(settings.value.error_404)
  const errorImg = toRecord(settings.value.error_img)

  form.siteTitle = String(settings.value.siteTitle ?? '')
  form.favicon = String(settings.value.favicon ?? '')
  form.footerCustomText = String(settings.value.footerCustomText ?? footer.custom_text ?? '')

  form.avatarImg = String(avatar.img ?? '')
  form.avatarEffect = avatar.effect !== undefined ? Boolean(avatar.effect) : false

  form.authorStatusEnable = authorStatus.enable !== undefined ? Boolean(authorStatus.enable) : false
  form.authorStatusImg = String(authorStatus.statusImg ?? '')
  form.authorStatusSkillsText = toLineText(authorStatus.skills)

  form.runtimeEnable = runtime.enable !== undefined ? Boolean(runtime.enable) : false
  form.runtimeLaunchTime = String(runtime.launch_time ?? runtime.launchTime ?? '')
  form.runtimeWorkImg = String(runtime.work_img ?? runtime.workImage ?? '')
  form.runtimeWorkDescription = String(runtime.work_description ?? runtime.workDescription ?? '')
  form.runtimeOffdutyImg = String(runtime.offduty_img ?? runtime.offdutyImage ?? '')
  form.runtimeOffdutyDescription = String(runtime.offduty_description ?? runtime.offdutyDescription ?? '')

  form.error404Enable = error404.enable !== undefined ? Boolean(error404.enable) : true
  form.error404Subtitle = String(error404.subtitle ?? '')
  form.error404Background = String(error404.background ?? '')
  form.errorImgFlink = String(errorImg.flink ?? '')
  form.errorImgPostPage = String(errorImg.post_page ?? '')

  form.footerSocialBarEnable = footerSocialBar.enable !== undefined
    ? Boolean(footerSocialBar.enable)
    : Boolean(footerNestedSocialBar.enable ?? true)
  form.footerSocialBarCenterImg = String(footerSocialBar.centerImg ?? footerNestedSocialBar.centerImg ?? '')
  form.footerOwnerEnable = footerOwner.enable !== undefined
    ? Boolean(footerOwner.enable)
    : Boolean(footerNestedOwner.enable ?? true)
  form.footerOwnerSince = Number(footerOwner.since ?? footerNestedOwner.since ?? new Date().getFullYear()) || new Date().getFullYear()
  form.footerListEnable = footerList.enable !== undefined
    ? Boolean(footerList.enable)
    : Boolean(footerNestedList.enable ?? true)
  form.footerListRandomFriends = Number(footerList.randomFriends ?? footerNestedList.randomFriends ?? 0) || 0
  form.footerBadgeEnable = footerBadge.enable !== undefined
    ? Boolean(footerBadge.enable)
    : Boolean(footerNestedBadge.enable ?? false)
  form.footerBarEnable = footerBar.enable !== undefined
    ? Boolean(footerBar.enable)
    : Boolean(footerNestedBar.enable ?? true)
  form.footerBarCcEnable = footerCc.enable !== undefined ? Boolean(footerCc.enable) : false
  form.footerBarCcLink = String(footerCc.link ?? '')
  form.footerBarAuthorLink = String(footerBar.authorLink ?? footerNestedBar.authorLink ?? '')
  form.footerBarSubtitleEnable = footerSubtitle.enable !== undefined ? Boolean(footerSubtitle.enable) : false
  form.footerBarSubtitleEffect = footerSubtitle.effect !== undefined ? Boolean(footerSubtitle.effect) : false
  form.footerBarSubtitleStartDelay = Number(footerSubtitle.startDelay ?? 300) || 300
  form.footerBarSubtitleTypeSpeed = Number(footerSubtitle.typeSpeed ?? 150) || 150
  form.footerBarSubtitleBackSpeed = Number(footerSubtitle.backSpeed ?? 50) || 50
  form.footerBarSubtitleLoop = footerSubtitle.loop !== undefined ? Boolean(footerSubtitle.loop) : true
  form.footerBarSubtitleSource = String(footerSubtitle.source ?? '')
  form.footerBarSubtitleText = toLineText(footerSubtitle.sub)

  socialLinks.value = Array.isArray(settings.value.socialLinks)
    ? settings.value.socialLinks.map(normalizeSocialLink)
    : []

  const leftSocials = Array.isArray(settings.value.footerSocials)
    ? settings.value.footerSocials.map(item => normalizeFooterSocial(item))
    : []
  const nestedLeft = Array.isArray(footerNestedSocialBar.left)
    ? footerNestedSocialBar.left.map(item => normalizeFooterSocial(item, 'left'))
    : []
  const nestedRight = Array.isArray(footerNestedSocialBar.right)
    ? footerNestedSocialBar.right.map(item => normalizeFooterSocial(item, 'right'))
    : []
  footerSocials.value = leftSocials.length ? leftSocials : [...nestedLeft, ...nestedRight]

  const projectGroups = Array.isArray(footerList.project)
    ? footerList.project.map(normalizeFooterGroup)
    : (Array.isArray(footerNestedList.project) ? footerNestedList.project.map(normalizeFooterGroup) : [])
  footerLinkGroups.value = projectGroups.length ? projectGroups : []

  const badges = Array.isArray(settings.value.badgeItems)
    ? settings.value.badgeItems.map(normalizeBadgeItem)
    : (Array.isArray(footerNestedBadge.list) ? footerNestedBadge.list.map(normalizeBadgeItem) : [])
  badgeItems.value = badges

  const barLinks = Array.isArray(footerBar.linkList)
    ? footerBar.linkList.map(normalizeFooterBarLink)
    : (Array.isArray(footerNestedBar.linkList) ? footerNestedBar.linkList.map(normalizeFooterBarLink) : [])
  footerBarLinks.value = barLinks

  if (!socialLinks.value.length) addSocialLink()
  if (!footerSocials.value.length) {
    addFooterSocial('left')
    addFooterSocial('right')
  }
  if (!footerLinkGroups.value.length) addFooterGroup()
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
      siteTitle: form.siteTitle.trim(),
      favicon: form.favicon.trim(),
      footerCustomText: form.footerCustomText.trim(),
      avatar: {
        img: form.avatarImg.trim(),
        effect: form.avatarEffect,
      },
      socialLinks: socialLinks.value
        .map(item => ({
          name: item.name.trim(),
          url: item.url.trim(),
          icon: item.icon.trim(),
        }))
        .filter(item => item.name || item.url || item.icon),
      author_status: {
        enable: form.authorStatusEnable,
        statusImg: form.authorStatusImg.trim(),
        skills: fromLineText(form.authorStatusSkillsText),
      },
      runtime: {
        enable: form.runtimeEnable,
        launch_time: form.runtimeLaunchTime.trim(),
        work_img: form.runtimeWorkImg.trim(),
        work_description: form.runtimeWorkDescription.trim(),
        offduty_img: form.runtimeOffdutyImg.trim(),
        offduty_description: form.runtimeOffdutyDescription.trim(),
      },
      footerRuntime: {
        enable: form.runtimeEnable,
        launch_time: form.runtimeLaunchTime.trim(),
        work_img: form.runtimeWorkImg.trim(),
        work_description: form.runtimeWorkDescription.trim(),
        offduty_img: form.runtimeOffdutyImg.trim(),
        offduty_description: form.runtimeOffdutyDescription.trim(),
      },
      error_404: {
        enable: form.error404Enable,
        subtitle: form.error404Subtitle.trim(),
        background: form.error404Background.trim(),
      },
      error_img: {
        flink: form.errorImgFlink.trim(),
        post_page: form.errorImgPostPage.trim(),
      },
      footerSocialBar: {
        enable: form.footerSocialBarEnable,
        centerImg: form.footerSocialBarCenterImg.trim(),
      },
      footerOwner: {
        enable: form.footerOwnerEnable,
        since: form.footerOwnerSince,
      },
      footerList: {
        enable: form.footerListEnable,
        project: footerLinkGroups.value
          .map(group => ({
            title: group.title.trim(),
            links: group.links
              .map(link => ({
                title: link.title.trim(),
                link: link.link.trim(),
              }))
              .filter(link => link.title || link.link),
          }))
          .filter(group => group.title || group.links.length > 0),
        randomFriends: form.footerListRandomFriends,
      },
      footerBdageitem: {
        enable: form.footerBadgeEnable,
        list: badgeItems.value
          .map(item => ({
            link: item.link.trim(),
            shields: item.shields.trim(),
            message: item.message.trim(),
          }))
          .filter(item => item.link || item.shields || item.message),
      },
      badgeItems: badgeItems.value
        .map(item => ({
          link: item.link.trim(),
          shields: item.shields.trim(),
          message: item.message.trim(),
        }))
        .filter(item => item.link || item.shields || item.message),
      footerBar: {
        enable: form.footerBarEnable,
        linkList: footerBarLinks.value
          .map(item => ({
            text: item.text.trim(),
            link: item.link.trim(),
          }))
          .filter(item => item.text || item.link),
        cc: {
          enable: form.footerBarCcEnable,
          link: form.footerBarCcLink.trim(),
        },
        subTitle: {
          enable: form.footerBarSubtitleEnable,
          effect: form.footerBarSubtitleEffect,
          startDelay: form.footerBarSubtitleStartDelay,
          typeSpeed: form.footerBarSubtitleTypeSpeed,
          backSpeed: form.footerBarSubtitleBackSpeed,
          loop: form.footerBarSubtitleLoop,
          source: form.footerBarSubtitleSource.trim(),
          sub: fromLineText(form.footerBarSubtitleText),
        },
        authorLink: form.footerBarAuthorLink.trim(),
      },
      footerSocials: footerSocials.value
        .map(item => ({
          title: item.title.trim(),
          link: item.link.trim(),
          icon: item.icon.trim(),
          side: item.side,
        }))
        .filter(item => item.title || item.link || item.icon),
      footer: {
        owner: {
          enable: form.footerOwnerEnable,
          since: form.footerOwnerSince,
        },
        runtime: {
          enable: form.runtimeEnable,
          launch_time: form.runtimeLaunchTime.trim(),
          work_img: form.runtimeWorkImg.trim(),
          work_description: form.runtimeWorkDescription.trim(),
          offduty_img: form.runtimeOffdutyImg.trim(),
          offduty_description: form.runtimeOffdutyDescription.trim(),
        },
        socialBar: {
          enable: form.footerSocialBarEnable,
          centerImg: form.footerSocialBarCenterImg.trim(),
          left: footerSocials.value
            .filter(item => item.side === 'left')
            .map(item => ({
              title: item.title.trim(),
              link: item.link.trim(),
              icon: item.icon.trim(),
            }))
            .filter(item => item.title || item.link || item.icon),
          right: footerSocials.value
            .filter(item => item.side === 'right')
            .map(item => ({
              title: item.title.trim(),
              link: item.link.trim(),
              icon: item.icon.trim(),
            }))
            .filter(item => item.title || item.link || item.icon),
        },
        list: {
          enable: form.footerListEnable,
          project: footerLinkGroups.value
            .map(group => ({
              title: group.title.trim(),
              links: group.links
                .map(link => ({
                  title: link.title.trim(),
                  link: link.link.trim(),
                }))
                .filter(link => link.title || link.link),
            }))
            .filter(group => group.title || group.links.length > 0),
          randomFriends: form.footerListRandomFriends,
        },
        bdageitem: {
          enable: form.footerBadgeEnable,
          list: badgeItems.value
            .map(item => ({
              link: item.link.trim(),
              shields: item.shields.trim(),
              message: item.message.trim(),
            }))
            .filter(item => item.link || item.shields || item.message),
        },
        footerBar: {
          enable: form.footerBarEnable,
          linkList: footerBarLinks.value
            .map(item => ({
              text: item.text.trim(),
              link: item.link.trim(),
            }))
            .filter(item => item.text || item.link),
          cc: {
            enable: form.footerBarCcEnable,
            link: form.footerBarCcLink.trim(),
          },
          subTitle: {
            enable: form.footerBarSubtitleEnable,
            effect: form.footerBarSubtitleEffect,
            startDelay: form.footerBarSubtitleStartDelay,
            typeSpeed: form.footerBarSubtitleTypeSpeed,
            backSpeed: form.footerBarSubtitleBackSpeed,
            loop: form.footerBarSubtitleLoop,
            source: form.footerBarSubtitleSource.trim(),
            sub: fromLineText(form.footerBarSubtitleText),
          },
          authorLink: form.footerBarAuthorLink.trim(),
        },
        custom_text: form.footerCustomText.trim(),
      },
    })

    message.value = '全局设置已保存。'
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
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">General</p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-text">站点基础信息</h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-muted">
        这一页承接站点标题、头像、社交链接、页脚三段结构、运行时间和 404 页面设置，不再依赖大块 JSON。
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
        <h2 class="text-xl font-black text-text">基础信息</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">站点标题</span>
            <input v-model="form.siteTitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">Favicon</span>
            <input v-model="form.favicon" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="/favicon.ico" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">页脚自定义文本</span>
            <textarea v-model="form.footerCustomText" rows="4" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">头像与状态卡</h2>
        <div class="mt-5 space-y-5">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">头像图片</span>
            <input v-model="form.avatarImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.avatarEffect = !form.avatarEffect">
            <span class="text-sm text-text">启用头像动效</span>
            <span class="text-sm text-muted">{{ form.avatarEffect ? '已开启' : '已关闭' }}</span>
          </button>
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.authorStatusEnable = !form.authorStatusEnable">
            <span class="text-sm text-text">启用作者状态卡</span>
            <span class="text-sm text-muted">{{ form.authorStatusEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">状态卡图片</span>
            <input v-model="form.authorStatusImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">状态卡技能列表</span>
            <textarea v-model="form.authorStatusSkillsText" rows="5" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一个技能，例如：Vue / Nuxt / TypeScript" />
          </label>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">站点社交链接</h2>
          <p class="mt-2 text-sm text-muted">这里会驱动头像卡、页脚和其它前台社交入口。</p>
        </div>
        <button type="button" class="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" @click="addSocialLink">
          新增社交链接
        </button>
      </div>

      <div class="mt-5 space-y-4">
        <article v-for="(item, index) in socialLinks" :key="`social-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-semibold text-text">社交项 {{ index + 1 }}</p>
            <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeSocialLink(index)">
              删除
            </button>
          </div>
          <div class="mt-4 grid gap-4 md:grid-cols-3">
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">名称</span>
              <input v-model="item.name" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">链接</span>
              <input v-model="item.url" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-xs font-medium text-muted">图标类名</span>
              <input v-model="item.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="fa-brands fa-github" >
            </label>
          </div>
        </article>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-text">页脚社交条</h2>
            <p class="mt-2 text-sm text-muted">分左右两侧输出，匹配前台三段式页脚社交布局。</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addFooterSocial('left')">
              新增左侧
            </button>
            <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addFooterSocial('right')">
              新增右侧
            </button>
          </div>
        </div>

        <div class="mt-5 space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerSocialBarEnable = !form.footerSocialBarEnable">
              <span class="text-sm text-text">启用页脚社交条</span>
              <span class="text-sm text-muted">{{ form.footerSocialBarEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">中间头像</span>
              <input v-model="form.footerSocialBarCenterImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>

          <article v-for="(item, index) in footerSocials" :key="`footer-social-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-semibold text-text">社交条 {{ index + 1 }}</p>
              <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeFooterSocial(index)">
                删除
              </button>
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">标题</span>
                <input v-model="item.title" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </label>
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">链接</span>
                <input v-model="item.link" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </label>
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">图标</span>
                <input v-model="item.icon" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
              </label>
              <label class="block space-y-2">
                <span class="text-xs font-medium text-muted">侧别</span>
                <select v-model="item.side" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                  <option value="left">左侧</option>
                  <option value="right">右侧</option>
                </select>
              </label>
            </div>
          </article>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <h2 class="text-xl font-black text-text">运行时间与异常页</h2>
        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.runtimeEnable = !form.runtimeEnable">
            <span class="text-sm text-text">启用站点运行时间</span>
            <span class="text-sm text-muted">{{ form.runtimeEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">站点上线时间</span>
            <input v-model="form.runtimeLaunchTime" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="例如：2024-01-01 00:00:00" >
          </label>
          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">上班图片</span>
              <input v-model="form.runtimeWorkImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">下班图片</span>
              <input v-model="form.runtimeOffdutyImg" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">上班文案</span>
              <textarea v-model="form.runtimeWorkDescription" rows="3" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">下班文案</span>
              <textarea v-model="form.runtimeOffdutyDescription" rows="3" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-7 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
          </div>

          <div class="mt-2 h-px bg-border/70" />

          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.error404Enable = !form.error404Enable">
            <span class="text-sm text-text">启用 404 页面文案</span>
            <span class="text-sm text-muted">{{ form.error404Enable ? '已开启' : '已关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">404 副标题</span>
            <input v-model="form.error404Subtitle" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">404 背景图</span>
            <input v-model="form.error404Background" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <div class="grid gap-5 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">友链页错误图</span>
              <input v-model="form.errorImgFlink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">文章页错误图</span>
              <input v-model="form.errorImgPostPage" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black text-text">页脚分组导航</h2>
          <p class="mt-2 text-sm text-muted">这里对应页脚第二段的多列导航结构。</p>
        </div>
        <button type="button" class="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90" @click="addFooterGroup">
          新增分组
        </button>
      </div>

      <div class="mt-5 grid gap-5">
        <div class="grid gap-4 md:grid-cols-2">
          <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerListEnable = !form.footerListEnable">
            <span class="text-sm text-text">启用页脚分组导航</span>
            <span class="text-sm text-muted">{{ form.footerListEnable ? '已开启' : '已关闭' }}</span>
          </button>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">随机友链数量</span>
            <input v-model.number="form.footerListRandomFriends" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
        </div>

        <article v-for="(group, groupIndex) in footerLinkGroups" :key="`group-${groupIndex}`" class="rounded-3xl border border-border bg-background/70 p-5">
          <div class="flex items-center justify-between gap-4">
            <label class="block flex-1 space-y-2">
              <span class="text-xs font-medium text-muted">分组标题</span>
              <input v-model="group.title" type="text" class="w-full rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeFooterGroup(groupIndex)">
              删除分组
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div v-for="(link, linkIndex) in group.links" :key="`group-${groupIndex}-link-${linkIndex}`" class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input v-model="link.title" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="链接标题" >
              <input v-model="link.link" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="链接地址" >
              <button type="button" class="rounded-2xl border border-rose-200 px-4 py-3 text-sm text-rose-500 transition hover:bg-rose-50" @click="removeFooterGroupLink(groupIndex, linkIndex)">
                删除
              </button>
            </div>
          </div>

          <button type="button" class="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addFooterGroupLink(groupIndex)">
            新增链接
          </button>
        </article>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-text">页脚徽章</h2>
            <p class="mt-2 text-sm text-muted">用于页脚徽章带或技术栈标识。</p>
          </div>
          <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addBadgeItem">
            新增徽章
          </button>
        </div>

        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBadgeEnable = !form.footerBadgeEnable">
            <span class="text-sm text-text">启用页脚徽章</span>
            <span class="text-sm text-muted">{{ form.footerBadgeEnable ? '已开启' : '已关闭' }}</span>
          </button>

          <article v-for="(item, index) in badgeItems" :key="`badge-${index}`" class="rounded-3xl border border-border bg-background/70 p-5">
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-semibold text-text">徽章 {{ index + 1 }}</p>
              <button type="button" class="text-sm text-rose-500 transition hover:text-rose-600" @click="removeBadgeItem(index)">
                删除
              </button>
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <input v-model="item.link" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="跳转链接" >
              <input v-model="item.shields" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Shields 地址" >
              <input v-model="item.message" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="文案" >
            </div>
          </article>
        </div>
      </article>

      <article class="rounded-[28px] border border-border/70 bg-surface/82 p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-text">页脚底栏</h2>
            <p class="mt-2 text-sm text-muted">对应页脚第三段的协议链接、作者链接和滚动副标题。</p>
          </div>
          <button type="button" class="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/30" @click="addFooterBarLink">
            新增链接
          </button>
        </div>

        <div class="mt-5 space-y-5">
          <button type="button" class="flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBarEnable = !form.footerBarEnable">
            <span class="text-sm text-text">启用页脚底栏</span>
            <span class="text-sm text-muted">{{ form.footerBarEnable ? '已开启' : '已关闭' }}</span>
          </button>

          <div class="space-y-3">
            <div v-for="(item, index) in footerBarLinks" :key="`bar-link-${index}`" class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input v-model="item.text" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="链接文本" >
              <input v-model="item.link" type="text" class="rounded-2xl border border-border bg-white/90 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="链接地址" >
              <button type="button" class="rounded-2xl border border-rose-200 px-4 py-3 text-sm text-rose-500 transition hover:bg-rose-50" @click="removeFooterBarLink(index)">
                删除
              </button>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBarCcEnable = !form.footerBarCcEnable">
              <span class="text-sm text-text">启用 CC 协议链接</span>
              <span class="text-sm text-muted">{{ form.footerBarCcEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">CC 协议链接</span>
              <input v-model="form.footerBarCcLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">作者跳转链接</span>
            <input v-model="form.footerBarAuthorLink" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBarSubtitleEnable = !form.footerBarSubtitleEnable">
              <span class="text-sm text-text">启用滚动副标题</span>
              <span class="text-sm text-muted">{{ form.footerBarSubtitleEnable ? '已开启' : '已关闭' }}</span>
            </button>
            <button type="button" class="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBarSubtitleEffect = !form.footerBarSubtitleEffect">
              <span class="text-sm text-text">启用打字效果</span>
              <span class="text-sm text-muted">{{ form.footerBarSubtitleEffect ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">起始延迟</span>
              <input v-model.number="form.footerBarSubtitleStartDelay" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">打字速度</span>
              <input v-model.number="form.footerBarSubtitleTypeSpeed" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <label class="block space-y-2">
              <span class="text-sm font-medium text-text">回删速度</span>
              <input v-model.number="form.footerBarSubtitleBackSpeed" type="number" min="0" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
            </label>
            <button type="button" class="mt-7 flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition hover:border-primary/20" @click="form.footerBarSubtitleLoop = !form.footerBarSubtitleLoop">
              <span class="text-sm text-text">循环播放</span>
              <span class="text-sm text-muted">{{ form.footerBarSubtitleLoop ? '已开启' : '已关闭' }}</span>
            </button>
          </div>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">副标题来源</span>
            <input v-model="form.footerBarSubtitleSource" type="text" class="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" >
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-text">副标题文本列表</span>
            <textarea v-model="form.footerBarSubtitleText" rows="5" class="w-full rounded-2xl border border-border bg-background/85 px-4 py-3 font-mono text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="每行一句副标题" />
          </label>
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
        {{ saving ? '保存中...' : '保存基础配置' }}
      </button>
    </div>
  </div>
</template>
