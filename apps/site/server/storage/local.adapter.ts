import { writeFile, unlink, access, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import type { StorageAdapter, StorageConfig } from './adapter'

/**
 * Local filesystem storage adapter
 * Stores files under {basePath}/{storagePath} and serves via {baseUrl}/{storagePath}
 */
export class LocalStorageAdapter implements StorageAdapter {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
  }

  async upload(file: Buffer, storagePath: string, _mimeType: string): Promise<string> {
    const fullPath = join(this.config.basePath, storagePath)
    // Ensure parent directory exists
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, file)
    return this.getUrl(storagePath)
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = join(this.config.basePath, storagePath)
    try {
      await unlink(fullPath)
    }
    catch (err: unknown) {
      // Idempotent delete — if file not found, silently succeed
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'ENOENT') {
        return
      }
      throw err
    }
  }

  getUrl(storagePath: string): string {
    const base = this.config.cdnUrl || this.config.baseUrl
    return `${base}/${storagePath}`
  }

  async exists(storagePath: string): Promise<boolean> {
    const fullPath = join(this.config.basePath, storagePath)
    try {
      await access(fullPath)
      return true
    }
    catch {
      return false
    }
  }
}
