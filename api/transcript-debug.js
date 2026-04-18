export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  const { videoId } = req.query
  if (!videoId) return res.status(400).json({ error: 'videoId required' })

  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  })

  const html = await pageRes.text()
  const hasCaptionTracks = html.includes('"captionTracks"')
  const captionIndex = html.indexOf('"captionTracks"')
  const snippet = captionIndex >= 0 ? html.slice(captionIndex, captionIndex + 300) : 'NOT FOUND'

  return res.status(200).json({
    status: pageRes.status,
    htmlLength: html.length,
    hasCaptionTracks,
    snippet,
  })
}
