import type {
  AddToAnyConfig,
  AlgoliaSearchConfig,
  ArtalkConfig,
  AnnouncementConfig,
  AuthorStatusConfig,
  ChatServiceConfig,
  ChatToolsConfig,
  CodeBlockConfig,
  CommentsConfig,
  CopySettingsConfig,
  DocsearchConfig,
  ErrorImageConfig,
  ErrorPageConfig,
  FooterConfig,
  GiscusConfig,
  HomepageConfig,
  IndexPostContentConfig,
  VisitorMailConfig,
  CommentBarrageConfig,
  GreetingBoxConfig,
  NavMusicConfig,
  MusicPlayerConfig,
  FriendsVueConfig,
  DiyTitleConfig,
  ConsoleLogConfig,
  LAConfig,
  UmamiConfig,
  PToolConfig,
  KaTeXConfig,
  LocalSearchConfig,
  LinkPageTopConfig,
  MainToneConfig,
  MathConfig,
  MathJaxConfig,
  MournConfig,
  NavConfig,
  NavbarMenuItem,
  NoticeOutdateConfig,
  PhotoFigcaptionConfig,
  PostCopyrightConfig,
  PostEditConfig,
  PeopleCanvasConfig,
  PostMetaConfig,
  PostMetaSectionConfig,
  ProfileConfig,
  RelatedPostConfig,
  RewardConfig,
  RightsideButtonsConfig,
  SearchConfig,
  ShareJsConfig,
  SidebarConfig,
  SiteSettingsMap,
  SocialLink,
  SocialBarLink,
  TocConfig,
  TopImageConfig,
  ValineConfig,
  WalineConfig,
  WechatConfig,
  WordcountConfig,
} from './site-settings.types'
import {
  defaultAddToAnyConfig,
  defaultAnnouncement,
  defaultAlgoliaSearchConfig,
  defaultArtalkConfig,
  defaultAuthorStatusConfig,
  defaultChatServiceConfig,
  defaultChatToolsConfig,
  defaultCodeBlockConfig,
  defaultCommentsConfig,
  defaultCopySettingsConfig,
  defaultDocsearchConfig,
  defaultErrorImageConfig,
  defaultErrorPageConfig,
  defaultFooterConfig,
  defaultGiscusConfig,
  defaultHomepageConfig,
  defaultIndexPostContentConfig,
  defaultVisitorMailConfig,
  defaultCommentBarrageConfig,
  defaultGreetingBoxConfig,
  defaultNavMusicConfig,
  defaultFriendsVueConfig,
  defaultDiyTitleConfig,
  defaultConsoleLogConfig,
  defaultLAConfig,
  defaultUmamiConfig,
  defaultPToolConfig,
  defaultKaTeXConfig,
  defaultLocalSearchConfig,
  defaultMainToneConfig,
  defaultMathConfig,
  defaultMathJaxConfig,
  defaultMournConfig,
  defaultNavConfig,
  defaultNavbarMenu,
  defaultNoticeOutdateConfig,
  defaultPhotoFigcaptionConfig,
  defaultPostCopyrightConfig,
  defaultPostEditConfig,
  defaultPostMetaConfig,
  defaultPostMetaSectionConfig,
  defaultProfileConfig,
  defaultRelatedPostConfig,
  defaultRewardConfig,
  defaultRightsideButtonsConfig,
  defaultSearchConfig,
  defaultShareJsConfig,
  defaultSidebarConfig,
  defaultTocConfig,
  defaultTopImageConfig,
  defaultValineConfig,
  defaultWalineConfig,
  defaultWechatConfig,
  defaultWordcountConfig,
} from './site-settings.types'

function normalizeFooterSocialIcon(icon: string | undefined): string {
  if (!icon) {
    return 'fa-solid fa-link'
  }
  if (icon.startsWith('fa-') || icon.startsWith('fa ')) {
    return icon
  }
  if (icon.startsWith('i-simple-icons-github')) {
    return 'fa-brands fa-github'
  }
  if (icon.startsWith('i-simple-icons-twitter')) {
    return 'fa-brands fa-x-twitter'
  }
  if (icon.startsWith('i-simple-icons-bilibili')) {
    return 'fa-brands fa-bilibili'
  }
  if (icon.startsWith('i-heroicons-envelope')) {
    return 'fa-solid fa-envelope'
  }
  if (icon.startsWith('i-heroicons-rss')) {
    return 'fa-solid fa-rss'
  }
  return icon
}

function normalizeFooterSocials(raw: unknown, fallback: SocialBarLink[]): SocialBarLink[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return fallback
  }

  return raw
    .map((item) => {
      const record = item as Record<string, unknown>
      return {
        title: String(record.title || ''),
        link: String(record.link || '#'),
        icon: normalizeFooterSocialIcon(record.icon ? String(record.icon) : undefined),
        side: String(record.side || 'left'),
      }
    })
    .filter(item => item.title)
    .map(({ side: _side, ...item }) => item)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(item => String(item)) : []
}

