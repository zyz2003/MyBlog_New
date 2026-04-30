/**
 * Plugin system type definitions
 * Per architecture doc section 4.3.1
 */

/** Plugin category types */
export type PluginType = 'comment' | 'analytics' | 'search' | 'social' | 'ad' | 'feature' | 'custom'

/** Available mount points in the blog layout */
export type MountPoint = 'head-end' | 'header-end' | 'sidebar' | 'post-end' | 'footer-start' | 'body-end'

/** Config field input types */
export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'code' | 'textarea' | 'color' | 'image'

/** Config field option for select/multi-select types */
export interface ConfigFieldOption {
  label: string
  value: string | number
}

/** Single configuration field definition */
export interface ConfigField {
  type: ConfigFieldType
  label: string
  description?: string
  required?: boolean
  default?: unknown
  options?: ConfigFieldOption[]
  placeholder?: string
  language?: string // for code type: 'javascript', 'css', 'html', etc.
  validator?: (value: unknown) => boolean | string
}

/** Plugin configuration schema */
export type ConfigSchema = Record<string, ConfigField>

/** Plugin metadata */
export interface PluginMeta {
  name: string
  label: string
  type: PluginType
  version: string
  author?: string
  description?: string
  icon?: string
}

/** Server-side route definition for plugins */
export interface ServerRoute {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: (event: unknown) => unknown
}

/** Async Vue component loader type */
export type AsyncComponentLoader = () => Promise<{ default: unknown }>

/**
 * Core plugin adapter interface
 * All plugins must implement this interface
 */
export interface PluginAdapter {
  /** Plugin metadata (name, version, type, etc.) */
  meta: PluginMeta
  /** Configuration schema for admin UI generation */
  configSchema: ConfigSchema
  /** Mount points this plugin renders at */
  mountPoints: MountPoint[]
  /** Vue component to render (for component-based plugins) */
  component?: AsyncComponentLoader
  /** Callback for script-injection plugins (runs on client after mount) */
  onMount?(container: HTMLElement, config: Record<string, unknown>): void
}

/**
 * Extended plugin adapter with lifecycle hooks and dependency management
 * Plugins implementing this get access to init/unmount/config-change lifecycle
 */
export interface PluginAdapterExtended extends PluginAdapter {
  /** Called when plugin is first enabled */
  onInit?(config: Record<string, unknown>): Promise<void> | void
  /** Called when plugin is disabled */
  onUnmount?(): Promise<void> | void
  /** Called when plugin config is updated */
  onConfigChange?(newConfig: Record<string, unknown>, oldConfig: Record<string, unknown>): Promise<void> | void
  /** Server-side routes this plugin provides */
  serverRoutes?: ServerRoute[]
  /** Plugin names that must be enabled before this plugin */
  dependencies?: string[]
  /** Plugin names that conflict with this plugin */
  conflicts?: string[]
}
