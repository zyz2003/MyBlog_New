import { SettingsService } from '../../services/settings.service'

export default defineEventHandler(async (event) => {
  const siteTitleRecord = await SettingsService.getByKey('siteTitle')
  const pwaRecord = await SettingsService.getByKey('pwa')
  const seoRecord = await SettingsService.getByKey('seoDescription')

  const siteTitle = String(siteTitleRecord?.value || 'My Blog')
  const description = String(seoRecord?.value || '')
  const pwa = ((pwaRecord?.value as Record<string, unknown> | null) ?? {})

  setHeader(event, 'Content-Type', 'application/manifest+json; charset=utf-8')

  return {
    name: siteTitle,
    short_name: siteTitle.slice(0, 12) || siteTitle,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: String(pwa.theme_color || '#425AEF'),
    icons: [
      String(pwa.favicon_32_32 || ''),
      String(pwa.favicon_16_16 || ''),
      String(pwa.apple_touch_icon || ''),
      String(pwa.bookmark_icon || ''),
    ]
      .filter(Boolean)
      .map(src => ({
        src,
        sizes: src.includes('32') ? '32x32' : src.includes('16') ? '16x16' : '180x180',
        type: 'image/png',
      })),
  }
})
