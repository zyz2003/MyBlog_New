function parsePrimitiveValue(raw: string): unknown {
  const value = raw.trim()
  if (!value) return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null

  const numeric = Number(value)
  if (!Number.isNaN(numeric) && value === String(numeric)) {
    return numeric
  }

  return value
}

export function useAdminFormHelpers() {
  function toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {}
  }

  function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : []
  }

  function toLines(value: unknown): string {
    return toStringArray(value).join('\n')
  }

  function fromLines(value: string): string[] {
    return value
      .split(/\r?\n/g)
      .map(item => item.trim())
      .filter(Boolean)
  }

  function objectToKeyValueText(value: unknown): string {
    return Object.entries(toRecord(value))
      .map(([key, itemValue]) => `${key}=${String(itemValue ?? '')}`)
      .join('\n')
  }

  function keyValueTextToObject(value: string): Record<string, unknown> {
    return value
      .split(/\r?\n/g)
      .map(line => line.trim())
      .filter(Boolean)
      .reduce<Record<string, unknown>>((result, line) => {
        const separatorIndex = line.indexOf('=')
        if (separatorIndex === -1) {
          result[line] = true
          return result
        }

        const key = line.slice(0, separatorIndex).trim()
        const rawValue = line.slice(separatorIndex + 1)
        if (key) {
          result[key] = parsePrimitiveValue(rawValue)
        }
        return result
      }, {})
  }

  return {
    toRecord,
    toStringArray,
    toLines,
    fromLines,
    objectToKeyValueText,
    keyValueTextToObject,
  }
}