function asNumber(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function buildFooterConfig(settings: SiteSettingsMap, profile: ProfileConfig): FooterConfig {
  const footerRecord = asRecord(settings.footer)
  const footerSocialBar = asRecord(settings.footerSocialBar)
  const footerOwner = asRecord(settings.footerOwner)
  const footerRuntime = asRecord(settings.footerRuntime)
  const footerList = asRecord(settings.footerList)
  const footerBar = asRecord(settings.footerBar)
  const footerBdageitem = asRecord(settings.footerBdageitem)
  const runtime = asRecord(settings.runtime)
  const nestedOwner = asRecord(footerRecord.owner)
  const nestedRuntime = asRecord(footerRecord.runtime)
  const nestedSocialBar = asRecord(footerRecord.socialBar)
  const nestedList = asRecord(footerRecord.list)
  const nestedFooterBar = asRecord(footerRecord.footerBar)
  const nestedBadgeItem = asRecord(footerRecord.bdageitem)
  const nestedSubtitle = asRecord(nestedFooterBar.subTitle)
  const nestedCc = asRecord(nestedFooterBar.cc)
  const badgeItems = Array.isArray(settings.badgeItems) ? settings.badgeItems as FooterConfig['bdageitem']['list'] : []
  const footerSocials = Array.isArray(settings.footerSocials) ? settings.footerSocials as Array<Record<string, unknown>> : []
  const legacyLeftSocials = footerSocials.filter(item => String(item.side || 'left') === 'left')
  const legacyRightSocials = footerSocials.filter(item => String(item.side || 'left') === 'right')

  const leftSocials = normalizeFooterSocials(
    legacyLeftSocials.length > 0 ? legacyLeftSocials : nestedSocialBar.left,
    defaultFooterConfig.socialBar.left,
  )
  const rightSocials = normalizeFooterSocials(
    legacyRightSocials.length > 0 ? legacyRightSocials : nestedSocialBar.right,
    defaultFooterConfig.socialBar.right,
  )

  const projectLinks = Array.isArray(footerList.project)
    ? footerList.project as FooterConfig['list']['project']
    : (Array.isArray(nestedList.project)
        ? nestedList.project as FooterConfig['list']['project']
        : defaultFooterConfig.list.project)

  const linkList = Array.isArray(footerBar.linkList)
    ? footerBar.linkList as FooterConfig['footerBar']['linkList']
    : (Array.isArray(nestedFooterBar.linkList)
        ? nestedFooterBar.linkList as FooterConfig['footerBar']['linkList']
        : defaultFooterConfig.footerBar.linkList)

  return {
    socialBar: {
      enable: Boolean(
        footerSocialBar.enable
        ?? nestedSocialBar.enable
        ?? footerRecord.socialBarEnabled
        ?? defaultFooterConfig.socialBar.enable,
      ),
      centerImg: String(
        footerSocialBar.centerImg
        ?? nestedSocialBar.centerImg
        ?? profile.avatar
        ?? defaultFooterConfig.socialBar.centerImg,
      ),
      left: leftSocials,
      right: rightSocials,
    },
    owner: {
      enable: Boolean(
        footerOwner.enable
        ?? nestedOwner.enable
        ?? footerRecord.ownerEnabled
        ?? defaultFooterConfig.owner.enable,
      ),
      since: asNumber(
        footerOwner.since
        ?? nestedOwner.since
        ?? footerRecord.ownerSince
        ?? defaultFooterConfig.owner.since,
        defaultFooterConfig.owner.since ?? new Date().getFullYear(),
      ),
    },
    runtime: {
      enable: Boolean(
        footerRuntime.enable
        ?? nestedRuntime.enable
        ?? runtime.enabled
        ?? defaultFooterConfig.runtime.enable,
      ),
      launch_time: String(
        footerRuntime.launch_time
        ?? nestedRuntime.launch_time
        ?? runtime.launchTime
        ?? runtime.launch_time
        ?? defaultFooterConfig.runtime.launch_time
        ?? '',
      ),
      work_img: String(
        footerRuntime.work_img
        ?? nestedRuntime.work_img
        ?? runtime.workImage
        ?? runtime.work_img
        ?? defaultFooterConfig.runtime.work_img
        ?? '',
      ),
      work_description: String(
        footerRuntime.work_description
        ?? nestedRuntime.work_description
        ?? runtime.workDescription
        ?? runtime.work_description
        ?? defaultFooterConfig.runtime.work_description
        ?? '',
      ),
      offduty_img: String(
        footerRuntime.offduty_img
        ?? nestedRuntime.offduty_img
        ?? runtime.offdutyImage
        ?? runtime.offduty_img
        ?? defaultFooterConfig.runtime.offduty_img
        ?? '',
      ),
      offduty_description: String(
        footerRuntime.offduty_description
        ?? nestedRuntime.offduty_description
        ?? runtime.offdutyDescription
        ?? runtime.offduty_description
        ?? defaultFooterConfig.runtime.offduty_description
        ?? '',
      ),
    },
    list: {
      enable: Boolean(footerList.enable ?? nestedList.enable ?? defaultFooterConfig.list.enable),
      project: projectLinks,
      randomFriends: asNumber(
        footerList.randomFriends ?? nestedList.randomFriends ?? defaultFooterConfig.list.randomFriends ?? 0,
        defaultFooterConfig.list.randomFriends ?? 0,
      ),
    },
    bdageitem: {
      enable: footerBdageitem.enable !== undefined
        ? Boolean(footerBdageitem.enable)
        : (nestedBadgeItem.enable !== undefined
            ? Boolean(nestedBadgeItem.enable)
            : (badgeItems.length > 0 || defaultFooterConfig.bdageitem.enable)),
      list: badgeItems.length
        ? badgeItems
        : (Array.isArray(nestedBadgeItem.list)
            ? nestedBadgeItem.list as FooterConfig['bdageitem']['list']
            : defaultFooterConfig.bdageitem.list),
    },
    footerBar: {
      enable: Boolean(
        footerBar.enable
        ?? nestedFooterBar.enable
        ?? footerRecord.footerBarEnabled
        ?? defaultFooterConfig.footerBar.enable,
      ),
      linkList,
      cc: {
        enable: Boolean(
          asRecord(footerBar.cc).enable
          ?? nestedCc.enable
          ?? defaultFooterConfig.footerBar.cc.enable,
        ),
        link: String(
          asRecord(footerBar.cc).link
          ?? nestedCc.link
          ?? defaultFooterConfig.footerBar.cc.link
          ?? '',
        ),
      },
      subTitle: {
        enable: Boolean(
          asRecord(footerBar.subTitle).enable
          ?? nestedSubtitle.enable
          ?? footerRecord.subTitleEnabled
          ?? defaultFooterConfig.footerBar.subTitle.enable,
        ),
        effect: Boolean(
          asRecord(footerBar.subTitle).effect
          ?? nestedSubtitle.effect
          ?? defaultFooterConfig.footerBar.subTitle.effect
          ?? false,
        ),
        startDelay: asNumber(
          asRecord(footerBar.subTitle).startDelay
          ?? nestedSubtitle.startDelay
          ?? defaultFooterConfig.footerBar.subTitle.startDelay
          ?? 300,
          defaultFooterConfig.footerBar.subTitle.startDelay ?? 300,
        ),
        typeSpeed: asNumber(
          asRecord(footerBar.subTitle).typeSpeed
          ?? nestedSubtitle.typeSpeed
          ?? defaultFooterConfig.footerBar.subTitle.typeSpeed
          ?? 150,
          defaultFooterConfig.footerBar.subTitle.typeSpeed ?? 150,
        ),
        backSpeed: asNumber(
          asRecord(footerBar.subTitle).backSpeed
          ?? nestedSubtitle.backSpeed
          ?? defaultFooterConfig.footerBar.subTitle.backSpeed
          ?? 50,
          defaultFooterConfig.footerBar.subTitle.backSpeed ?? 50,
        ),
        loop: Boolean(
          asRecord(footerBar.subTitle).loop
          ?? nestedSubtitle.loop
          ?? defaultFooterConfig.footerBar.subTitle.loop
          ?? true,
        ),
        source: String(
          asRecord(footerBar.subTitle).source
          ?? nestedSubtitle.source
          ?? defaultFooterConfig.footerBar.subTitle.source
          ?? '',
        ),
        sub: asStringArray(asRecord(footerBar.subTitle).sub).length > 0
          ? asStringArray(asRecord(footerBar.subTitle).sub)
          : (asStringArray(nestedSubtitle.sub).length > 0
              ? asStringArray(nestedSubtitle.sub)
              : defaultFooterConfig.footerBar.subTitle.sub ?? []),
      },
      authorLink: String(
        footerBar.authorLink
        ?? nestedFooterBar.authorLink
        ?? footerRecord.authorLink
        ?? defaultFooterConfig.footerBar.authorLink,
      ),
    },
    custom_text: String(
      settings.footerCustomText
      ?? footerRecord.custom_text
      ?? footerRecord.customText
      ?? defaultFooterConfig.custom_text,
    ),
  }
}

function resolveAliasedSetting<T>(settings: SiteSettingsMap, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (settings[key] !== undefined) {
      return settings[key] as T
    }
  }
  return undefined
}

