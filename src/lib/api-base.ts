const trimTrailingSlash = (value: string) => value.replace(/\/$/, '')

const envApiBase = `${import.meta.env.VITE_NOTEBOOKLM_API_URL || ''}`.trim()

const isProduction = !import.meta.env.DEV

export const NOTEBOOKLM_ENABLED = !isProduction

export const API_BASE = isProduction
  ? ''
  : envApiBase
    ? trimTrailingSlash(envApiBase)
    : 'http://127.0.0.1:3002'

export const buildApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    throw new Error('API path deve comecar com "/".')
  }

  return API_BASE ? `${API_BASE}${path}` : path
}
