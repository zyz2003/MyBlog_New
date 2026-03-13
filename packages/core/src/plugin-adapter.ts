/**
 * 插件元数据
 */
export interface PluginMeta {
  /** 插件唯一标识 */
  name: string;
  /** 插件显示名称 */
  label: string;
  /** 插件类型 */
  type: PluginType;
  /** 插件版本 */
  version: string;
  /** 作者 */
  author?: string;
  /** 描述 */
  description?: string;
  /** 网站 */
  website?: string;
  /** 依赖的插件 */
  dependencies?: string[];
}

/**
 * 插件类型
 */
export type PluginType =
  | 'comment'        // 评论系统
  | 'analytics'      // 统计分析
  | 'search'         // 搜索服务
  | 'social'         // 社交功能
  | 'ads'            // 广告嵌入
  | 'custom'         // 自定义功能
  | 'theme'          // 主题相关
  | 'seo'            // SEO 优化
  | 'widget';        // 小组件

/**
 * 挂载点位置
 */
export type MountPoint =
  | 'head-start'        // <head> 开始
  | 'head-end'          // <head> 结束前
  | 'body-start'        // <body> 开始
  | 'body-end'          // <body> 结束前
  | 'header'            // 页面头部
  | 'footer'            // 页面底部
  | 'sidebar'           // 侧边栏
  | 'post-start'        // 文章内容开始前
  | 'post-end'          // 文章内容结束后
  | 'post-meta'         // 文章元数据位置
  | 'comment-area'      // 评论区域
  | 'widget-left'       // 左侧小组件区
  | 'widget-right'      // 右侧小组件区
  | 'custom';           // 自定义位置

/**
 * 配置字段类型
 */
export type ConfigFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'image'
  | 'file'
  | 'json';

/**
 * 配置字段定义
 */
export interface ConfigField {
  /** 字段类型 */
  type: ConfigFieldType;
  /** 显示标签 */
  label: string;
  /** 描述 */
  description?: string;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 占位符 */
  placeholder?: string;
  /** 选项 (用于 select) */
  options?: Array<{ label: string; value: any }>;
  /** 验证器 */
  validator?: (value: any) => boolean;
}

/**
 * 配置 Schema
 */
export type ConfigSchema = Record<string, ConfigField>;

/**
 * 插件适配器接口
 */
export interface PluginAdapter {
  /** 插件元数据 */
  meta: PluginMeta;
  /** 配置 Schema */
  configSchema?: ConfigSchema;
  /** 支持的挂载点 */
  mountPoints?: MountPoint[];

  /**
   * 插件初始化
   * 在插件注册时调用，只调用一次
   */
  onInitialize?: () => void | Promise<void>;

  /**
   * 插件挂载
   * 在插件启用时调用，每次启用都会调用
   * @param container 挂载容器元素
   * @param config 插件配置
   */
  onMount?: (container: HTMLElement, config: any) => void | Promise<void>;

  /**
   * 插件卸载
   * 在插件禁用时调用
   */
  onUnmount?: () => void | Promise<void>;

  /**
   * 配置变更回调
   * @param newConfig 新配置
   * @param oldConfig 旧配置
   */
  onConfigChange?: (newConfig: any, oldConfig: any) => void | Promise<void>;

  /**
   * 销毁
   * 在插件被完全移除时调用
   */
  onDestroy?: () => void | Promise<void>;
}

/**
 * 插件注册表
 */
export class PluginRegistry {
  private plugins: Map<string, PluginAdapter> = new Map();
  private configs: Map<string, any> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private mountContainers: Map<MountPoint, HTMLElement[]> = new Map();

  /**
   * 注册插件
   */
  register(plugin: PluginAdapter): void {
    if (this.plugins.has(plugin.meta.name)) {
      throw new Error(`Plugin "${plugin.meta.name}" is already registered.`);
    }

    this.plugins.set(plugin.meta.name, plugin);

    if (plugin.onInitialize) {
      plugin.onInitialize();
    }
  }

  /**
   * 启用插件
   */
  async enable(pluginName: string, config?: any): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`);
    }

    if (config) {
      this.validateConfig(plugin.configSchema, config);
      this.configs.set(pluginName, config);
    }

    this.enabledPlugins.add(pluginName);

    if (plugin.onMount) {
      for (const mountPoint of plugin.mountPoints || []) {
        const containers = this.mountContainers.get(mountPoint) || [];
        for (const container of containers) {
          const pluginContainer = document.createElement('div');
          pluginContainer.className = `plugin-${pluginName}`;
          pluginContainer.dataset.plugin = pluginName;
          container.appendChild(pluginContainer);
          await plugin.onMount(pluginContainer, this.configs.get(pluginName));
        }
      }
    }
  }

  /**
   * 禁用插件
   */
  async disable(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`);
    }

    this.enabledPlugins.delete(pluginName);

    if (plugin.onUnmount) {
      await plugin.onUnmount();
    }

    // 从 DOM 移除
    document.querySelectorAll(`[data-plugin="${pluginName}"]`).forEach(el => el.remove());
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(type?: PluginType): PluginAdapter[] {
    let plugins = Array.from(this.enabledPlugins)
      .map(name => this.plugins.get(name)!)
      .filter(Boolean);

    if (type) {
      plugins = plugins.filter(p => p.meta.type === type);
    }

    return plugins;
  }

  /**
   * 渲染挂载点
   */
  renderMountPoint(mountPoint: MountPoint, container: HTMLElement): void {
    if (!this.mountContainers.has(mountPoint)) {
      this.mountContainers.set(mountPoint, []);
    }
    this.mountContainers.get(mountPoint)!.push(container);

    const plugins = this.getEnabledPlugins().filter(p =>
      p.mountPoints?.includes(mountPoint)
    );

    for (const plugin of plugins) {
      const pluginContainer = document.createElement('div');
      pluginContainer.className = `plugin-${plugin.meta.name}`;
      pluginContainer.dataset.plugin = plugin.meta.name;
      container.appendChild(pluginContainer);

      const config = this.configs.get(plugin.meta.name);
      if (plugin.onMount) {
        plugin.onMount(pluginContainer, config);
      }
    }
  }

  /**
   * 验证配置
   */
  private validateConfig(schema: ConfigSchema | undefined, config: any): void {
    if (!schema) return;

    for (const [key, field] of Object.entries(schema)) {
      if (field.required && !(key in config)) {
        throw new Error(`Missing required config field: ${key}`);
      }
      if (field.validator && key in config && !field.validator(config[key])) {
        throw new Error(`Invalid config value for field: ${key}`);
      }
    }
  }
}

// 全局单例
export const pluginRegistry = new PluginRegistry();
