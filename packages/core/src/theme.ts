/**
 * 主题系统类型定义
 */

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题唯一标识 */
  name: string;
  /** 主题显示名称 */
  label: string;
  /** 主题版本 */
  version: string;
  /** 作者 */
  author?: string;
  /** 描述 */
  description?: string;
  /** 预览图 */
  previewImage?: string;
  /** 支持的颜色模式 */
  colorModes?: ('light' | 'dark')[];
  /** 主题配置项 */
  options?: ThemeOptions;
}

/**
 * 主题配置项
 */
export interface ThemeOptions {
  /** 颜色配置 */
  colors?: ColorConfig;
  /** 字体配置 */
  fonts?: FontConfig;
  /** 间距配置 */
  spacing?: SpacingConfig;
  /** 圆角配置 */
  radius?: RadiusConfig;
  /** 布局配置 */
  layout?: LayoutConfig;
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  /** 主色调 */
  primary?: string;
  /** 辅色调 */
  secondary?: string;
  /** 强调色 */
  accent?: string;
  /** 背景色 */
  background?: string;
  /** 表面色 */
  surface?: string;
  /** 文字色 */
  text?: string;
  /** 次要文字色 */
  textMuted?: string;
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 标题字体 */
  heading?: string;
  /** 正文字体 */
  body?: string;
  /** 等宽字体 */
  mono?: string;
}

/**
 * 间距配置
 */
export interface SpacingConfig {
  /** 基础间距单位 */
  unit?: number;
  /** 内容内边距 */
  contentPadding?: number;
  /** 容器最大宽度 */
  containerMaxWidth?: number;
}

/**
 * 圆角配置
 */
export interface RadiusConfig {
  /** 小圆角 */
  sm?: number;
  /** 中圆角 */
  md?: number;
  /** 大圆角 */
  lg?: number;
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 侧边栏位置 */
  sidebarPosition?: 'left' | 'right' | 'none';
  /** 文章目录位置 */
  tocPosition?: 'left' | 'right' | 'none';
  /** 文章列表布局 */
  postListLayout?: 'grid' | 'list';
}

/**
 * 主题管理器
 */
export class ThemeManager {
  private currentTheme: string | null = null;
  private themes: Map<string, ThemeConfig> = new Map();

  /**
   * 注册主题
   */
  register(theme: ThemeConfig): void {
    if (this.themes.has(theme.name)) {
      throw new Error(`Theme "${theme.name}" is already registered.`);
    }
    this.themes.set(theme.name, theme);
  }

  /**
   * 获取所有主题
   */
  getThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * 获取主题
   */
  getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name);
  }

  /**
   * 激活主题
   */
  activate(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found.`);
    }

    this.currentTheme = themeName;

    // 在浏览器环境中应用主题
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  /**
   * 应用颜色配置
   */
  applyColors(colors: ColorConfig): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(colors)) {
        if (value) {
          root.style.setProperty(`--color-${key}`, value);
        }
      }
    }
  }

  /**
   * 应用字体配置
   */
  applyFonts(fonts: FontConfig): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (fonts.heading) {
        root.style.setProperty('--font-heading', fonts.heading);
      }
      if (fonts.body) {
        root.style.setProperty('--font-body', fonts.body);
      }
      if (fonts.mono) {
        root.style.setProperty('--font-mono', fonts.mono);
      }
    }
  }
}

// 全局单例
export const themeManager = new ThemeManager();
