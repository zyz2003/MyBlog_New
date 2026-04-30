import type { PluginAdapter } from './types'

/**
 * Test plugin for verification
 * Registers a simple "Hello from plugin!" message at body-end mount point
 */
export default {
  meta: {
    name: 'test-hello',
    label: 'Test Hello Plugin',
    type: 'custom',
    version: '1.0.0',
    description: 'A simple test plugin to verify the plugin system works',
  },
  configSchema: {
    message: {
      type: 'string',
      label: 'Greeting Message',
      description: 'The message to display',
      required: false,
      default: 'Hello from plugin!',
      placeholder: 'Enter a greeting message',
    },
  },
  mountPoints: ['body-end'],
} satisfies PluginAdapter
