import fs from 'node:fs'
import path from 'node:path'

let loaded = false

const stripWrappingQuotes = (value) => {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export function loadDotEnv(filePath = path.resolve(process.cwd(), '.env')) {
  if (loaded) return
  loaded = true

  if (!fs.existsSync(filePath)) return

  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    if (!key || process.env[key] !== undefined) continue

    const value = stripWrappingQuotes(trimmed.slice(separator + 1))
    process.env[key] = value
  }
}
