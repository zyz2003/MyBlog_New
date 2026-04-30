import type { StorageAdapter, StorageConfig } from './adapter'
import { LocalStorageAdapter } from './local.adapter'

/**
 * Factory function to create storage adapter based on config type
 */
export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  switch (config.type) {
    case 'local':
      return new LocalStorageAdapter(config)
    case 'oss':
    case 'cos':
    case 's3':
      throw new Error(`Storage type "${config.type}" is not yet implemented`)
    default:
      throw new Error(`Unknown storage type: ${(config as StorageConfig).type}`)
  }
}

export type { StorageAdapter, StorageConfig }
