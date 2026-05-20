export interface AnnouncementConfig {
  text: string
  icon: string
}

export interface NavMenuItem {
  name: string
  link: string
  icon: string
}

export interface NavMenuGroup {
  title: string
  item: NavMenuItem[]
}

export interface NavConfig {
  enable: boolean
  travelling: boolean
  clock: boolean
  console: boolean
  menu: NavMenuGroup[]
}

export interface CodeBlockConfig {
  highlightTheme: string
  highlightCopy: boolean
  highlightLang: boolean
  highlightShrink: boolean | 'none'
  highlightHeightLimit: number
  codeWordWrap: boolean
}

export interface CopySettingsConfig {
  enable: boolean
  copyrightEnable: boolean
  copyrightLimitCount: number
}

export interface SearchConfig {
  provider: '' | 'local' | 'algolia' | 'docsearch'
}

export interface LocalSearchConfig {
  enable: boolean
  preload: boolean
  CDN?: string
}

export interface AlgoliaSearchConfig {
  enable: boolean
  appId?: string
  apiKey?: string
  indexName?: string
  perPage: number
  tags: string[]
}

export interface DocsearchConfig {
  enable: boolean
  appId: string
  apiKey: string
  indexName: string
  option?: Record<string, unknown>
}

export interface MathConfig {
  provider: '' | 'mathjax' | 'katex'
}

export interface MathJaxConfig {
  enable: boolean
  perPage: boolean
}

export interface KaTeXConfig {
  enable: boolean
  perPage: boolean
  hideScrollbar: boolean
}

export interface TwikooConfig {
  envId: string
  region: string
  visitor?: boolean
  option?: Record<string, unknown>
}

export interface ValineConfig {
  appId: string
  appKey: string
  pageSize: number
  avatar: string
  lang: string
  placeholder: string
  guestInfo: string
  recordIP: boolean
  serverURLs: string
  bg: string
  emojiCDN: string
  enableQQ: boolean
  requiredFields: string
  visitor: boolean
  master: string[]
  friends: string[]
  tagMeta: string
  option?: Record<string, unknown>
}

export interface WalineConfig {
  serverURL: string
  bg: string
  pageview: boolean
  metaCss: boolean
  imageUploader: boolean
  option?: Record<string, unknown>
}

export interface ArtalkConfig {
  server: string
  site: string
  visitor: boolean
  option?: Record<string, unknown>
}

export interface GiscusConfig {
  repo: string
  repoId: string
  categoryId: string
  theme: {
    light: string
    dark: string
  }
  option: {
    lang: string
    mapping: string
    category: string
    inputPosition: string
  }
}

export interface VisitorMailConfig {
  enable: boolean
  mail: string
}

export interface CommentBarrageConfig {
  enable: boolean
  maxBarrage: number
  barrageTime: number
  accessToken: string
  mailMd5: string
}

export interface GreetingBoxConfig {
  enable: boolean
  default: string
  list: Array<{
    greeting: string
    startTime: number
    endTime: number
  }>
}

export interface NavMusicConfig {
  enable: boolean
  consoleWidescreenMusic: boolean
  id: string
  server: string
  volume: number
  allPlaylist: string
}

export interface FriendsVueConfig {
  enable: boolean
  vueJs: string
  apiurl: string
  topTips: string
  topBackground: string
}

export interface DiyTitleConfig {
  enable: boolean
  leaveTitle: string
  backTitle: string
}

export interface ConsoleLogConfig {
  enable: boolean
}

export interface LAConfig {
  enable: boolean
  ck: string
  LingQueMonitorID: string
}

export interface UmamiConfig {
  enable: boolean
  apiHost: string
  websiteId: string
  token: string
}

export interface PToolConfig {
  enable: boolean
  shareMobile: boolean
  shareWeibo: boolean
  shareCopyurl: boolean
  categories: boolean
  mode: string
}

export interface CommentsConfig {
  use?: string
  text?: boolean
  lazyload?: boolean
  count?: boolean
  cardPostCount?: boolean
  twikoo: TwikooConfig
}

export interface AddToAnyConfig {
  enable: boolean
  item: string[]
}

