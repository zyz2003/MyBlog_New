/**
 * @my-blog/core
 *
 * Blog Core Framework
 *
 * Main entry point for the core blog functionality.
 * Provides plugin system, theme system, and hook system.
 */

export const VERSION = '0.0.0'

/**
 * Initialize the blog core framework
 * @returns Core framework instance
 */
export function initCore() {
  console.log('[@my-blog/core] Core framework initialized')
  return {
    version: VERSION,
    name: '@my-blog/core',
  }
}
