/**
 * @my-blog/cli
 *
 * CLI Tools
 *
 * Command-line interface for blog management.
 */

export const VERSION = '0.0.0'

/**
 * Initialize the CLI
 * @returns CLI instance
 */
export function initCLI() {
  console.log('[@my-blog/cli] CLI initialized')
  return {
    version: VERSION,
    name: '@my-blog/cli',
  }
}
