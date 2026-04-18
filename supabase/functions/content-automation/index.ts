import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
    // DB_SERVICE_KEY is the JWT service role key set via CLI
    // (SUPABASE_SERVICE_ROLE_KEY may be overridden by a dashboard secret in wrong format)
    Deno.env.get('DB_SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

const createAuthedClient = (req: Request) =>
  createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })

// ---------------------------------------------------------------------------
// Admin verification (supports internal key bypass)
// ---------------------------------------------------------------------------

async function requireAdmin(req: Request) {
  const internalKey = Deno.env.get('INTERNAL_API_KEY') ?? ''
  const internalHeader = req.headers.get('x-internal-key') || ''
  if (internalKey && internalHeader === internalKey) return null

  const supabase = createAuthedClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()
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
// Gemini — generate content directly from YouTube URL
// Gemini 1.5+ supports YouTube video URLs natively as file parts
// ---------------------------------------------------------------------------

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 55000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

async function geminiRequest(body: Record<string, unknown>) {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('GEMINI_API_KEY nao configurada nas secrets do Supabase.')

  const model = getGeminiAgentModel()
  const response = await fetchWithTimeout(
    `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    55000,
  )

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini request failed: ${response.status}`)
  }

  const text =
    payload?.candidates
      ?.flatMap((c: any) => c?.content?.parts || [])
      .map((p: any) => p?.text || '')
      .join('')
      .trim() || ''

  if (!text) throw new Error('Gemini nao retornou texto.')
  return text
}

function buildYouTubeVideoPart(videoId: string) {
  return {
    fileData: {
      mimeType: 'video/youtube',
      fileUri: `https://www.youtube.com/watch?v=${videoId}`,
    },
  }
}

function youtubePart(videoId: string) {
  return { fileData: { mimeType: 'video/youtube', fileUri: `https://www.youtube.com/watch?v=${videoId}` } }
}

