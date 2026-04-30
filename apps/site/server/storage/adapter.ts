/**
 * Storage adapter interface + config type
 * Per architecture doc section 4.5.3
 */

/** Configuration for storage adapters */
export interface StorageConfig {
  type: 'local' | 'oss' | 'cos' | 's3'
  basePath: string
  baseUrl: string
  cdnUrl?: string
}

/** Pluggable storage interface for file operations */
export interface StorageAdapter {
  /** Upload file buffer to storage, return the public URL */
  upload(file: Buffer, storagePath: string, mimeType: string): Promise<string>
  /** Delete file from storage (idempotent — no error if missing) */
  delete(storagePath: string): Promise<void>
  /** Get public URL for a stored file */
  getUrl(storagePath: string): string
  /** Check if file exists in storage */
  exists(storagePath: string): Promise<boolean>
}
