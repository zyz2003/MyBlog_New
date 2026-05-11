declare global {
  interface Window {
    __PLUGIN_CONFIG__?: Record<string, Record<string, unknown>>
  }
}

export {}
