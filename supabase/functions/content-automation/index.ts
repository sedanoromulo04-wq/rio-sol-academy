import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const getGeminiApiKey = () =>
  Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_AI_API_KEY') || ''
const getGeminiAgentModel = () =>
  Deno.env.get('GEMINI_AGENT_MODEL') || 'gemini-2.5-flash'

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const jsonError = (message: string, status = 400) => json({ error: message }, status)

const createServiceClient = () =>
  createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

const createAuthedClient = (req: Request) =>
  createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })

// ---------------------------------------------------------------------------
// Admin verification
// ---------------------------------------------------------------------------

async function requireAdmin(req: Request) {
  const supabase = createAuthedClient(req)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) throw new Error('Sessao invalida ou expirada.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Acesso restrito ao admin.')
  return user
}

// ---------------------------------------------------------------------------
// Gemini API
// ---------------------------------------------------------------------------

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 45000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

async function geminiRequest(endpoint: string, body: Record<string, unknown>) {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('GEMINI_API_KEY nao configurada nas secrets do Supabase.')

  const response = await fetchWithTimeout(
    `${GEMINI_API_BASE}/${endpoint}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    45000,
  )

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || `Gemini request failed with status ${response.status}.`,
    )
  }
  return payload
}

async function generateText(options: {
  prompt: string
  systemInstruction?: string
  temperature?: number
  maxOutputTokens?: number
}) {
  const model = getGeminiAgentModel()
  const payload: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxOutputTokens ?? 900,
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  if (options.systemInstruction?.trim()) {
    payload.systemInstruction = { parts: [{ text: options.systemInstruction.trim() }] }
  }

  const result = await geminiRequest(`models/${model}:generateContent`, payload)

  const text =
    result?.candidates
      ?.flatMap((c: any) => c?.content?.parts || [])
      .map((p: any) => p?.text || '')
      .join('')
      .trim() || ''

  if (!text) throw new Error('Gemini nao retornou texto para esta solicitacao.')
  return text
}

// ---------------------------------------------------------------------------
// YouTube transcript (Deno-compatible — no npm packages)
// ---------------------------------------------------------------------------

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_: string, dec: string) => String.fromCharCode(Number(dec)))
}

async function fetchYouTubeTranscript(videoId: string) {
  const pageResponse = await fetchWithTimeout(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  }, 20000)

  if (!pageResponse.ok) {
    throw new Error(`Falha ao acessar o video do YouTube (status ${pageResponse.status}).`)
  }

  const html = await pageResponse.text()

  const captionMatch = html.match(/"captionTracks":(\[.*?\])/)
  if (!captionMatch) {
    throw new Error(
      'Transcricao nao disponivel para este video. Verifique se as legendas foram geradas no YouTube.',
    )
  }

  let tracks: any[]
  try {
    tracks = JSON.parse(captionMatch[1])
  } catch {
    throw new Error('Falha ao interpretar as faixas de legendas do YouTube.')
  }

  if (!tracks.length) {
    throw new Error('Nenhuma faixa de legendas encontrada para este video.')
  }

  const ptTrack = tracks.find(
    (t: any) => t.languageCode === 'pt' || t.languageCode === 'pt-BR',
  )
  const enTrack = tracks.find((t: any) => t.languageCode?.startsWith('en'))
  const track = ptTrack || enTrack || tracks[0]

  if (!track?.baseUrl) {
    throw new Error('URL da transcricao nao encontrada.')
  }

  const transcriptResponse = await fetchWithTimeout(track.baseUrl, {}, 15000)
  if (!transcriptResponse.ok) {
    throw new Error('Falha ao baixar a transcricao do YouTube.')
  }

  const xml = await transcriptResponse.text()

  const segments: string[] = []
  const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g
  let textMatch
  while ((textMatch = textRegex.exec(xml)) !== null) {
    const decoded = decodeHtmlEntities(textMatch[1]).trim()
    if (decoded) segments.push(decoded)
  }

  if (!segments.length) {
    throw new Error('Transcricao vazia retornada pelo YouTube.')
  }

  const fullText = segments
    .join(' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (fullText.length < 50) {
    throw new Error('Transcricao muito curta para gerar conteudo.')
  }

  return {
    text: fullText,
    language: track.languageCode || 'auto',
    segmentCount: segments.length,
  }
}

// ---------------------------------------------------------------------------
// Gemini content-generation prompts
// ---------------------------------------------------------------------------

async function generateSummary(transcript: string) {
  return generateText({
    systemInstruction:
      'Voce e um especialista em educacao corporativa de energia solar. Seu papel e criar resumos executivos de alta qualidade para treinamento de vendedores.',
    prompt: [
      'Transcricao do video-aula:',
      transcript,
      '',
      'INSTRUCAO: Crie um resumo executivo claro e direto deste conteudo.',
      '- Maximo 400 palavras',
      '- Destaque os conceitos-chave uteis para vendedores de energia solar',
      '- Use linguagem acessivel e pt-BR',
      '- Formato: paragrafos curtos e objetivos',
      '- Nao use markdown com headers (#), apenas texto corrido com paragrafos',
      '- Comece direto com o conteudo, sem frases como "Neste video..." ou "O resumo..."',
    ].join('\n'),
    temperature: 0.3,
    maxOutputTokens: 800,
  })
}

async function generateMindMap(transcript: string) {
  return generateText({
    systemInstruction:
      'Voce e um especialista em organizacao de conteudo educacional para treinamento de vendas de energia solar. Crie mapas mentais claros e uteis.',
    prompt: [
      'Transcricao do video-aula:',
      transcript,
      '',
      'INSTRUCAO: Crie um mapa mental hierarquico em Markdown usando bullets aninhados.',
      '- Use "# Titulo" para o tema central (apenas 1 header)',
      '- Use "- " para ramos principais (de 4 a 8 ramos)',
      '- Use "  - " para sub-ramos (indentacao 2 espacos)',
      '- Maximo 4 niveis de profundidade',
      '- Cada ramo deve ter uma frase curta e objetiva',
      '- Foque nos conceitos mais importantes para vendedores solares',
      '- Nao inclua explicacoes longas dentro dos bullets',
    ].join('\n'),
    temperature: 0.25,
    maxOutputTokens: 900,
  })
}

async function generateAssessmentSuggestions(transcript: string, questionCount = 5) {
  const raw = await generateText({
    systemInstruction:
      'Voce e um especialista em avaliacao educacional para treinamento de vendas de energia solar. Crie questoes claras, praticas e relevantes.',
    prompt: [
      'Transcricao do video-aula:',
      transcript,
      '',
      `INSTRUCAO: Gere exatamente ${questionCount} sugestoes de questoes de avaliacao.`,
      '- Cada questao deve ser uma pergunta seguida de 4 alternativas (A, B, C, D) e a resposta correta',
      '- Foque em aplicacao pratica, nao memorizacao pura',
      '- Nivel de dificuldade: intermediario',
      '- Contexto: treinamento de vendedores de energia solar',
      '- Formato de cada questao:',
      '  Pergunta: [texto da pergunta]',
      '  A) [alternativa]',
      '  B) [alternativa]',
      '  C) [alternativa]',
      '  D) [alternativa]',
      '  Resposta: [letra]',
      '',
      '- Separe cada questao com uma linha em branco',
      '- Nao numere as questoes',
    ].join('\n'),
    temperature: 0.35,
    maxOutputTokens: 1400,
  })

  const blocks = raw
    .split(/\n{2,}/)
    .map((block: string) => block.trim())
    .filter((block: string) => block.length > 30 && /[A-D]\)/i.test(block))

  return blocks.length > 0 ? blocks : [raw.trim()]
}

// ---------------------------------------------------------------------------
// DB update helper
// ---------------------------------------------------------------------------

async function updateContent(
  supabase: ReturnType<typeof createServiceClient>,
  contentId: string,
  fields: Record<string, unknown>,
) {
  const { error } = await supabase.from('content').update(fields).eq('id', contentId)
  if (error) console.error(`[content-automation] Update failed for ${contentId}:`, error.message)
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function processContent(
  supabase: ReturnType<typeof createServiceClient>,
  item: any,
) {
  const {
    id,
    youtube_video_id,
    assessment_question_count,
    transcript_status,
    summary_status,
    mind_map_status,
  } = item

  await updateContent(supabase, id, {
    automation_status: 'processing',
    automation_error: null,
  })

  let transcript = item.transcript_text || ''

  // ---- Step 1: Transcript ----
  if (transcript_status !== 'ready' || !transcript) {
    try {
      await updateContent(supabase, id, { transcript_status: 'processing' })
      const result = await fetchYouTubeTranscript(youtube_video_id)
      transcript = result.text
      await updateContent(supabase, id, {
        transcript_status: 'ready',
        transcript_text: transcript,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar transcricao'
      await updateContent(supabase, id, {
        transcript_status: 'error',
        automation_status: 'error',
        automation_error: `Transcricao: ${msg}`,
        automation_processed_at: new Date().toISOString(),
      })
      throw err
    }
  }

  if (!transcript || transcript.length < 50) {
    await updateContent(supabase, id, {
      automation_status: 'error',
      automation_error: 'Transcricao muito curta ou vazia para gerar conteudo.',
      automation_processed_at: new Date().toISOString(),
    })
    throw new Error('Transcricao muito curta.')
  }

  const trimmed =
    transcript.length > 30000 ? transcript.slice(0, 30000) + '...' : transcript

  // ---- Step 2: Summary ----
  if (summary_status !== 'ready') {
    try {
      await updateContent(supabase, id, { summary_status: 'processing' })
      const summary = await generateSummary(trimmed)
      await updateContent(supabase, id, { summary_status: 'ready', summary_text: summary })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar resumo'
      await updateContent(supabase, id, {
        summary_status: 'error',
        automation_status: 'error',
        automation_error: `Resumo: ${msg}`,
        automation_processed_at: new Date().toISOString(),
      })
      throw err
    }
  }

  // ---- Step 3: Mind Map ----
  if (mind_map_status !== 'ready') {
    try {
      await updateContent(supabase, id, { mind_map_status: 'processing' })
      const mindMap = await generateMindMap(trimmed)
      await updateContent(supabase, id, { mind_map_status: 'ready', mind_map_markdown: mindMap })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar mapa mental'
      await updateContent(supabase, id, {
        mind_map_status: 'error',
        automation_status: 'error',
        automation_error: `Mapa mental: ${msg}`,
        automation_processed_at: new Date().toISOString(),
      })
      throw err
    }
  }

  // ---- Step 4: Assessment Suggestions ----
  try {
    const questions = await generateAssessmentSuggestions(
      trimmed,
      assessment_question_count || 5,
    )
    await updateContent(supabase, id, {
      assessment_suggestions: questions,
      automation_status: 'ready',
      automation_processed_at: new Date().toISOString(),
      automation_error: null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao gerar questoes de avaliacao'
    await updateContent(supabase, id, {
      automation_status: 'error',
      automation_error: `Questoes: ${msg}`,
      automation_processed_at: new Date().toISOString(),
    })
    throw err
  }
}

// ---------------------------------------------------------------------------
// Edge Function handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await requireAdmin(req)

    const { contentId } = await req.json()
    if (!contentId) return jsonError('contentId obrigatorio.', 400)

    const supabase = createServiceClient()

    const { data: item, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error || !item) return jsonError('Conteudo nao encontrado.', 404)
    if (!item.youtube_video_id) return jsonError('Conteudo sem youtube_video_id valido.', 400)

    await processContent(supabase, item)

    const { data: updated } = await supabase
      .from('content')
      .select(
        'automation_status, automation_error, automation_processed_at, transcript_status, summary_status, mind_map_status',
      )
      .eq('id', contentId)
      .single()

    return json({
      contentId,
      status: updated?.automation_status || 'unknown',
      transcript: updated?.transcript_status || 'unknown',
      summary: updated?.summary_status || 'unknown',
      mindMap: updated?.mind_map_status || 'unknown',
      error: updated?.automation_error || null,
      processedAt: updated?.automation_processed_at || null,
    })
  } catch (err) {
    console.error('Content Automation Edge Function Error:', err)
    return jsonError(
      err instanceof Error ? err.message : 'Erro no pipeline de automacao.',
      500,
    )
  }
})