export interface ChatServiceConfig {
  enable: boolean
  id?: string
  publicKey?: string
  appId?: string
  websiteId?: string
}

export interface ChatToolsConfig {
  chatBtn: boolean
  chatHideShow: boolean
  chatra: ChatServiceConfig
  tidio: ChatServiceConfig
  daovoice: ChatServiceConfig
  crisp: ChatServiceConfig
}

export interface ProfileConfig {
  authorName: string
  avatar: string
  avatarEffect: boolean
  description: string
}

export interface AuthorStatusConfig {
  enable: boolean
  statusImg: string
  skills: string[]
}

export interface SocialLink {
  name?: string
  url: string
  icon?: string
}

export interface SidebarConfig {
  enabled?: boolean
  widgets: string[]
}

export interface WechatConfig {
  qrcode: string
  description: string
}

export interface SocialBarLink {
  link: string
  title: string
  icon: string
}

export interface FooterLinkItem {
  title: string
  link: string
}

export interface FooterLinkGroup {
  title: string
  links: FooterLinkItem[]
}

export interface FooterConfig {
  socialBar: {
    enable: boolean
    centerImg?: string
    left: SocialBarLink[]
    right: SocialBarLink[]
  }
  owner: {
    enable: boolean
    since?: number
  }
  runtime: {
    enable: boolean
    launch_time?: string
    work_img?: string
    work_description?: string
    offduty_img?: string
    offduty_description?: string
  }
  list: {
    enable: boolean
    project: FooterLinkGroup[]
    randomFriends?: number
  }
  bdageitem: {
    enable: boolean
    list: Array<{ link: string, shields: string, message: string }>
  }
  footerBar: {
    enable: boolean
    linkList: Array<{ link: string, text: string }>
    cc: { enable: boolean, link?: string }
    subTitle: {
      enable: boolean
      effect?: boolean
      startDelay?: number
      typeSpeed?: number
      backSpeed?: number
      loop?: boolean
      source?: string
      sub?: string[]
    }
    authorLink?: string
  }
  custom_text?: string
}

export interface ErrorPageConfig {
  enable: boolean
  subtitle: string
  background: string
}

export interface ErrorImageConfig {
  flink: string
  post_page: string
}

export interface RightsideButtonsConfig {
  hide: string[]
  show: string[]
  enableOrder?: boolean
}

export interface PeopleCanvasConfig {
  enable: boolean
  img: string
}

export interface LinkPageTopConfig {
  enable: boolean
  title: string
  addFriendPlaceholder: string
}

export interface TopImageConfig {
  disableTopImg: boolean
  indexImg: string
  defaultTopImg: string
  siteInfoTop: string
  topImgHeight: string
}

export interface MournConfig {
  enable: boolean
  days: string[]
}

export interface WordcountConfig {
  enable: boolean
  postWordcount: boolean
  min2read: boolean
  totalWordcount: boolean
}

export interface IndexPostContentConfig {
  method: 1 | 2 | 3 | false
  length: number
}

export interface TocConfig {
  post: boolean
  page: boolean
  number: boolean
  expand: boolean
  styleSimple: boolean
}

export interface PostCopyrightConfig {
  enable: boolean
  decode: boolean
  authorHref: string
  location: string
  license: string
  licenseUrl: string
  avatarSinks: boolean
  copyrightAuthorLink: string
}

export interface RewardQrcodeItem {
  img: string
  link: string
  text: string
}

export interface RewardConfig {
  enable: boolean
  qrCodes: RewardQrcodeItem[]
}

export interface PostEditConfig {
  enable: boolean
  github: string | false
  yuque: string | false
}

export interface RelatedPostConfig {
  enable: boolean
  limit: number
  dateType: 'created' | 'updated'
}

export interface PhotoFigcaptionConfig {
  enable: boolean
}

export interface NoticeOutdateConfig {
  enable: boolean
  style: 'simple' | 'flat'
  limitDay: number
  position: 'top' | 'bottom'
  messagePrev: string
  messageNext: string
}

export interface ShareJsConfig {
  enable: boolean
  sites: string[]
}

