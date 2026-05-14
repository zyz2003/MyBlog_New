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

  // --- theme config (used by ThemeManager) ---
  themeConfig: z.record(z.string(), z.unknown()),
} as Record<string, z.ZodTypeAny>

export type SettingKey = keyof typeof settingSchemas
export type SettingValue<K extends SettingKey> = z.infer<typeof settingSchemas[K]>
