export const extractYouTubeVideoId = (url?: string | null) => {
  if (!url) return null

  const value = url.trim()
  if (!value) return null

  // Robustly extract the 11-character YouTube video ID using regex.
  // This automatically handles youtu.be, youtube.com with watch/embed/v/shorts/live,
  // as well as YouTube Studio URLs even if the protocol (http/https) is missing.
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/)|studio\.youtube\.com\/video\/)([\w-]{11})/i
  const match = value.match(regExp)
  
  if (match && match[1]) {
    return match[1]
  }

  // Fallback for rare edge cases that might still be valid URLs
  try {
    const urlFormat = value.startsWith('http') ? value : `https://${value}`
    const parsed = new URL(urlFormat)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replaceAll('/', '').trim()
      if (id && id.length === 11) return id
    }

    if (parsed.hostname.includes('youtube.com')) {
      const queryId = parsed.searchParams.get('v')
      if (queryId && queryId.length === 11) return queryId

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