export interface PostMetaSectionConfig {
  dateType: 'created' | 'updated' | 'both'
  dateFormat: 'date' | 'relative' | 'simple'
  categories: boolean
  tags: boolean
  label: boolean
  unread?: boolean
}

export interface PostMetaConfig {
  page: PostMetaSectionConfig
  post: PostMetaSectionConfig
}

export interface MainToneConfig {
  enable: boolean
  mode: 'api' | 'cdn' | 'colorthief' | 'both'
  api: string
  coverChange: boolean
}

export interface HomepageConfig {
  enabled: boolean
  title: string
  subTitle: string
  siteText: string
  swiperEnabled: boolean
  coverPosition: 'left' | 'right' | 'both'
  coverEnabled: boolean
  doubleRow: boolean
  pageSize: number
  categories: Array<{
    name: string
    path: string
    icon?: string
    shadow?: string
    bgColor?: string
    cls?: string
  }>
  todayCard: {
    tips: string
    title: string
    image: string
    link: string
  }
  sidebarEnabled: boolean
  sidebarWidgets: string[]
  skills: Array<{
    name: string
    icon: string
    color: string
  }>
  peopleCanvas: PeopleCanvasConfig
  linkPageTop: LinkPageTopConfig
  pageThumbnailSuffix: string
  topImage: TopImageConfig
  defaultCovers: string[]
}

export type SiteSettingsMap = Record<string, unknown> & {
  announcement?: AnnouncementConfig
  nav?: NavConfig
  comments?: CommentsConfig
  profile?: ProfileConfig
  author_status?: AuthorStatusConfig
  social?: SocialLink[]
  sidebar?: SidebarConfig
  wechat?: WechatConfig
  addtoany?: AddToAnyConfig
  footer?: FooterConfig
  codeBlock?: CodeBlockConfig
  copySettings?: CopySettingsConfig
  search?: SearchConfig
  localSearch?: LocalSearchConfig
  algoliaSearch?: AlgoliaSearchConfig
  docsearch?: DocsearchConfig
  math?: MathConfig
  mathjax?: MathJaxConfig
  katex?: KaTeXConfig
  valine?: Partial<ValineConfig>
  waline?: Partial<WalineConfig>
  artalk?: Partial<ArtalkConfig>
  giscus?: Partial<GiscusConfig>
  chatra?: Partial<ChatServiceConfig>
  tidio?: Partial<ChatServiceConfig>
  daovoice?: Partial<ChatServiceConfig>
  crisp?: Partial<ChatServiceConfig>
  chat_btn?: boolean
  chatBtn?: boolean
  chat_hide_show?: boolean
  chatHideShow?: boolean
  rightsideItems?: RightsideButtonsConfig
  peoplecanvas?: PeopleCanvasConfig
  linkPageTop?: LinkPageTopConfig
  topImage?: TopImageConfig
  pageThumbnailSuffix?: string
  mainTone?: MainToneConfig
  wordcount?: WordcountConfig
  index_post_content?: Partial<IndexPostContentConfig>
  indexPostContent?: Partial<IndexPostContentConfig>
  toc?: Partial<TocConfig>
  post_copyright?: Partial<PostCopyrightConfig>
  postCopyright?: Partial<PostCopyrightConfig>
  reward?: Partial<RewardConfig>
  post_edit?: Partial<PostEditConfig>
  postEdit?: Partial<PostEditConfig>
  related_post?: Partial<RelatedPostConfig>
  relatedPost?: Partial<RelatedPostConfig>
  photofigcaption?: Partial<PhotoFigcaptionConfig>
  noticeOutdate?: Partial<NoticeOutdateConfig>
  sharejs?: Partial<ShareJsConfig>
  visitorMail?: Partial<VisitorMailConfig>
  commentBarrage?: Partial<CommentBarrageConfig>
  greetingBox?: Partial<GreetingBoxConfig>
  navMusic?: Partial<NavMusicConfig>
  friendsVue?: Partial<FriendsVueConfig>
  diytitle?: Partial<DiyTitleConfig>
  consoleLog?: Partial<ConsoleLogConfig>
  LA?: Partial<LAConfig>
  umami?: Partial<UmamiConfig>
  ptool?: Partial<PToolConfig>
  postMetaPage?: PostMetaSectionConfig
  postMetaPost?: PostMetaSectionConfig
  error_404?: ErrorPageConfig
  error_img?: ErrorImageConfig
  mourn?: MournConfig
}

