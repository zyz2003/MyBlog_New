import { z } from 'zod'

/** Zod schemas for system_settings keys — per DATA-01/DATA-02 */
export const settingSchemas = {
  // --- general (admin/general.vue) ---
  socialLinks: z.array(z.object({ name: z.string(), url: z.string(), icon: z.string() })),
  footer: z.record(z.string(), z.unknown()),
  badgeItems: z.array(z.object({ link: z.string(), shields: z.string(), message: z.string() })),
  footerSocials: z.array(z.record(z.string(), z.unknown())),
  darkmode: z.record(z.string(), z.unknown()),
  diytitle: z.record(z.string(), z.unknown()),
  consoleLog: z.record(z.string(), z.unknown()),
  injectCode: z.record(z.string(), z.unknown()),
  runtime: z.record(z.string(), z.unknown()),
  homeSubtitle: z.record(z.string(), z.unknown()),

  // --- homepage (admin/homepage.vue) ---
  homeTopEnabled: z.boolean(),
  homeTopTitle: z.string(),
  homeTopSubTitle: z.string(),
  homeTopSiteText: z.string(),
  homeTopTimemode: z.string(),
  homeTopDefaultDescr: z.string(),
  homeTopSwiperEnabled: z.boolean(),
  homeTopCategories: z.array(z.record(z.string(), z.unknown())),
  todayCard: z.record(z.string(), z.unknown()),
  homepageCoverEnabled: z.boolean(),
  homepageCoverPosition: z.string(),
  homepagePageSize: z.number(),
  homepageAsideCover: z.boolean(),
  homepageArchivesCover: z.boolean(),
  homepageDefaultCovers: z.array(z.string()),
  homepageDoubleRow: z.boolean(),
  homepageIntroMethod: z.string(),
  homepageIntroLength: z.number(),
  topImage: z.record(z.string(), z.unknown()),
  mainTone: z.record(z.string(), z.unknown()),
  homepageSkills: z.array(z.object({ name: z.string(), icon: z.string(), color: z.string() })),

  // --- posts (admin/posts.vue) ---
  postMetaPage: z.record(z.string(), z.unknown()),
  postMetaPost: z.record(z.string(), z.unknown()),
  postCopyright: z.record(z.string(), z.unknown()),
  reward: z.record(z.string(), z.unknown()),
  relatedPost: z.record(z.string(), z.unknown()),
  noticeOutdate: z.record(z.string(), z.unknown()),
  postPagination: z.string(),
  cover: z.record(z.string(), z.unknown()),

  // ADMIN-05: posts additional fields
  toc: z.record(z.string(), z.unknown()),
  wordcount: z.record(z.string(), z.unknown()),
  ptool: z.record(z.string(), z.unknown()),
  postEdit: z.record(z.string(), z.unknown()),
  photofigcaption: z.record(z.string(), z.unknown()),
  h2Divider: z.record(z.string(), z.unknown()),
  anchor: z.record(z.string(), z.unknown()),
  postMeta: z.record(z.string(), z.unknown()),

  // ADMIN-01: homepage additional fields
  indexImg: z.record(z.string(), z.unknown()),
  indexTopImgHeight: z.string(),
  indexSiteInfoTop: z.string(),
  defaultTopImg: z.string(),
  subtitle: z.record(z.string(), z.unknown()),
  banner: z.record(z.string(), z.unknown()),
  siteInfo: z.record(z.string(), z.unknown()),

  // ADMIN-02: sidebar fields
  aside: z.record(z.string(), z.unknown()),
  sidebar: z.record(z.string(), z.unknown()),
  cardAuthor: z.record(z.string(), z.unknown()),
  cardAnnouncement: z.record(z.string(), z.unknown()),
  cardRecentPost: z.record(z.string(), z.unknown()),
  cardCategories: z.record(z.string(), z.unknown()),
  cardTags: z.record(z.string(), z.unknown()),
  cardArchives: z.record(z.string(), z.unknown()),
  cardWeixin: z.record(z.string(), z.unknown()),
  siteData: z.record(z.string(), z.unknown()),
  menusItems: z.record(z.string(), z.unknown()),
  tagsCloud: z.record(z.string(), z.unknown()),

  // ADMIN-03: SEO fields
  siteVerification: z.record(z.string(), z.unknown()),
  openGraphMeta: z.record(z.string(), z.unknown()),
  structuredData: z.record(z.string(), z.unknown()),
  baiduPush: z.record(z.string(), z.unknown()),
  googleAdsense: z.record(z.string(), z.unknown()),

  // ADMIN-04: general additional fields
  favicon: z.string(),
  avatar: z.record(z.string(), z.unknown()),
  pwa: z.record(z.string(), z.unknown()),
  footerSocialBar: z.record(z.string(), z.unknown()),
  footerList: z.record(z.string(), z.unknown()),
  footerBar: z.record(z.string(), z.unknown()),
  footerRuntime: z.record(z.string(), z.unknown()),
  footerOwner: z.record(z.string(), z.unknown()),
  footerCustomText: z.string(),
  footerBdageitem: z.record(z.string(), z.unknown()),
  nav: z.record(z.string(), z.unknown()),

  // ADMIN-06: comments fields
  twikoo: z.record(z.string(), z.unknown()),
  waline: z.record(z.string(), z.unknown()),
  valine: z.record(z.string(), z.unknown()),
  giscus: z.record(z.string(), z.unknown()),
  newestComments: z.record(z.string(), z.unknown()),
  visitorMail: z.record(z.string(), z.unknown()),
  commentBarrage: z.record(z.string(), z.unknown()),

  // ADMIN-07: code & search fields
  mermaid: z.record(z.string(), z.unknown()),
  note: z.record(z.string(), z.unknown()),
  tableInterlaced: z.record(z.string(), z.unknown()),
  icons: z.record(z.string(), z.unknown()),
  localSearch: z.record(z.string(), z.unknown()),
  algoliaSearch: z.record(z.string(), z.unknown()),
  docsearch: z.record(z.string(), z.unknown()),

  // ADMIN-08: analytics fields
  cnzzAnalytics: z.record(z.string(), z.unknown()),
  googleAnalytics: z.record(z.string(), z.unknown()),
  baiduAnalytics: z.record(z.string(), z.unknown()),

  // ADMIN-09: features fields
  sharejs: z.record(z.string(), z.unknown()),
  addtoany: z.record(z.string(), z.unknown()),
  chatBtn: z.record(z.string(), z.unknown()),
  chatra: z.record(z.string(), z.unknown()),
  tidio: z.record(z.string(), z.unknown()),
  daovoice: z.record(z.string(), z.unknown()),
  crisp: z.record(z.string(), z.unknown()),
  preloader: z.record(z.string(), z.unknown()),
  centerConsole: z.record(z.string(), z.unknown()),
  friendsVue: z.record(z.string(), z.unknown()),
  dynamicEffect: z.record(z.string(), z.unknown()),
  agreementPopup: z.record(z.string(), z.unknown()),
  snackbar: z.record(z.string(), z.unknown()),
  aplayerInject: z.record(z.string(), z.unknown()),
  rightsideItemOrder: z.record(z.string(), z.unknown()),
  navMusic: z.record(z.string(), z.unknown()),

  // ADMIN-10: theme/display fields
  beautify: z.record(z.string(), z.unknown()),
  blogTitleFont: z.record(z.string(), z.unknown()),
  displayMode: z.string(),
  themeColor: z.record(z.string(), z.unknown()),
  hrIcon: z.record(z.string(), z.unknown()),
  font: z.record(z.string(), z.unknown()),
  navRight: z.record(z.string(), z.unknown()),

  // --- theme config (used by ThemeManager) ---
  themeConfig: z.record(z.string(), z.unknown()),
} as Record<string, z.ZodTypeAny>

export type SettingKey = keyof typeof settingSchemas
export type SettingValue<K extends SettingKey> = z.infer<typeof settingSchemas[K]>
