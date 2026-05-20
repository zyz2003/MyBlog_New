type CdnProvider = 'local' | 'jsdelivr' | 'unpkg' | 'cdnjs' | 'elemecdn' | 'onmicrosoft' | 'cbd' | 'anheyu' | 'custom'
type AssetScope = 'internal' | 'thirdParty'

type AssetDefinition = {
  scope: AssetScope
  packageName: string
  version?: string
  file: string
  cdnjsName?: string
  cdnjsFile?: string
}

const CDN_ASSET_REGISTRY: Record<string, AssetDefinition> = {
  mathjax: {
    scope: 'thirdParty',
    packageName: 'mathjax',
    version: '3.2.2',
    file: 'es5/tex-svg.js',
  },
  katex: {
    scope: 'thirdParty',
    packageName: 'katex',
    version: '0.16.11',
    file: 'dist/katex.min.js',
  },
  katex_css: {
    scope: 'thirdParty',
    packageName: 'katex',
    version: '0.16.11',
    file: 'dist/katex.min.css',
  },
  katex_copytex: {
    scope: 'thirdParty',
    packageName: 'katex',
    version: '0.16.11',
    file: 'dist/contrib/auto-render.min.js',
  },
  mermaid: {
    scope: 'thirdParty',
    packageName: 'mermaid',
    version: '10.9.1',
    file: 'dist/mermaid.min.js',
  },
  fancybox_css: {
    scope: 'thirdParty',
    packageName: '@fancyapps/ui',
    version: '5.0.36',
    file: 'dist/fancybox/fancybox.css',
  },
  fancybox: {
    scope: 'thirdParty',
    packageName: '@fancyapps/ui',
    version: '5.0.36',
    file: 'dist/fancybox/fancybox.umd.js',
  },
  medium_zoom: {
    scope: 'thirdParty',
    packageName: 'medium-zoom',
    version: '1.1.0',
    file: 'dist/medium-zoom.min.js',
  },
  pangu: {
    scope: 'thirdParty',
    packageName: 'pangu',
    version: '4.0.7',
    file: 'dist/browser/pangu.min.js',
  },
  twikoo: {
    scope: 'thirdParty',
    packageName: 'twikoo',
    version: '1.6.41',
    file: 'dist/twikoo.all.min.js',
  },
  waline_js: {
    scope: 'thirdParty',
    packageName: '@waline/client',
    version: '3.7.3',
    file: 'dist/waline.js',
    cdnjsName: 'waline',
  },
  waline_css: {
    scope: 'thirdParty',
    packageName: '@waline/client',
    version: '3.7.3',
    file: 'dist/waline.css',
    cdnjsName: 'waline',
  },
  waline_meta_css: {
    scope: 'thirdParty',
    packageName: '@waline/client',
    version: '3.7.3',
    file: 'dist/waline-meta.css',
    cdnjsName: 'waline',
  },
  artalk_js: {
    scope: 'thirdParty',
    packageName: 'artalk',
    version: '2.8.6',
    file: 'dist/Artalk.js',
  },
  artalk_css: {
    scope: 'thirdParty',
    packageName: 'artalk',
    version: '2.8.6',
    file: 'dist/Artalk.css',
  },
  aplayer_css: {
    scope: 'thirdParty',
    packageName: 'aplayer',
    version: '1.10.1',
    file: 'dist/APlayer.min.css',
  },
  aplayer_js: {
    scope: 'thirdParty',
    packageName: 'aplayer',
    version: '1.10.1',
    file: 'dist/APlayer.min.js',
  },
  meting_js: {
    scope: 'thirdParty',
    packageName: 'meting',
    version: '2.0.1',
    file: 'dist/Meting.min.js',
  },
  instantpage: {
    scope: 'thirdParty',
    packageName: 'instant.page',
    version: '5.2.0',
    file: 'instantpage.min.js',
  },
  busuanzi: {
    scope: 'thirdParty',
    packageName: 'busuanzi.pure.js',
    version: '1.0.0',
    file: 'busuanzi.pure.mini.js',
  },
  fontawesome: {
    scope: 'thirdParty',
    packageName: '@fortawesome/fontawesome-free',
    version: '6.5.2',
    file: 'css/all.min.css',
    cdnjsName: 'font-awesome',
    cdnjsFile: 'css/all.min.css',
  },
  opencc_js: {
    scope: 'thirdParty',
    packageName: 'opencc-js',
    version: '1.0.5',
    file: 'dist/umd/full.js',
  },
}