export function useSiteSettings() {
  const settings = useState<SiteSettingsMap>('site-settings', () => ({}))
  const loading = useState<boolean>('site-settings-loading', () => false)
  const initialized = useState<boolean>('site-settings-init', () => false)

  async function refresh(): Promise<void> {
    if (import.meta.server && initialized.value) {
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{
        code: number
        data: Record<string, Array<{ key: string, value: unknown }>>
      }>('/api/settings')

      if (response.code === 0 && response.data) {
        const flat: SiteSettingsMap = {}
        for (const rows of Object.values(response.data)) {
          for (const row of rows) {
            flat[row.key] = row.value
          }
        }
        settings.value = flat
      }
    }
    catch (error) {
      console.error('[useSiteSettings] Failed to fetch settings:', error)
    }
    finally {
      loading.value = false
      initialized.value = true
    }
  }

  if (import.meta.client && !initialized.value) {
    refresh()
  }

  const announcement = computed<AnnouncementConfig>(() =>
    (settings.value.announcement as AnnouncementConfig | undefined) ?? defaultAnnouncement,
  )

  const nav = computed<NavConfig>(() =>
    (settings.value.nav as NavConfig | undefined) ?? defaultNavConfig,
  )

  const menuGroups = computed<NavbarMenuItem[]>(() => {
    const raw = settings.value.menu
    if (!raw || typeof raw !== 'object') return defaultNavbarMenu

    const items: NavbarMenuItem[] = []
    const record = raw as Record<string, unknown>
    for (const [key, val] of Object.entries(record)) {
      if (!val || typeof val !== 'object') continue
      const entry = val as Record<string, unknown>

      if (Array.isArray(entry.children)) {
        const children = entry.children
          .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
          .map(c => ({
            name: String(c.name ?? ''),
            link: String(c.link ?? '#'),
            icon: String(c.icon ?? ''),
          }))
          .filter(c => c.name)
        items.push({
          name: key,
          icon: String(entry.icon ?? ''),
          children,
        })
      }
      else if (entry.link) {
        items.push({
          name: key,
          link: String(entry.link),
          icon: String(entry.icon ?? ''),
        })
      }
    }
    return items.length ? items : defaultNavbarMenu
  })

  const commentsRaw = computed(() => ((settings.value.comments as unknown as Record<string, unknown> | undefined) ?? {}))

  const comments = computed<CommentsConfig>(() => ({
    ...defaultCommentsConfig,
    ...(commentsRaw.value as unknown as CommentsConfig),
    twikoo: {
      ...defaultCommentsConfig.twikoo,
      ...((settings.value.twikoo as Record<string, unknown> | undefined) ?? {}),
      ...((((settings.value.comments as CommentsConfig | undefined)?.twikoo) ?? {}) as Record<string, unknown>),
    },
    cardPostCount: commentsRaw.value.cardPostCount !== undefined
      ? Boolean(commentsRaw.value.cardPostCount)
      : (commentsRaw.value.card_post_count !== undefined
          ? Boolean(commentsRaw.value.card_post_count)
          : defaultCommentsConfig.cardPostCount),
  }))

  const valine = computed<ValineConfig>(() => {
    const raw = (settings.value.valine as Record<string, unknown> | undefined) ?? {}
    return {
      ...defaultValineConfig,
      ...raw,
      guestInfo: String(raw.guestInfo ?? raw.guest_info ?? defaultValineConfig.guestInfo),
      recordIP: raw.recordIP !== undefined ? Boolean(raw.recordIP) : defaultValineConfig.recordIP,
      serverURLs: String(raw.serverURLs ?? defaultValineConfig.serverURLs),
      enableQQ: raw.enableQQ !== undefined ? Boolean(raw.enableQQ) : defaultValineConfig.enableQQ,
      requiredFields: String(raw.requiredFields ?? defaultValineConfig.requiredFields),
      visitor: raw.visitor !== undefined ? Boolean(raw.visitor) : defaultValineConfig.visitor,
      master: Array.isArray(raw.master) ? raw.master.map(item => String(item)) : defaultValineConfig.master,
      friends: Array.isArray(raw.friends) ? raw.friends.map(item => String(item)) : defaultValineConfig.friends,
      tagMeta: String(raw.tagMeta ?? defaultValineConfig.tagMeta),
      option: (raw.option as Record<string, unknown> | undefined) ?? defaultValineConfig.option,
    }
  })

  const waline = computed<WalineConfig>(() => {
    const raw = (settings.value.waline as Record<string, unknown> | undefined) ?? {}
    return {
      ...defaultWalineConfig,
      ...raw,
      metaCss: raw.metaCss !== undefined ? Boolean(raw.metaCss) : Boolean(raw.meta_css ?? defaultWalineConfig.metaCss),
      option: (raw.option as Record<string, unknown> | undefined) ?? defaultWalineConfig.option,
    }
  })

  const artalk = computed<ArtalkConfig>(() => {
    const raw = (settings.value.artalk as Record<string, unknown> | undefined) ?? {}
    return {
      ...defaultArtalkConfig,
      ...raw,
      visitor: raw.visitor !== undefined ? Boolean(raw.visitor) : defaultArtalkConfig.visitor,
      option: (raw.option as Record<string, unknown> | undefined) ?? defaultArtalkConfig.option,
    }
  })

  const giscus = computed<GiscusConfig>(() => {
    const raw = (settings.value.giscus as Record<string, unknown> | undefined) ?? {}
    const theme = (raw.theme as Record<string, unknown> | undefined) ?? {}
    const option = (raw.option as Record<string, unknown> | undefined) ?? {}
    return {
      repo: String(raw.repo ?? defaultGiscusConfig.repo),
      repoId: String(raw.repoId ?? raw.repo_id ?? defaultGiscusConfig.repoId),
      categoryId: String(raw.categoryId ?? raw.category_id ?? defaultGiscusConfig.categoryId),
      theme: {
        light: String(theme.light ?? defaultGiscusConfig.theme.light),
        dark: String(theme.dark ?? defaultGiscusConfig.theme.dark),
      },
      option: {
        lang: String(option.lang ?? option['data-lang'] ?? defaultGiscusConfig.option.lang),
        mapping: String(option.mapping ?? option['data-mapping'] ?? defaultGiscusConfig.option.mapping),
        category: String(option.category ?? option['data-category'] ?? defaultGiscusConfig.option.category),
        inputPosition: String(option.inputPosition ?? option['data-input-position'] ?? defaultGiscusConfig.option.inputPosition),
      },
    }
  })

  const visitorMail = computed<VisitorMailConfig>(() => {
    const raw = (settings.value.visitorMail as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultVisitorMailConfig.enable,
      mail: String(raw.mail ?? defaultVisitorMailConfig.mail),
    }
  })

  const commentBarrage = computed<CommentBarrageConfig>(() => {
    const raw = (settings.value.commentBarrage as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultCommentBarrageConfig.enable,
      maxBarrage: asNumber(raw.maxBarrage, defaultCommentBarrageConfig.maxBarrage),
      barrageTime: asNumber(raw.barrageTime, defaultCommentBarrageConfig.barrageTime),
      accessToken: String(raw.accessToken ?? defaultCommentBarrageConfig.accessToken),
      mailMd5: String(raw.mailMd5 ?? defaultCommentBarrageConfig.mailMd5),
    }
  })

  const greetingBox = computed<GreetingBoxConfig>(() => {
    const raw = (settings.value.greetingBox as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultGreetingBoxConfig.enable,
      default: String(raw.default ?? defaultGreetingBoxConfig.default),
      list: Array.isArray(raw.list)
        ? raw.list.map((item) => {
          const record = item as Record<string, unknown>
          return {
            greeting: String(record.greeting ?? ''),
            startTime: asNumber(record.startTime, 0),
            endTime: asNumber(record.endTime, 0),
          }
        })
        : defaultGreetingBoxConfig.list,
    }
  })

  const navMusic = computed<NavMusicConfig>(() => {
    const raw = (settings.value.navMusic as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultNavMusicConfig.enable,
      consoleWidescreenMusic: raw.consoleWidescreenMusic !== undefined
        ? Boolean(raw.consoleWidescreenMusic)
        : Boolean(raw.console_widescreen_music ?? defaultNavMusicConfig.consoleWidescreenMusic),
      id: String(raw.id ?? defaultNavMusicConfig.id),
      server: String(raw.server ?? defaultNavMusicConfig.server),
      volume: Number(raw.volume ?? defaultNavMusicConfig.volume),
      allPlaylist: String(raw.allPlaylist ?? raw.all_playlist ?? defaultNavMusicConfig.allPlaylist),
    }
  })

  const musicPlayer = computed<MusicPlayerConfig>(() => {
    const raw = (settings.value.musicPlayer as Record<string, unknown> | undefined) ?? {}
    return {
      enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : true,
      autoPlay: raw.autoPlay !== undefined ? Boolean(raw.autoPlay) : false,
      volume: Math.max(0, Math.min(1, Number(raw.volume ?? 0.7))),
      source: raw.source === 'custom' ? 'custom' : 'meting',
    }
  })

  const friendsVue = computed<FriendsVueConfig>(() => {
    const raw = (settings.value.friendsVue as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultFriendsVueConfig.enable,
      vueJs: String(raw.vueJs ?? raw.vue_js ?? defaultFriendsVueConfig.vueJs),
      apiurl: String(raw.apiurl ?? defaultFriendsVueConfig.apiurl),
      topTips: String(raw.topTips ?? raw.top_tips ?? defaultFriendsVueConfig.topTips),
      topBackground: String(raw.topBackground ?? raw.top_background ?? defaultFriendsVueConfig.topBackground),
    }
  })

  const addtoany = computed<AddToAnyConfig>(() => {
    const raw = (settings.value.addtoany as Record<string, unknown> | undefined) ?? {}
    const items = Array.isArray(raw.item)
      ? raw.item.map(item => String(item))
      : String(raw.item ?? defaultAddToAnyConfig.item.join(','))
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)

    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultAddToAnyConfig.enable,
      item: items.length ? items : defaultAddToAnyConfig.item,
    }
  })

  const profile = computed<ProfileConfig>(() => {
    const profileRecord = (settings.value.profile as ProfileConfig | undefined) ?? defaultProfileConfig
    const avatarRecord = (settings.value.avatar as Record<string, unknown> | undefined) ?? {}
    return {
      authorName: String(profileRecord.authorName || settings.value.siteTitle || defaultProfileConfig.authorName),
      avatar: String(profileRecord.avatar || avatarRecord.img || defaultProfileConfig.avatar),
      avatarEffect: avatarRecord.effect !== undefined
        ? Boolean(avatarRecord.effect)
        : (profileRecord.avatarEffect ?? defaultProfileConfig.avatarEffect),
      description: String(profileRecord.description || defaultProfileConfig.description),
    }
  })

  const social = computed<SocialLink[]>(() => {
    if (Array.isArray(settings.value.social)) {
      return settings.value.social as SocialLink[]
    }
    if (Array.isArray(settings.value.socialLinks)) {
      return (settings.value.socialLinks as Array<Record<string, unknown>>).map(item => ({
        name: String(item.name || ''),
        url: String(item.url || '#'),
        icon: normalizeFooterSocialIcon(item.icon ? String(item.icon) : undefined),
      }))
    }

    const legacySocials = [
      settings.value.github ? { name: 'GitHub', url: String(settings.value.github), icon: 'fa-brands fa-github' } : null,
      settings.value.twitter ? { name: 'Twitter', url: String(settings.value.twitter), icon: 'fa-brands fa-x-twitter' } : null,
      settings.value.weibo ? { name: 'Weibo', url: String(settings.value.weibo), icon: 'fa-brands fa-weibo' } : null,
      settings.value.email ? { name: 'Email', url: `mailto:${String(settings.value.email)}`, icon: 'fa-solid fa-envelope' } : null,
    ].filter(Boolean) as SocialLink[]

    return legacySocials
  })

  const codeBlock = computed<CodeBlockConfig>(() => ({
    ...defaultCodeBlockConfig,
    ...((settings.value.codeBlock as CodeBlockConfig | undefined) ?? {}),
  }))

  const copySettings = computed<CopySettingsConfig>(() => ({
    ...defaultCopySettingsConfig,
    ...((settings.value.copySettings as CopySettingsConfig | undefined) ?? {}),
  }))

  const search = computed<SearchConfig>(() => ({
    ...defaultSearchConfig,
    ...((settings.value.search as SearchConfig | undefined) ?? {}),
  }))

  const localSearch = computed<LocalSearchConfig>(() => ({
    ...defaultLocalSearchConfig,
    ...((settings.value.localSearch as LocalSearchConfig | undefined) ?? {}),
  }))

  const algoliaSearch = computed<AlgoliaSearchConfig>(() => ({
    ...defaultAlgoliaSearchConfig,
    ...((settings.value.algoliaSearch as AlgoliaSearchConfig | undefined) ?? {}),
    tags: Array.isArray((settings.value.algoliaSearch as AlgoliaSearchConfig | undefined)?.tags)
      ? ((settings.value.algoliaSearch as AlgoliaSearchConfig).tags)
      : defaultAlgoliaSearchConfig.tags,
  }))

  const docsearch = computed<DocsearchConfig>(() => ({
    ...defaultDocsearchConfig,
    ...((settings.value.docsearch as DocsearchConfig | undefined) ?? {}),
  }))

  const math = computed<MathConfig>(() => ({
    ...defaultMathConfig,
    ...((settings.value.math as MathConfig | undefined) ?? {}),
  }))

  const mathjax = computed<MathJaxConfig>(() => ({
    ...defaultMathJaxConfig,
    ...((settings.value.mathjax as MathJaxConfig | undefined) ?? {}),
  }))

  const katex = computed<KaTeXConfig>(() => ({
    ...defaultKaTeXConfig,
    ...((settings.value.katex as KaTeXConfig | undefined) ?? {}),
  }))

  const sidebar = computed<SidebarConfig>(() => {
    const fromSidebar = settings.value.sidebar as SidebarConfig | undefined
    if (fromSidebar?.widgets?.length || fromSidebar?.enabled !== undefined) {
      return {
        enabled: fromSidebar.enabled ?? true,
        widgets: fromSidebar.widgets?.length ? fromSidebar.widgets : defaultSidebarConfig.widgets,
      }
    }

    if (Array.isArray(settings.value.homepageSidebarWidgets)) {
      return {
        enabled: settings.value.homepageSidebarEnabled !== undefined
          ? Boolean(settings.value.homepageSidebarEnabled)
          : true,
        widgets: settings.value.homepageSidebarWidgets as string[],
      }
    }

    return defaultSidebarConfig
  })

  const wechat = computed<WechatConfig>(() =>
    (settings.value.wechat as WechatConfig | undefined) ?? defaultWechatConfig,
  )

  const footer = computed<FooterConfig>(() => buildFooterConfig(settings.value, profile.value))

  const authorStatus = computed<AuthorStatusConfig>(() => {
    const raw = (settings.value.author_status as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultAuthorStatusConfig.enable,
      statusImg: String(raw.statusImg || defaultAuthorStatusConfig.statusImg),
      skills: Array.isArray(raw.skills)
        ? raw.skills.map(item => String(item))
        : defaultAuthorStatusConfig.skills,
    }
  })

  const homepage = computed<HomepageConfig>(() => {
    const peopleCanvas = (settings.value.peoplecanvas as Record<string, unknown> | undefined) ?? {}
    const linkPageTop = (settings.value.linkPageTop as Record<string, unknown> | undefined) ?? {}
    const topImage = (settings.value.topImage as Record<string, unknown> | undefined) ?? {}

    return {
      enabled: settings.value.homeTopEnabled !== undefined
        ? Boolean(settings.value.homeTopEnabled)
        : defaultHomepageConfig.enabled,
      title: String(settings.value.homeTopTitle || defaultHomepageConfig.title),
      subTitle: String(settings.value.homeTopSubTitle || defaultHomepageConfig.subTitle),
      siteText: String(settings.value.homeTopSiteText || defaultHomepageConfig.siteText),
      swiperEnabled: settings.value.homeTopSwiperEnabled !== undefined
        ? Boolean(settings.value.homeTopSwiperEnabled)
        : defaultHomepageConfig.swiperEnabled,
      heroFullScreenEnable: settings.value.heroFullScreenEnable !== undefined
        ? Boolean(settings.value.heroFullScreenEnable)
        : defaultHomepageConfig.heroFullScreenEnable,
      heroParallaxEnable: settings.value.heroParallaxEnable !== undefined
        ? Boolean(settings.value.heroParallaxEnable)
        : defaultHomepageConfig.heroParallaxEnable,
      heroScrollIndicatorEnable: settings.value.heroScrollIndicatorEnable !== undefined
        ? Boolean(settings.value.heroScrollIndicatorEnable)
        : defaultHomepageConfig.heroScrollIndicatorEnable,
      subTitleSource: (settings.value.homeTopSubTitleSource as 'custom' | 'hitokoto' | undefined)
        ?? defaultHomepageConfig.subTitleSource,
      typedOptions: (settings.value.homeTopTypedOptions as Record<string, unknown> | undefined)
        ?? defaultHomepageConfig.typedOptions,
      coverPosition: ((settings.value.homepageCoverPosition as 'left' | 'right' | 'both') || defaultHomepageConfig.coverPosition),
      coverEnabled: settings.value.homepageCoverEnabled !== undefined
        ? Boolean(settings.value.homepageCoverEnabled)
        : defaultHomepageConfig.coverEnabled,
      doubleRow: settings.value.homepageDoubleRow !== undefined
        ? Boolean(settings.value.homepageDoubleRow)
        : defaultHomepageConfig.doubleRow,
      pageSize: Number(settings.value.homepagePageSize) || defaultHomepageConfig.pageSize,
      categories: Array.isArray(settings.value.homeTopCategories)
        ? settings.value.homeTopCategories as HomepageConfig['categories']
        : defaultHomepageConfig.categories,
      todayCard: (settings.value.todayCard as HomepageConfig['todayCard'] | undefined) ?? defaultHomepageConfig.todayCard,
      sidebarEnabled: settings.value.homepageSidebarEnabled !== undefined
        ? Boolean(settings.value.homepageSidebarEnabled)
        : defaultHomepageConfig.sidebarEnabled,
      sidebarWidgets: Array.isArray(settings.value.homepageSidebarWidgets)
        ? settings.value.homepageSidebarWidgets as string[]
        : defaultHomepageConfig.sidebarWidgets,
      skills: Array.isArray(settings.value.homepageSkills)
        ? settings.value.homepageSkills as HomepageConfig['skills']
        : defaultHomepageConfig.skills,
      peopleCanvas: {
        enable: peopleCanvas.enable !== undefined ? Boolean(peopleCanvas.enable) : defaultHomepageConfig.peopleCanvas.enable,
        img: String(peopleCanvas.img || defaultHomepageConfig.peopleCanvas.img),
      },
      linkPageTop: {
        enable: linkPageTop.enable !== undefined ? Boolean(linkPageTop.enable) : defaultHomepageConfig.linkPageTop.enable,
        title: String(linkPageTop.title || defaultHomepageConfig.linkPageTop.title),
        addFriendPlaceholder: String(linkPageTop.addFriendPlaceholder || defaultHomepageConfig.linkPageTop.addFriendPlaceholder),
      },
      pageThumbnailSuffix: String(settings.value.pageThumbnailSuffix || defaultHomepageConfig.pageThumbnailSuffix),
      defaultCovers: Array.isArray(settings.value.homepageDefaultCovers)
        ? settings.value.homepageDefaultCovers as string[]
        : defaultHomepageConfig.defaultCovers,
      topImage: {
        disableTopImg: topImage.disableTopImg !== undefined
          ? Boolean(topImage.disableTopImg)
          : defaultTopImageConfig.disableTopImg,
        indexImg: String(topImage.indexImg || defaultTopImageConfig.indexImg),
        defaultTopImg: String(topImage.defaultTopImg || defaultTopImageConfig.defaultTopImg),
        siteInfoTop: String(topImage.siteInfoTop || defaultTopImageConfig.siteInfoTop),
        topImgHeight: String(topImage.topImgHeight || defaultTopImageConfig.topImgHeight),
      },
    }
  })

  const errorPage = computed<ErrorPageConfig>(() => {
    const raw = (settings.value.error_404 as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultErrorPageConfig.enable,
      subtitle: String(raw.subtitle || defaultErrorPageConfig.subtitle),
      background: String(raw.background || defaultErrorPageConfig.background),
    }
  })

  const errorImage = computed<ErrorImageConfig>(() => {
    const raw = (settings.value.error_img as Record<string, unknown> | undefined) ?? {}
    return {
      flink: String(raw.flink || defaultErrorImageConfig.flink),
      post_page: String(raw.post_page || defaultErrorImageConfig.post_page),
    }
  })

  const rightsideButtons = computed<RightsideButtonsConfig>(() => {
    const raw = settings.value.rightsideItems as RightsideButtonsConfig | undefined
    return {
      enableOrder: raw?.enableOrder ?? defaultRightsideButtonsConfig.enableOrder,
      hide: Array.isArray(raw?.hide) ? raw.hide : defaultRightsideButtonsConfig.hide,
      show: Array.isArray(raw?.show) && raw.show.length ? raw.show : defaultRightsideButtonsConfig.show,
    }
  })

  const darkmodeConfig = computed(() => {
    const raw = (settings.value.darkmode as Record<string, unknown> | undefined) ?? {}
    const autoMode = raw.autoChangeMode
    const normalizedAutoMode = autoMode === false || autoMode === 'false'
      ? false
      : [1, 2].includes(Number(autoMode))
          ? Number(autoMode) as 1 | 2
          : false

    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : true,
      button: raw.button !== undefined ? Boolean(raw.button) : true,
      autoChangeMode: normalizedAutoMode,
      start: asNumber(raw.start, 18),
      end: asNumber(raw.end, 6),
    }
  })

  const translateConfig = computed(() => {
    const raw = (settings.value.translate as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      default: String(raw.default ?? '繁'),
      rightMenuMsgDefault: String(raw.rightMenuMsgDefault ?? ''),
      defaultEncoding: asNumber(raw.defaultEncoding, 2),
      translateDelay: asNumber(raw.translateDelay, 0),
      msgToTraditionalChinese: String(raw.msgToTraditionalChinese ?? '繁'),
      msgToSimplifiedChinese: String(raw.msgToSimplifiedChinese ?? '简'),
      rightMenuMsgToTraditionalChinese: String(raw.rightMenuMsgToTraditionalChinese ?? ''),
      rightMenuMsgToSimplifiedChinese: String(raw.rightMenuMsgToSimplifiedChinese ?? ''),
    }
  })

  const readmodeEnabled = computed(() => Boolean(settings.value.readmode))

  const centerConsole = computed(() => {
    const raw = (settings.value.centerConsole as Record<string, unknown> | undefined) ?? {}
    const cardTags = asRecord(raw.card_tags)
    const cardArchives = asRecord(raw.card_archives)
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      cardTags: {
        enable: cardTags.enable !== undefined ? Boolean(cardTags.enable) : true,
        limit: asNumber(cardTags.limit, 40),
        color: cardTags.color !== undefined ? Boolean(cardTags.color) : false,
        highlightTags: asStringArray(cardTags.highlightTags),
      },
      cardArchives: {
        enable: cardArchives.enable !== undefined ? Boolean(cardArchives.enable) : true,
        type: String(cardArchives.type ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly',
        format: String(cardArchives.format ?? 'MMMM YYYY'),
        order: asNumber(cardArchives.order, -1) >= 0 ? 1 : -1,
        limit: asNumber(cardArchives.limit, 8),
      },
    }
  })

  const snackbar = computed(() => {
    const raw = (settings.value.snackbar as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      position: String(raw.position ?? 'top-center'),
      bgLight: String(raw.bg_light ?? '#425AEF'),
      bgDark: String(raw.bg_dark ?? '#1f1f1f'),
    }
  })

  const rightClickMenu = computed<RightClickMenuConfig>(() => {
    const raw = (settings.value.rightClickMenu as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      home: raw.home !== undefined ? Boolean(raw.home) : true,
      archives: raw.archives !== undefined ? Boolean(raw.archives) : true,
      tags: raw.tags !== undefined ? Boolean(raw.tags) : true,
      categories: raw.categories !== undefined ? Boolean(raw.categories) : true,
      copyText: raw.copyText !== undefined ? Boolean(raw.copyText) : true,
      copyLink: raw.copyLink !== undefined ? Boolean(raw.copyLink) : true,
      copyImageUrl: raw.copyImageUrl !== undefined ? Boolean(raw.copyImageUrl) : true,
      viewImage: raw.viewImage !== undefined ? Boolean(raw.viewImage) : true,
      newTabImage: raw.newTabImage !== undefined ? Boolean(raw.newTabImage) : true,
      downloadImage: raw.downloadImage !== undefined ? Boolean(raw.downloadImage) : true,
      darkMode: raw.darkMode !== undefined ? Boolean(raw.darkMode) : true,
      backForward: raw.backForward !== undefined ? Boolean(raw.backForward) : true,
      print: raw.print !== undefined ? Boolean(raw.print) : true,
      readingMode: raw.readingMode !== undefined ? Boolean(raw.readingMode) : true,
    }
  })

  const displayEnhancements = computed(() => {
    const mermaid = (settings.value.mermaid as Record<string, unknown> | undefined) ?? {}
    const mermaidTheme = asRecord(mermaid.theme)
    const note = (settings.value.note as Record<string, unknown> | undefined) ?? {}
    const lazyload = (settings.value.lazyload as Record<string, unknown> | undefined) ?? {}
    const pangu = (settings.value.pangu as Record<string, unknown> | undefined) ?? {}
    const pjax = (settings.value.pjax as Record<string, unknown> | undefined) ?? {}
    const icons = (settings.value.icons as Record<string, unknown> | undefined) ?? {}

    return {
      mediumZoom: Boolean(settings.value.mediumZoom),
      fancybox: Boolean(settings.value.fancybox),
      instantpage: Boolean(settings.value.instantpage),
      mermaid: {
        enable: mermaid.enable !== undefined ? Boolean(mermaid.enable) : false,
        theme: {
          light: String(mermaidTheme.light ?? 'default'),
          dark: String(mermaidTheme.dark ?? 'dark'),
        },
      },
      note: {
        style: String(note.style ?? 'flat'),
        icons: note.icons !== undefined ? Boolean(note.icons) : true,
        borderRadius: asNumber(note.border_radius, 3),
        lightBgOffset: asNumber(note.light_bg_offset, 0),
      },
      lazyload: {
        enable: lazyload.enable !== undefined ? Boolean(lazyload.enable) : false,
        field: String(lazyload.field ?? 'site') === 'post' ? 'post' : 'site',
        placeholder: String(lazyload.placeholder ?? ''),
        blur: lazyload.blur !== undefined ? Boolean(lazyload.blur) : true,
        progressive: lazyload.progressive !== undefined ? Boolean(lazyload.progressive) : true,
      },
      pangu: {
        enable: pangu.enable !== undefined ? Boolean(pangu.enable) : false,
        field: String(pangu.field ?? 'site') === 'post' ? 'post' : 'site',
      },
      pjax: {
        enable: pjax.enable !== undefined ? Boolean(pjax.enable) : false,
        exclude: asStringArray(pjax.exclude),
      },
      icons: {
        aliIconfontJs: String(icons.ali_iconfont_js ?? ''),
        fontawesome: icons.fontawesome !== undefined ? Boolean(icons.fontawesome) : true,
        fontawesomeAnimationCss: String(icons.fontawesome_animation_css ?? ''),
      },
    }
  })

  const pwa = computed(() => {
    const raw = (settings.value.pwa as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      startupImageEnable: raw.startup_image_enable !== undefined ? Boolean(raw.startup_image_enable) : true,
      manifest: String(raw.manifest ?? '/api/pwa/manifest.webmanifest'),
      themeColor: String(raw.theme_color ?? 'var(--anzhiyu-main)'),
      maskIcon: String(raw.mask_icon ?? ''),
      appleTouchIcon: String(raw.apple_touch_icon ?? ''),
      bookmarkIcon: String(raw.bookmark_icon ?? ''),
      favicon32: String(raw.favicon_32_32 ?? ''),
      favicon16: String(raw.favicon_16_16 ?? ''),
    }
  })

  const mourn = computed<MournConfig>(() => {
    const raw = (settings.value.mourn as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultMournConfig.enable,
      days: Array.isArray(raw.days) ? raw.days.map(day => String(day)) : defaultMournConfig.days,
    }
  })

  const wordcount = computed<WordcountConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'wordcount') ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultWordcountConfig.enable,
      postWordcount: raw.postWordcount !== undefined
        ? Boolean(raw.postWordcount)
        : (raw.post_wordcount !== undefined ? Boolean(raw.post_wordcount) : defaultWordcountConfig.postWordcount),
      min2read: raw.min2read !== undefined ? Boolean(raw.min2read) : defaultWordcountConfig.min2read,
      totalWordcount: raw.totalWordcount !== undefined
        ? Boolean(raw.totalWordcount)
        : (raw.total_wordcount !== undefined ? Boolean(raw.total_wordcount) : defaultWordcountConfig.totalWordcount),
    }
  })

  const indexPostContent = computed<IndexPostContentConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'indexPostContent', 'index_post_content') ?? {}
    const methodValue = raw.method
    const normalizedMethod = methodValue === false || methodValue === 'false'
      ? false
      : [1, 2, 3].includes(Number(methodValue))
          ? Number(methodValue) as 1 | 2 | 3
          : defaultIndexPostContentConfig.method

    return {
      method: normalizedMethod,
      length: Number(raw.length) || defaultIndexPostContentConfig.length,
    }
  })

  const toc = computed<TocConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'toc') ?? {}
    return {
      post: raw.post !== undefined
        ? Boolean(raw.post)
        : (raw.enable !== undefined ? Boolean(raw.enable) : defaultTocConfig.post),
      page: raw.page !== undefined ? Boolean(raw.page) : defaultTocConfig.page,
      number: raw.number !== undefined ? Boolean(raw.number) : defaultTocConfig.number,
      expand: raw.expand !== undefined ? Boolean(raw.expand) : defaultTocConfig.expand,
      styleSimple: raw.styleSimple !== undefined
        ? Boolean(raw.styleSimple)
        : (raw.style_simple !== undefined ? Boolean(raw.style_simple) : defaultTocConfig.styleSimple),
    }
  })

  const postCopyright = computed<PostCopyrightConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'postCopyright', 'post_copyright') ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultPostCopyrightConfig.enable,
      decode: raw.decode !== undefined ? Boolean(raw.decode) : defaultPostCopyrightConfig.decode,
      authorHref: String(raw.authorHref ?? raw.author_href ?? defaultPostCopyrightConfig.authorHref),
      location: String(raw.location ?? defaultPostCopyrightConfig.location),
      license: String(raw.license ?? defaultPostCopyrightConfig.license),
      licenseUrl: String(raw.licenseUrl ?? raw.license_url ?? defaultPostCopyrightConfig.licenseUrl),
      avatarSinks: raw.avatarSinks !== undefined ? Boolean(raw.avatarSinks) : defaultPostCopyrightConfig.avatarSinks,
      copyrightAuthorLink: String(raw.copyrightAuthorLink ?? raw.copyright_author_link ?? defaultPostCopyrightConfig.copyrightAuthorLink),
    }
  })

  const reward = computed<RewardConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'reward') ?? {}
    const sourceList = Array.isArray(raw.qrCodes)
      ? raw.qrCodes
      : (Array.isArray(raw.QR_code) ? raw.QR_code : defaultRewardConfig.qrCodes)

    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultRewardConfig.enable,
      qrCodes: sourceList.map((item) => {
        const record = item as Record<string, unknown>
        return {
          img: String(record.img || ''),
          link: String(record.link || ''),
          text: String(record.text || ''),
        }
      }),
    }
  })

  const postEdit = computed<PostEditConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'postEdit', 'post_edit') ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultPostEditConfig.enable,
      github: raw.github === false ? false : String(raw.github || ''),
      yuque: raw.yuque === false ? false : String(raw.yuque || ''),
    }
  })

  const relatedPost = computed<RelatedPostConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'relatedPost', 'related_post') ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultRelatedPostConfig.enable,
      limit: Number(raw.limit) || defaultRelatedPostConfig.limit,
      dateType: raw.dateType === 'updated' || raw.date_type === 'updated' ? 'updated' : 'created',
    }
  })

  const photoFigcaption = computed<PhotoFigcaptionConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'photofigcaption') ?? {}
    return {
      enable: raw.enable !== undefined
        ? Boolean(raw.enable)
        : (Object.keys(raw).length > 0 ? true : defaultPhotoFigcaptionConfig.enable),
    }
  })

  const postPagination = computed<number | false>(() => {
    const raw = resolveAliasedSetting<string | number | boolean>(settings.value, 'postPagination', 'post_pagination')
    if (raw === false || raw === '' || raw === null || raw === undefined) {
      return false
    }
    const numeric = Number(raw)
    return [1, 2, 3, 4].includes(numeric) ? numeric : false
  })

  const noticeOutdate = computed<NoticeOutdateConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'noticeOutdate') ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultNoticeOutdateConfig.enable,
      style: raw.style === 'simple' ? 'simple' : defaultNoticeOutdateConfig.style,
      limitDay: Number(raw.limitDay ?? raw.limit_day) || defaultNoticeOutdateConfig.limitDay,
      position: raw.position === 'bottom' ? 'bottom' : defaultNoticeOutdateConfig.position,
      messagePrev: String(raw.messagePrev ?? raw.message_prev ?? defaultNoticeOutdateConfig.messagePrev),
      messageNext: String(raw.messageNext ?? raw.message_next ?? defaultNoticeOutdateConfig.messageNext),
    }
  })

  const anchor = computed<boolean>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown> | boolean>(settings.value, 'anchor')
    if (typeof raw === 'boolean') {
      return raw
    }
    if (raw && typeof raw === 'object' && 'enable' in raw) {
      return Boolean((raw as Record<string, unknown>).enable)
    }
    return false
  })

  const sharejs = computed<ShareJsConfig>(() => {
    const raw = resolveAliasedSetting<Record<string, unknown>>(settings.value, 'sharejs') ?? {}
    const sitesValue = raw.sites
    const sites = Array.isArray(sitesValue)
      ? sitesValue.map(item => String(item).trim()).filter(Boolean)
      : String(sitesValue ?? defaultShareJsConfig.sites.join(','))
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)

    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultShareJsConfig.enable,
      sites: sites.length ? sites : defaultShareJsConfig.sites,
    }
  })

  const ptool = computed<PToolConfig>(() => {
    const raw = (settings.value.ptool as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultPToolConfig.enable,
      shareMobile: raw.shareMobile !== undefined ? Boolean(raw.shareMobile) : Boolean(raw.share_mobile ?? defaultPToolConfig.shareMobile),
      shareWeibo: raw.shareWeibo !== undefined ? Boolean(raw.shareWeibo) : Boolean(raw.share_weibo ?? defaultPToolConfig.shareWeibo),
      shareCopyurl: raw.shareCopyurl !== undefined ? Boolean(raw.shareCopyurl) : Boolean(raw.share_copyurl ?? defaultPToolConfig.shareCopyurl),
      categories: raw.categories !== undefined ? Boolean(raw.categories) : defaultPToolConfig.categories,
      mode: String(raw.mode ?? defaultPToolConfig.mode),
    }
  })

  function normalizeChatService(raw: Record<string, unknown> | undefined, field: 'id' | 'publicKey' | 'appId' | 'websiteId'): ChatServiceConfig {
    return {
      ...defaultChatServiceConfig,
      enable: raw?.enable !== undefined ? Boolean(raw.enable) : defaultChatServiceConfig.enable,
      id: field === 'id' ? String(raw?.id ?? '') : '',
      publicKey: field === 'publicKey' ? String(raw?.publicKey ?? raw?.public_key ?? '') : '',
      appId: field === 'appId' ? String(raw?.appId ?? raw?.app_id ?? '') : '',
      websiteId: field === 'websiteId' ? String(raw?.websiteId ?? raw?.website_id ?? '') : '',
    }
  }

  const chatTools = computed<ChatToolsConfig>(() => ({
    chatBtn: Boolean(resolveAliasedSetting(settings.value, 'chatBtn', 'chat_btn') ?? defaultChatToolsConfig.chatBtn),
    chatHideShow: Boolean(resolveAliasedSetting(settings.value, 'chatHideShow', 'chat_hide_show') ?? defaultChatToolsConfig.chatHideShow),
    chatra: normalizeChatService((settings.value.chatra as Record<string, unknown> | undefined), 'id'),
    tidio: normalizeChatService((settings.value.tidio as Record<string, unknown> | undefined), 'publicKey'),
    daovoice: normalizeChatService((settings.value.daovoice as Record<string, unknown> | undefined), 'appId'),
    crisp: normalizeChatService((settings.value.crisp as Record<string, unknown> | undefined), 'websiteId'),
  }))

  const postMetaPage = computed<PostMetaSectionConfig>(() => ({
    ...defaultPostMetaSectionConfig,
    ...((settings.value.postMetaPage as PostMetaSectionConfig | undefined) ?? {}),
  }))

  const postMetaPost = computed<PostMetaSectionConfig>(() => ({
    ...defaultPostMetaConfig.post,
    ...((settings.value.postMetaPost as PostMetaSectionConfig | undefined) ?? {}),
  }))

  const postMeta = computed<PostMetaConfig>(() => ({
    page: postMetaPage.value,
    post: postMetaPost.value,
  }))

  const mainTone = computed<MainToneConfig>(() => ({
    ...defaultMainToneConfig,
    ...((settings.value.mainTone as MainToneConfig | undefined) ?? {}),
  }))

  const displayMode = computed<'light' | 'dark'>(() => {
    const raw = String(settings.value.displayMode ?? settings.value.display_mode ?? 'light').trim().toLowerCase()
    return raw === 'dark' ? 'dark' : 'light'
  })

  const diytitle = computed<DiyTitleConfig>(() => {
    const raw = (settings.value.diytitle as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultDiyTitleConfig.enable,
      leaveTitle: String(raw.leaveTitle ?? defaultDiyTitleConfig.leaveTitle),
      backTitle: String(raw.backTitle ?? defaultDiyTitleConfig.backTitle),
    }
  })

  const consoleLog = computed<ConsoleLogConfig>(() => {
    const raw = (settings.value.consoleLog as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultConsoleLogConfig.enable,
    }
  })

  const laConfig = computed<LAConfig>(() => {
    const raw = ((settings.value.LA ?? settings.value.la51) as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultLAConfig.enable,
      ck: String(raw.ck ?? defaultLAConfig.ck),
      LingQueMonitorID: String(raw.LingQueMonitorID ?? defaultLAConfig.LingQueMonitorID),
    }
  })

  const umami = computed<UmamiConfig>(() => {
    const raw = (settings.value.umami as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : defaultUmamiConfig.enable,
      apiHost: String(raw.apiHost ?? defaultUmamiConfig.apiHost),
      websiteId: String(raw.websiteId ?? defaultUmamiConfig.websiteId),
      token: String(raw.token ?? defaultUmamiConfig.token),
    }
  })

  const themeFont = computed(() => {
    const raw = (settings.value.font as Record<string, unknown> | undefined) ?? {}
    return {
      globalFontSize: String(raw.globalFontSize ?? raw['global-font-size'] ?? '16px'),
      codeFontSize: String(raw.codeFontSize ?? raw['code-font-size'] ?? ''),
      fontFamily: String(raw.fontFamily ?? raw['font-family'] ?? ''),
      codeFontFamily: String(raw.codeFontFamily ?? raw['code-font-family'] ?? ''),
    }
  })

  const blogTitleFont = computed(() => {
    const raw = (settings.value.blogTitleFont as Record<string, unknown> | undefined) ?? {}
    return {
      fontLink: String(raw.fontLink ?? raw.font_link ?? ''),
      fontFamily: String(raw.fontFamily ?? raw['font-family'] ?? ''),
    }
  })

  const hrIcon = computed(() => {
    const raw = (settings.value.hrIcon as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : true,
      icon: String(raw.icon ?? '\\f0c4'),
      iconTop: String(raw.iconTop ?? raw['icon-top'] ?? ''),
    }
  })

  const beautify = computed(() => {
    const raw = (settings.value.beautify as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      field: String(raw.field ?? 'post') === 'site' ? 'site' : 'post',
      titlePrefixIcon: String(raw.titlePrefixIcon ?? raw['title-prefix-icon'] ?? '\\f0c1'),
      titlePrefixIconColor: String(raw.titlePrefixIconColor ?? raw['title-prefix-icon-color'] ?? '#F47466'),
    }
  })

  const homeSubtitle = computed(() => {
    const raw = ((settings.value.subtitle ?? settings.value.homeSubtitle) as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      effect: raw.effect !== undefined ? Boolean(raw.effect) : true,
      startDelay: asNumber(raw.startDelay, 300),
      typeSpeed: asNumber(raw.typeSpeed, 150),
      backSpeed: asNumber(raw.backSpeed, 50),
      loop: raw.loop !== undefined ? Boolean(raw.loop) : true,
      source: String(raw.source ?? '0'),
      sub: asStringArray(raw.sub),
    }
  })

  const preloader = computed(() => {
    const raw = (settings.value.preloader as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : true,
      source: asNumber(raw.source, 3),
      paceCssUrl: String(raw.paceCssUrl ?? raw.pace_css_url ?? ''),
      avatar: String(raw.avatar ?? ''),
    }
  })

  const busuanzi = computed(() => {
    const raw = (settings.value.busuanzi as Record<string, unknown> | undefined) ?? {}
    return {
      siteUv: raw.siteUv !== undefined ? Boolean(raw.siteUv) : Boolean(raw.site_uv),
      sitePv: raw.sitePv !== undefined ? Boolean(raw.sitePv) : Boolean(raw.site_pv),
      pagePv: raw.pagePv !== undefined ? Boolean(raw.pagePv) : Boolean(raw.page_pv),
    }
  })

  const runtimeShow = computed(() => {
    const raw = (settings.value.runtimeShow as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      publishDate: String(raw.publishDate ?? raw.publish_date ?? ''),
    }
  })

  const newestComments = computed(() => {
    const raw = (settings.value.newestComments as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      limit: asNumber(raw.limit, 6),
      storage: asNumber(raw.storage, 10),
      avatar: raw.avatar !== undefined ? Boolean(raw.avatar) : true,
    }
  })

  const clickShowText = computed(() => {
    const raw = (settings.value.clickShowText as Record<string, unknown> | undefined) ?? {}
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : false,
      text: asStringArray(raw.text),
      fontSize: String(raw.fontSize ?? '15px'),
      random: raw.random !== undefined ? Boolean(raw.random) : false,
      mobile: raw.mobile !== undefined ? Boolean(raw.mobile) : false,
    }
  })

  const interactionEffects = computed(() => {
    const fireworksRaw = (settings.value.fireworks as Record<string, unknown> | undefined) ?? {}
    const clickHeartRaw = (settings.value.clickHeart as Record<string, unknown> | undefined) ?? {}
    const activatePowerModeRaw = (settings.value.activatePowerMode as Record<string, unknown> | undefined) ?? {}

    return {
      fireworks: {
        enable: fireworksRaw.enable !== undefined ? Boolean(fireworksRaw.enable) : false,
        zIndex: asNumber(fireworksRaw.zIndex, 9999),
        mobile: fireworksRaw.mobile !== undefined ? Boolean(fireworksRaw.mobile) : false,
      },
      clickHeart: {
        enable: clickHeartRaw.enable !== undefined ? Boolean(clickHeartRaw.enable) : false,
        mobile: clickHeartRaw.mobile !== undefined ? Boolean(clickHeartRaw.mobile) : false,
      },
      activatePowerMode: {
        enable: activatePowerModeRaw.enable !== undefined ? Boolean(activatePowerModeRaw.enable) : false,
        colorful: activatePowerModeRaw.colorful !== undefined ? Boolean(activatePowerModeRaw.colorful) : true,
        shake: activatePowerModeRaw.shake !== undefined ? Boolean(activatePowerModeRaw.shake) : false,
        mobile: activatePowerModeRaw.mobile !== undefined ? Boolean(activatePowerModeRaw.mobile) : false,
      },
      clickShowText: clickShowText.value,
    }
  })

  const aside = computed(() => {
    const raw = (settings.value.aside as Record<string, unknown> | undefined) ?? {}
    const display = asRecord(raw.display)
    return {
      enable: raw.enable !== undefined ? Boolean(raw.enable) : true,
      hide: raw.hide !== undefined ? Boolean(raw.hide) : false,
      button: raw.button !== undefined ? Boolean(raw.button) : true,
      mobile: raw.mobile !== undefined ? Boolean(raw.mobile) : true,
      position: String(raw.position || 'right') === 'left' ? 'left' : 'right',
      display: {
        archive: display.archive !== undefined ? Boolean(display.archive) : true,
        tag: display.tag !== undefined ? Boolean(display.tag) : true,
        category: display.category !== undefined ? Boolean(display.category) : true,
      },
    }
  })

  const sidebarCards = computed(() => {
    const author = (settings.value.cardAuthor as Record<string, unknown> | undefined) ?? {}
    const announcement = (settings.value.cardAnnouncement as Record<string, unknown> | undefined) ?? {}
    const recentPost = (settings.value.cardRecentPost as Record<string, unknown> | undefined) ?? {}
    const categories = (settings.value.cardCategories as Record<string, unknown> | undefined) ?? {}
    const tags = (settings.value.cardTags as Record<string, unknown> | undefined) ?? {}
    const archives = (settings.value.cardArchives as Record<string, unknown> | undefined) ?? {}
    const webinfo = (settings.value.cardWebinfo as Record<string, unknown> | undefined) ?? {}
    const weixin = (settings.value.cardWeixin as Record<string, unknown> | undefined) ?? {}

    return {
      author: {
        enable: author.enable !== undefined ? Boolean(author.enable) : true,
        description: String(author.description ?? ''),
        nameLink: String(author.nameLink ?? author.name_link ?? '/'),
      },
      announcement: {
        enable: announcement.enable !== undefined ? Boolean(announcement.enable) : false,
        content: String(announcement.content ?? ''),
      },
      recentPost: {
        enable: recentPost.enable !== undefined ? Boolean(recentPost.enable) : true,
        limit: asNumber(recentPost.limit, 5),
        sort: String(recentPost.sort ?? 'date') === 'updated' ? 'updated' : 'date',
      },
      categories: {
        enable: categories.enable !== undefined ? Boolean(categories.enable) : false,
        limit: asNumber(categories.limit, 8),
        expand: String(categories.expand ?? 'none'),
      },
      tags: {
        enable: tags.enable !== undefined ? Boolean(tags.enable) : true,
        limit: asNumber(tags.limit, 40),
        color: tags.color !== undefined ? Boolean(tags.color) : false,
        highlightTags: asStringArray(tags.highlightTags),
      },
      archives: {
        enable: archives.enable !== undefined ? Boolean(archives.enable) : true,
        type: String(archives.type ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly',
        format: String(archives.format ?? 'MMMM YYYY'),
        order: asNumber(archives.order, -1) >= 0 ? 1 : -1,
        limit: asNumber(archives.limit, 8),
      },
      webinfo: {
        enable: webinfo.enable !== undefined ? Boolean(webinfo.enable) : true,
        postCount: webinfo.postCount !== undefined ? Boolean(webinfo.postCount) : Boolean(webinfo.post_count ?? true),
        lastPushDate: webinfo.lastPushDate !== undefined ? Boolean(webinfo.lastPushDate) : Boolean(webinfo.last_push_date),
      },
      weixin: {
        enable: weixin.enable !== undefined ? Boolean(weixin.enable) : false,
        face: String(weixin.face ?? ''),
        backFace: String(weixin.backFace ?? weixin.back_face ?? ''),
      },
      newestComments: newestComments.value,
      runtimeShow: runtimeShow.value,
    }
  })

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    announcement,
    nav,
    menuGroups,
    comments,
    twikoo: computed(() => comments.value.twikoo),
    valine,
    waline,
    artalk,
    giscus,
    visitorMail,
    commentBarrage,
    greetingBox,
    navMusic,
    musicPlayer,
    friendsVue,
    addtoany,
    codeBlock,
    copySettings,
    search,
    localSearch,
    algoliaSearch,
    docsearch,
    math,
    mathjax,
    katex,
    profile,
    authorStatus,
    social,
    sidebar,
    wechat,
    footer,
    homepage,
    wordcount,
    indexPostContent,
    toc,
    postCopyright,
    reward,
    postEdit,
    relatedPost,
    photoFigcaption,
    postPagination,
    noticeOutdate,
    anchor,
    sharejs,
    ptool,
    chatTools,
    postMeta,
    postMetaPage,
    postMetaPost,
    mainTone,
    errorPage,
    errorImage,
    rightsideButtons,
    mourn,
    displayMode,
    diytitle,
    consoleLog,
    themeFont,
    blogTitleFont,
    hrIcon,
    beautify,
    homeSubtitle,
    preloader,
    busuanzi,
    runtimeShow,
    newestComments,
    clickShowText,
    interactionEffects,
    aside,
    sidebarCards,
    darkmodeConfig,
    translateConfig,
    readmodeEnabled,
    centerConsole,
    laConfig,
    umami,
    snackbar,
    rightClickMenu,
    displayEnhancements,
    pwa,
    refresh,
  }
}