export const defaultAnnouncement: AnnouncementConfig = {
  text: '欢迎来到我的博客',
  icon: 'anzhiyu-icon-bullhorn',
}

export const defaultNavConfig: NavConfig = {
  enable: false,
  travelling: false,
  clock: false,
  console: false,
  menu: [],
}

export const defaultCodeBlockConfig: CodeBlockConfig = {
  highlightTheme: 'light',
  highlightCopy: true,
  highlightLang: true,
  highlightShrink: false,
  highlightHeightLimit: 330,
  codeWordWrap: false,
}

export const defaultCopySettingsConfig: CopySettingsConfig = {
  enable: true,
  copyrightEnable: false,
  copyrightLimitCount: 50,
}

export const defaultSearchConfig: SearchConfig = {
  provider: '',
}

export const defaultLocalSearchConfig: LocalSearchConfig = {
  enable: false,
  preload: true,
  CDN: '',
}

export const defaultAlgoliaSearchConfig: AlgoliaSearchConfig = {
  enable: false,
  appId: '',
  apiKey: '',
  indexName: '',
  perPage: 6,
  tags: [],
}

export const defaultDocsearchConfig: DocsearchConfig = {
  enable: false,
  appId: '',
  apiKey: '',
  indexName: '',
  option: {},
}

export const defaultMathConfig: MathConfig = {
  provider: '',
}

export const defaultMathJaxConfig: MathJaxConfig = {
  enable: false,
  perPage: false,
}

export const defaultKaTeXConfig: KaTeXConfig = {
  enable: false,
  perPage: false,
  hideScrollbar: true,
}

export const defaultCommentsConfig: CommentsConfig = {
  use: '',
  text: true,
  lazyload: false,
  count: false,
  cardPostCount: false,
  twikoo: {
    envId: '',
    region: '',
  },
}

export const defaultValineConfig: ValineConfig = {
  appId: '',
  appKey: '',
  pageSize: 10,
  avatar: 'mp',
  lang: 'zh-CN',
  placeholder: '填写昵称和邮箱后会自动匹配头像。',
  guestInfo: 'nick,mail,link',
  recordIP: false,
  serverURLs: '',
  bg: '',
  emojiCDN: '//i0.hdslb.com/bfs/emote/',
  enableQQ: true,
  requiredFields: 'nick,mail',
  visitor: false,
  master: [],
  friends: [],
  tagMeta: '博主,小伙伴,访客',
  option: {},
}

export const defaultWalineConfig: WalineConfig = {
  serverURL: '',
  bg: '',
  pageview: false,
  metaCss: false,
  imageUploader: true,
  option: {},
}

export const defaultArtalkConfig: ArtalkConfig = {
  server: '',
  site: '',
  visitor: false,
  option: {},
}

export const defaultGiscusConfig: GiscusConfig = {
  repo: '',
  repoId: '',
  categoryId: '',
  theme: {
    light: 'light',
    dark: 'dark',
  },
  option: {
    lang: 'zh-CN',
    mapping: '',
    category: '',
    inputPosition: '',
  },
}

export const defaultVisitorMailConfig: VisitorMailConfig = {
  enable: true,
  mail: '',
}

export const defaultCommentBarrageConfig: CommentBarrageConfig = {
  enable: false,
  maxBarrage: 1,
  barrageTime: 4000,
  accessToken: '',
  mailMd5: '',
}

export const defaultGreetingBoxConfig: GreetingBoxConfig = {
  enable: false,
  default: '晚上好，欢迎来到这里。',
  list: [],
}

export const defaultNavMusicConfig: NavMusicConfig = {
  enable: true,
  consoleWidescreenMusic: false,
  id: '',
  server: 'netease',
  volume: 0.7,
  allPlaylist: '',
}