function normalizeCdnjsFile(file: string) {
  return file.replace(/^(dist|lib)\//, '').replace(/^browser\//, '')
}

function buildCustomUrl(format: string, asset: AssetDefinition) {
  const version = asset.version || 'latest'
  const valueMap = {
    name: asset.packageName,
    version,
    file: asset.file,
    min_file: asset.file,
    cdnjs_name: asset.cdnjsName || asset.packageName,
    cdnjs_file: asset.cdnjsFile || normalizeCdnjsFile(asset.file),
    min_cdnjs_file: asset.cdnjsFile || normalizeCdnjsFile(asset.file),
  }

  return format.replace(/\$\{(.+?)\}/g, (_, key: string) => valueMap[key as keyof typeof valueMap] || '')
}

export function useCdnAsset() {
  const { settings } = useSiteSettings()

  const cdnConfig = computed(() => {
    const raw = (settings.value.CDN as Record<string, unknown> | undefined) ?? {}
    return {
      internalProvider: String(raw.internal_provider || 'local') as CdnProvider,
      thirdPartyProvider: String(raw.third_party_provider || 'cbd') as CdnProvider,
      version: raw.version !== undefined ? Boolean(raw.version) : true,
      customFormat: String(raw.custom_format || '').trim(),
      option: ((raw.option as Record<string, unknown> | undefined) ?? {}),
    }
  })

  function resolveAssetUrl(assetKey: string, fallbackUrl: string) {
    const override = cdnConfig.value.option[assetKey]
    if (typeof override === 'string' && override.trim()) {
      return override.trim()
    }

    const asset = CDN_ASSET_REGISTRY[assetKey]
    if (!asset) {
      return fallbackUrl
    }

    const provider = asset.scope === 'internal'
      ? cdnConfig.value.internalProvider
      : cdnConfig.value.thirdPartyProvider

    if (provider === 'local') {
      return fallbackUrl
    }

    const versionPart = cdnConfig.value.version && asset.version ? `@${asset.version}` : ''
    const normalizedCdnjsFile = asset.cdnjsFile || normalizeCdnjsFile(asset.file)
    const resolvedCdnjsName = asset.cdnjsName || asset.packageName

    switch (provider) {
      case 'jsdelivr':
        return `https://cdn.jsdelivr.net/npm/${asset.packageName}${versionPart}/${asset.file}`
      case 'unpkg':
        return `https://unpkg.com/${asset.packageName}${versionPart}/${asset.file}`
      case 'cdnjs':
        return asset.version
          ? `https://cdnjs.cloudflare.com/ajax/libs/${resolvedCdnjsName}/${asset.version}/${normalizedCdnjsFile}`
          : fallbackUrl
      case 'elemecdn':
        return `https://npm.elemecdn.com/${asset.packageName}${versionPart}/${asset.file}`
      case 'onmicrosoft':
        return `https://npm.onmicrosoft.cn/${asset.packageName}${versionPart}/${asset.file}`
      case 'cbd':
        return `https://cdn.cbd.int/${asset.packageName}${versionPart}/${asset.file}`
      case 'anheyu':
        return `https://cdn.anheyu.com/npm/${asset.packageName}${versionPart}/${asset.file}`
      case 'custom':
        return cdnConfig.value.customFormat
          ? buildCustomUrl(cdnConfig.value.customFormat, asset)
          : fallbackUrl
      default:
        return fallbackUrl
    }
  }

  return {
    cdnConfig,
    resolveAssetUrl,
  }
}
