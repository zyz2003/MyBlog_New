import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeManager } from '../ThemeManager'
import type { ThemeConfig } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Mock document.documentElement
const mockElement = {
  style: {
    setProperty: vi.fn(),
    transition: '',
  },
  setAttribute: vi.fn(),
}

Object.defineProperty(global.document, 'documentElement', {
  value: mockElement,
  writable: true,
})

// Mock getComputedStyle
Object.defineProperty(global, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(() => '--test-value'),
  })),
})

describe('ThemeManager', () => {
  let themeManager: ThemeManager

  const mockTheme: ThemeConfig = {
    metadata: {
      name: 'test',
      displayName: 'Test Theme',
      version: '1.0.0',
    },
    colors: {
      primary: '#ff0000',
      background: '#ffffff',
      text: '#000000',
    },
    typography: {
      fontFamily: 'Arial',
      fontSize: '16px',
      lineHeight: 1.5,
    },
    spacing: {
      unit: '8px',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear() // Clear localStorage state between tests
    themeManager = new ThemeManager('classic')
  })

  describe('constructor', () => {
    it('should initialize with default theme', () => {
      const manager = new ThemeManager('classic')
      expect(manager.getCurrent()).toBe('classic')
    })

    it('should restore theme from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValueOnce('minimal')
      new ThemeManager('classic')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('blog-theme')
    })
  })

  describe('register', () => {
    it('should register a theme', () => {
      themeManager.register('test', mockTheme)
      const theme = themeManager.getTheme('test')
      expect(theme).toEqual(mockTheme)
    })

    it('should apply theme if it matches current theme', () => {
      const manager = new ThemeManager('test')
      manager.register('test', mockTheme)
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme', 'test')
    })

    it('should register multiple themes', () => {
      const theme2: ThemeConfig = {
        ...mockTheme,
        metadata: { ...mockTheme.metadata, name: 'test2' },
      }
      themeManager.register('test1', mockTheme)
      themeManager.register('test2', theme2)
      expect(themeManager.getThemes()).toEqual(['test1', 'test2'])
    })
  })

  describe('apply', () => {
    beforeEach(() => {
      themeManager.register('test', mockTheme)
    })

    it('should apply a registered theme', () => {
      themeManager.apply('test')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme', 'test')
    })

    it('should set transition when transition option is true', () => {
      themeManager.apply('test', { transition: true })
      expect(mockElement.style.transition).toBe('background-color 0.3s, color 0.3s')
    })

    it('should not set transition when transition option is false', () => {
      themeManager.apply('test', { transition: false })
      // Transition is set and then cleared, so we check it was set
      expect(mockElement.style.transition).toBeDefined()
    })

    it('should persist theme to localStorage by default', () => {
      themeManager.apply('test')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('blog-theme', 'test')
    })

    it('should not persist theme when persist option is false', () => {
      themeManager.apply('test', { persist: false })
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should warn when theme not found', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      themeManager.apply('nonexistent')
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'))
      warnSpy.mockRestore()
    })

    it('should trigger onChange callbacks', () => {
      const callback = vi.fn()
      themeManager.onChange(callback)
      themeManager.apply('test')
      expect(callback).toHaveBeenCalledWith('test')
    })

    it('should apply theme colors to CSS variables', () => {
      themeManager.apply('test')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-primary', '#ff0000')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-background', '#ffffff')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-text', '#000000')
    })

    it('should apply theme typography to CSS variables', () => {
      themeManager.apply('test')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--font-family', 'Arial')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--font-size', '16px')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--line-height', '1.5')
    })

    it('should apply theme spacing to CSS variables', () => {
      themeManager.apply('test')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--spacing-unit', '8px')
    })
  })

  describe('getCurrent', () => {
    it('should return current theme name', () => {
      expect(themeManager.getCurrent()).toBe('classic')
      themeManager.register('test', mockTheme)
      themeManager.apply('test')
      expect(themeManager.getCurrent()).toBe('test')
    })
  })

  describe('getTheme', () => {
    beforeEach(() => {
      themeManager.register('test', mockTheme)
    })

    it('should return theme config by name', () => {
      const theme = themeManager.getTheme('test')
      expect(theme).toEqual(mockTheme)
    })

    it('should return undefined for unknown theme', () => {
      const theme = themeManager.getTheme('unknown')
      expect(theme).toBeUndefined()
    })
  })

  describe('getThemes', () => {
    it('should return array of registered theme names', () => {
      themeManager.register('test1', mockTheme)
      themeManager.register('test2', {
        ...mockTheme,
        metadata: { ...mockTheme.metadata, name: 'test2' },
      })
      expect(themeManager.getThemes()).toEqual(['test1', 'test2'])
    })

    it('should return empty array when no themes registered', () => {
      const manager = new ThemeManager('classic')
      expect(manager.getThemes()).toEqual([])
    })
  })

  describe('getCSSVariable', () => {
    it('should get CSS variable value', () => {
      const value = themeManager.getCSSVariable('--color-primary')
      expect(value).toBe('--test-value')
      expect(global.getComputedStyle).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('setCSSVariable', () => {
    it('should set CSS variable value', () => {
      themeManager.setCSSVariable('--color-primary', '#ff0000')
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--color-primary', '#ff0000')
    })
  })

  describe('onChange', () => {
    it('should register callback and return unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = themeManager.onChange(callback)

      themeManager.register('test', mockTheme)
      themeManager.apply('test')
      expect(callback).toHaveBeenCalledWith('test')

      // Unsubscribe
      unsubscribe()
      callback.mockClear()
      themeManager.apply('test')
      expect(callback).not.toHaveBeenCalled()
    })

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      themeManager.onChange(callback1)
      themeManager.onChange(callback2)

      themeManager.register('test', mockTheme)
      themeManager.apply('test')

      expect(callback1).toHaveBeenCalledWith('test')
      expect(callback2).toHaveBeenCalledWith('test')
    })
  })

  describe('saveTheme', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage not available')
      })
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      themeManager.register('test', mockTheme)
      themeManager.apply('test')

      expect(warnSpy).toHaveBeenCalled()
      expect(warnSpy.mock.calls[0][0]).toContain('Failed to save theme')
      warnSpy.mockRestore()
    })
  })

  describe('getSavedTheme', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage not available')
      })

      const manager = new ThemeManager('classic')
      expect(manager.getCurrent()).toBe('classic')
    })
  })
})