export const defaultFriendsVueConfig: FriendsVueConfig = {
  enable: false,
  vueJs: 'https://npm.elemecdn.com/anzhiyu-theme-static@1.1.1/friends/index.4f887d95.js',
  apiurl: '',
  topTips: '',
  topBackground: '',
}

export const defaultDiyTitleConfig: DiyTitleConfig = {
  enable: true,
  leaveTitle: '',
  backTitle: '',
}

export const defaultConsoleLogConfig: ConsoleLogConfig = {
  enable: true,
}

export const defaultLAConfig: LAConfig = {
  enable: false,
  ck: '',
  LingQueMonitorID: '',
}

export const defaultUmamiConfig: UmamiConfig = {
  enable: false,
  apiHost: '',
  websiteId: '',
  token: '',
}

export const defaultPToolConfig: PToolConfig = {
  enable: true,
  shareMobile: true,
  shareWeibo: true,
  shareCopyurl: true,
  categories: false,
  mode: '',
}

export const defaultAddToAnyConfig: AddToAnyConfig = {
  enable: false,
  item: ['facebook', 'twitter', 'wechat', 'sina_weibo', 'email', 'copy_link'],
}

export const defaultChatServiceConfig: ChatServiceConfig = {
  enable: false,
  id: '',
  publicKey: '',
  appId: '',
  websiteId: '',
}

export const defaultChatToolsConfig: ChatToolsConfig = {
  chatBtn: false,
  chatHideShow: false,
  chatra: { ...defaultChatServiceConfig },
  tidio: { ...defaultChatServiceConfig },
  daovoice: { ...defaultChatServiceConfig },
  crisp: { ...defaultChatServiceConfig },
}

export const defaultProfileConfig: ProfileConfig = {
  authorName: '',
  avatar: '',
  avatarEffect: false,
  description: '生活明朗，万物可爱。',
}

export const defaultAuthorStatusConfig: AuthorStatusConfig = {
  enable: false,
  statusImg: '',
  skills: [],
}

export const defaultSidebarConfig: SidebarConfig = {
  enabled: true,
  widgets: ['profile', 'stats', 'tags', 'categories', 'recent'],
}

export const defaultWechatConfig: WechatConfig = {
  qrcode: '',
  description: '扫一扫赞赏',
}

export const defaultRightsideButtonsConfig: RightsideButtonsConfig = {
  enableOrder: false,
  hide: [],
  show: ['readmode', 'darkmode', 'hide-aside-btn', 'mobile-toc-button', 'to_comment', 'go-up'],
}

export const defaultTopImageConfig: TopImageConfig = {
  disableTopImg: false,
  indexImg: '',
  defaultTopImg: '',
  siteInfoTop: '',
  topImgHeight: '',
}

export const defaultPostMetaSectionConfig: PostMetaSectionConfig = {
  dateType: 'created',
  dateFormat: 'simple',
  categories: true,
  tags: true,
  label: false,
  unread: false,
}

export const defaultPostMetaConfig: PostMetaConfig = {
  page: defaultPostMetaSectionConfig,
  post: {
    ...defaultPostMetaSectionConfig,
    dateType: 'both',
    dateFormat: 'date',
    label: true,
    unread: false,
  },
}

export const defaultMainToneConfig: MainToneConfig = {
  enable: false,
  mode: 'api',
  api: '',
  coverChange: true,
}

export const defaultHomepageConfig: HomepageConfig = {
  enabled: true,
  title: '安知鱼',
  subTitle: 'AnZhiYu',
  siteText: '生活明朗，万物可爱。',
  swiperEnabled: true,
  coverPosition: 'left',
  coverEnabled: true,
  doubleRow: true,
  pageSize: 10,
  categories: [],
  todayCard: {
    tips: '今日推荐',
    title: '查看更多',
    image: '',
    link: '/',
  },
  sidebarEnabled: true,
  sidebarWidgets: ['profile', 'stats', 'tags', 'categories', 'recent'],
  skills: [],
  peopleCanvas: {
    enable: true,
    img: '',
  },
  linkPageTop: {
    enable: false,
    title: '',
    addFriendPlaceholder: '',
  },
  pageThumbnailSuffix: '',
  topImage: defaultTopImageConfig,
  defaultCovers: [],
}