async function generateSummary(videoId: string): Promise<string> {
  return geminiRequest({
    contents: [{ role: 'user', parts: [
      youtubePart(videoId),
      { text: [
        'INSTRUCAO: Crie um resumo executivo CURTO e OBJETIVO desta aula.',
        '',
        'FORMATO OBRIGATORIO:',
        '**🎯 Objetivo da aula:** [1 frase direta]',
        '',
        '**📌 Principais aprendizados:**',
        '• [ponto 1 — max 15 palavras]',
        '• [ponto 2 — max 15 palavras]',
        '• [ponto 3 — max 15 palavras]',
        '• [ponto 4 — max 15 palavras]',
        '',
        '**💡 Aplicacao pratica:** [1-2 frases sobre como o vendedor usa isso no dia a dia]',
        '',
        'REGRAS:',
        '- Maximo 150 palavras no total',
        '- Linguagem direta, sem introducao',
        '- Foco total em aplicacao pratica para vendedores de energia solar',
        '- Nao repita o que esta no formato acima como exemplo, escreva o conteudo real',
      ].join('\n') },
    ]}],
    systemInstruction: { parts: [{ text: 'Especialista em educacao corporativa de energia solar. Crie resumos curtos, objetivos e praticos para vendedores.' }] },
    generationConfig: { temperature: 0.3, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
  })
}

async function generateMindMap(videoId: string): Promise<string> {
  return geminiRequest({
    contents: [{ role: 'user', parts: [
      youtubePart(videoId),
      { text: [
        'INSTRUCAO: Crie um mapa mental profissional em Markdown.',
        '',
        'FORMATO EXATO A SEGUIR — nao desvie:',
        '',
        '# 🧠 TITULO DO TEMA EM MAIUSCULAS',
        '',
        '## 🎯 NOME DO RAMO 1',
        '- Topico simples sem asterisco',
        '- Topico simples sem asterisco',
        '- Topico simples sem asterisco',
        '',
        '## 📊 NOME DO RAMO 2',
        '- Topico simples',
        '- Topico simples',
        '',
        'REGRAS ABSOLUTAS:',
        '1. NUNCA misture "**texto:**" com "- " no mesmo item. Escolha um ou outro.',
        '2. Itens de lista usam APENAS "- texto simples" — sem asteriscos nos bullets',
        '3. Negrito (**texto**) so dentro de paragrafos, nunca como prefixo de bullet',
        '4. Cada ramo tem apenas 1 nivel de bullets (sem sub-bullets indentados)',
        '5. De 4 a 6 ramos principais',
        '6. De 3 a 5 bullets por ramo',
        '7. Emojis diferentes para cada ramo (## 🎯, ## 📊, ## 💰, ## ⚙️, ## 🤝, ## 🔑)',
        '8. Bullets curtos: maximo 12 palavras cada',
        '9. Comece DIRETO com o "#" — sem texto antes',
      ].join('\n') },
    ]}],
    systemInstruction: { parts: [{ text: 'Voce e um especialista em visualizacao de conhecimento e treinamento de vendas de energia solar. Crie mapas mentais profissionais, organizados e visualmente atrativos.' }] },
    generationConfig: { temperature: 0.25, maxOutputTokens: 1200, thinkingConfig: { thinkingBudget: 0 } },
  })
}

async function generateAssessmentSuggestions(videoId: string, questionCount = 5): Promise<string[]> {
  const raw = await geminiRequest({
    contents: [{ role: 'user', parts: [
      youtubePart(videoId),
      { text: `INSTRUCAO: Gere exatamente ${questionCount} questoes de avaliacao.\nFormato: Pergunta: [texto]\nA) B) C) D)\nResposta: [letra]\nSepare com linha em branco. Nao numere.` },
    ]}],
    systemInstruction: { parts: [{ text: 'Especialista em avaliacao educacional para vendas de energia solar.' }] },
    generationConfig: { temperature: 0.35, maxOutputTokens: 1400, thinkingConfig: { thinkingBudget: 0 } },
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
// Main pipeline — uses Gemini with YouTube URL directly (no scraping needed)
// ---------------------------------------------------------------------------

async function processContent(
  supabase: ReturnType<typeof createServiceClient>,
  item: any,
) {
  const { id, youtube_video_id, assessment_question_count, summary_status, mind_map_status } = item

  await updateContent(supabase, id, {
    automation_status: 'processing',
    transcript_status: 'ready',
    transcript_text: `youtube:${youtube_video_id}`,
    automation_error: null,
  })

  const trimmed = youtube_video_id

  const needsSummary = summary_status !== 'ready'
  const needsMindMap = mind_map_status !== 'ready'

  const processingUpdate: Record<string, unknown> = {}
  if (needsSummary) processingUpdate.summary_status = 'processing'
  if (needsMindMap) processingUpdate.mind_map_status = 'processing'
  if (Object.keys(processingUpdate).length > 0) {
    await updateContent(supabase, id, processingUpdate)
  }

  // Run summary, mind map and quiz in parallel using transcript text
  const [summaryResult, mindMapResult, questionsResult] = await Promise.allSettled([
    needsSummary ? generateSummary(trimmed) : Promise.resolve(null),
    needsMindMap ? generateMindMap(trimmed) : Promise.resolve(null),
    generateAssessmentSuggestions(trimmed, assessment_question_count || 5),
  ])

  const errors: string[] = []
  const finalUpdate: Record<string, unknown> = {}

  if (summaryResult.status === 'fulfilled' && summaryResult.value !== null) {
    finalUpdate.summary_status = 'ready'
    finalUpdate.summary_text = summaryResult.value
  } else if (summaryResult.status === 'rejected') {
    const msg = summaryResult.reason instanceof Error ? summaryResult.reason.message : 'Erro ao gerar resumo'
    finalUpdate.summary_status = 'error'
    errors.push(`Resumo: ${msg}`)
  }

  if (mindMapResult.status === 'fulfilled' && mindMapResult.value !== null) {
    finalUpdate.mind_map_status = 'ready'
    finalUpdate.mind_map_markdown = mindMapResult.value
  } else if (mindMapResult.status === 'rejected') {
    const msg = mindMapResult.reason instanceof Error ? mindMapResult.reason.message : 'Erro ao gerar mapa mental'
    finalUpdate.mind_map_status = 'error'
    errors.push(`Mapa mental: ${msg}`)
  }

  if (questionsResult.status === 'fulfilled') {
    finalUpdate.assessment_suggestions = questionsResult.value
  } else {
    const msg = questionsResult.reason instanceof Error ? questionsResult.reason.message : 'Erro ao gerar questoes'
    errors.push(`Questoes: ${msg}`)
  }

  if (errors.length > 0) {
    finalUpdate.automation_status = 'error'
    finalUpdate.automation_error = errors.join(' | ')
    finalUpdate.automation_processed_at = new Date().toISOString()
  } else {
    finalUpdate.automation_status = 'ready'
    finalUpdate.automation_error = null
    finalUpdate.automation_processed_at = new Date().toISOString()
  }

  await updateContent(supabase, id, finalUpdate)

  if (errors.length > 0) {
    throw new Error(errors.join(' | '))
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
      .select('automation_status, automation_error, automation_processed_at, summary_status, mind_map_status')
      .eq('id', contentId)
      .single()

    return json({
      contentId,
      status: updated?.automation_status || 'unknown',
      summary: updated?.summary_status || 'unknown',
      mindMap: updated?.mind_map_status || 'unknown',
      error: updated?.automation_error || null,
      processedAt: updated?.automation_processed_at || null,
    })
  } catch (err) {
    console.error('Content Automation Error:', err)
    return jsonError(
      err instanceof Error ? err.message : 'Erro no pipeline de automacao.',
      500,
    )
  }
})
