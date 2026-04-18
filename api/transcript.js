// Vercel Serverless Function — fetches YouTube transcript for a video
// Runs on Vercel's edge network (not blocked by YouTube unlike data center IPs)

export const config = { maxDuration: 30 }

async function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
}

async function fetchTranscript(videoId) {
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  })

  if (!pageRes.ok) throw new Error(`YouTube retornou status ${pageRes.status}`)

  const html = await pageRes.text()
  // Find captionTracks by position and extract the JSON array with bracket counting
  const captionKey = '"captionTracks":'
  const keyIndex = html.indexOf(captionKey)
  let captionMatch = null

  if (keyIndex !== -1) {
    const startIndex = keyIndex + captionKey.length
    if (html[startIndex] === '[') {
      let depth = 0
      let endIndex = startIndex
      for (let i = startIndex; i < html.length; i++) {
        if (html[i] === '[') depth++
        else if (html[i] === ']') {
          depth--
          if (depth === 0) { endIndex = i; break }
        }
      }
      try {
        captionMatch = [null, html.slice(startIndex, endIndex + 1)]
      } catch { /* ignore */ }
    }
  }

  if (!captionMatch) {
    throw new Error(
      'Legendas nao disponiveis para este video. Certifique-se que o video esta como Publico ou Nao Listado e que as legendas automaticas ja foram geradas pelo YouTube.',
    )
  }

  const tracks = JSON.parse(captionMatch[1])
  if (!tracks.length) throw new Error('Nenhuma faixa de legendas encontrada.')

  const ptTrack = tracks.find((t) => t.languageCode === 'pt' || t.languageCode === 'pt-BR')
  const enTrack = tracks.find((t) => t.languageCode?.startsWith('en'))
  const track = ptTrack || enTrack || tracks[0]

  if (!track?.baseUrl) throw new Error('URL da transcricao nao encontrada.')

  const xmlRes = await fetch(track.baseUrl)
  if (!xmlRes.ok) throw new Error('Falha ao baixar transcricao.')

  const xml = await xmlRes.text()
  const segments = []
  const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g
  let m
  while ((m = textRegex.exec(xml)) !== null) {
    const decoded = await decodeHtmlEntities(m[1].trim())
    if (decoded) segments.push(decoded)
  }

  if (!segments.length) throw new Error('Transcricao vazia.')

  const text = segments
    .join(' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length < 50) throw new Error('Transcricao muito curta.')

  return { text, language: track.languageCode || 'auto', segments: segments.length }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { videoId } = req.query
  if (!videoId) return res.status(400).json({ error: 'videoId obrigatorio' })

  try {
    const result = await fetchTranscript(videoId)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(422).json({ error: err.message || 'Erro ao buscar transcricao' })
  }
}