export const defaultErrorPageConfig: ErrorPageConfig = {
  enable: true,
  subtitle: '请尝试站内搜索寻找文章',
  background: '',
}

export const defaultErrorImageConfig: ErrorImageConfig = {
  flink: '',
  post_page: '',
}

export const defaultMournConfig: MournConfig = {
  enable: false,
  days: [],
}

export const defaultWordcountConfig: WordcountConfig = {
  enable: false,
  postWordcount: true,
  min2read: true,
  totalWordcount: true,
}

export const defaultIndexPostContentConfig: IndexPostContentConfig = {
  method: 3,
  length: 500,
}

export const defaultTocConfig: TocConfig = {
  post: true,
  page: false,
  number: true,
  expand: false,
  styleSimple: false,
}

export const defaultPostCopyrightConfig: PostCopyrightConfig = {
  enable: true,
  decode: false,
  authorHref: '/',
  location: '',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  avatarSinks: false,
  copyrightAuthorLink: '/',
}

export const defaultRewardConfig: RewardConfig = {
  enable: false,
  qrCodes: [],
}

export const defaultPostEditConfig: PostEditConfig = {
  enable: false,
  github: false,
  yuque: false,
}

export const defaultRelatedPostConfig: RelatedPostConfig = {
  enable: true,
  limit: 6,
  dateType: 'created',
}

export const defaultPhotoFigcaptionConfig: PhotoFigcaptionConfig = {
  enable: false,
}

export const defaultNoticeOutdateConfig: NoticeOutdateConfig = {
  enable: false,
  style: 'flat',
  limitDay: 365,
  position: 'top',
  messagePrev: '距离上次更新已经过去',
  messageNext: '天，文章内容可能已经过时，请注意甄别。',
}

export const defaultShareJsConfig: ShareJsConfig = {
  enable: true,
  sites: ['facebook', 'twitter', 'wechat', 'weibo', 'qq'],
}

export const defaultFooterConfig: FooterConfig = {
  socialBar: {
    enable: true,
    centerImg: '',
    left: [
      { title: 'GitHub', link: 'https://github.com', icon: 'fa-brands fa-github' },
      { title: 'Email', link: 'mailto:hello@example.com', icon: 'fa-solid fa-envelope' },
    ],
    right: [
      { title: 'RSS', link: '/atom.xml', icon: 'fa-solid fa-rss' },
      { title: 'Bilibili', link: 'https://www.bilibili.com', icon: 'fa-brands fa-bilibili' },
    ],
  },
  owner: {
    enable: true,
    since: 2021,
  },
  runtime: {
    enable: false,
    launch_time: '',
    work_img: '',
    work_description: '',
    offduty_img: '',
    offduty_description: '',
  },
  list: {
    enable: true,
    project: [
      {
        title: '服务',
        links: [
          { title: '文章归档', link: '/archive' },
          { title: '分类导航', link: '/categories' },
          { title: '标签聚合', link: '/tags' },
        ],
      },
      {
        title: '导航',
        links: [
          { title: '首页', link: '/' },
          { title: '关于', link: '/about' },
          { title: '友链', link: '/friends' },
        ],
      },
      {
        title: '协议',
        links: [
          { title: '隐私协议', link: '/privacy' },
          { title: '版权协议', link: '/copyright' },
          { title: 'Cookies', link: '/cookies' },
        ],
      },
      {
        title: '友链',
        links: [
          { title: 'Tagtax’s house', link: '#' },
          { title: 'PeterJXL', link: '#' },
          { title: '迎风', link: '#' },
        ],
      },
    ],
    randomFriends: 0,
  },
  bdageitem: {
    enable: false,
    list: [],
  },
  footerBar: {
    enable: true,
    linkList: [
      { link: '/privacy', text: '隐私协议' },
      { link: '/copyright', text: '版权协议' },
    ],
    cc: {
      enable: false,
      link: '',
    },
    subTitle: {
      enable: false,
      startDelay: 300,
      typeSpeed: 150,
      backSpeed: 50,
      loop: true,
    },
    authorLink: '/',
  },
  custom_text: '',
}
