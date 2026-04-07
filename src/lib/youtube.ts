export const extractYouTubeVideoId = (url?: string | null) => {
  if (!url) return null

  const value = url.trim()
  if (!value) return null

  try {
    const parsed = new URL(value)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replaceAll('/', '').trim()
      return id || null
    }

    if (parsed.hostname.includes('youtube.com')) {
      const queryId = parsed.searchParams.get('v')
      if (queryId) return queryId

      const parts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts')
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1]
      }
    }
  } catch {
    return null
  }

  return null
}

export const buildYouTubeThumbnailUrl = (videoId?: string | null) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
