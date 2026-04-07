import { createClient } from '@supabase/supabase-js'
import { loadDotEnv } from './env.mjs'
import { generateText } from './gemini.mjs'

loadDotEnv()

// ---------------------------------------------------------------------------
// Supabase admin client (service role key — bypasses RLS)
// ---------------------------------------------------------------------------

const getSupabaseAdmin = () => {
  const url = process.env.VITE_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// YouTube transcript fetcher
// ---------------------------------------------------------------------------

const fetchYouTubeTranscript = async (videoId) => {
  // Dynamic import because youtube-transcript is ESM-only
  const { YoutubeTranscript } = await import('youtube-transcript')

  // Try Portuguese first, then English, then any available
  const languagePriorities = [
    ['pt', 'pt-BR'],
    ['en', 'en-US'],
    [],
  ]

  for (const langs of languagePriorities) {
    try {
      const options = langs.length > 0 ? { lang: langs[0] } : {}
      const segments = await YoutubeTranscript.fetchTranscript(videoId, options)

      if (segments && segments.length > 0) {
        const fullText = segments.map((seg) => seg.text).join(' ')
        const cleaned = fullText
          .replace(/\[.*?\]/g, '')
          .replace(/\s+/g, ' ')
          .trim()

        if (cleaned.length > 50) {
          return { text: cleaned, language: langs[0] || 'auto', segmentCount: segments.length }
        }
      }
    } catch {
      // Try next language
    }
  }

  throw new Error(
    'Transcrição não disponível para este vídeo. ' +
    'Verifique se o YouTube já gerou as legendas automáticas (pode levar alguns minutos após o upload).',
  )
}

// ---------------------------------------------------------------------------
// Gemini prompts for content generation
// ---------------------------------------------------------------------------

const generateSummary = async (transcript) => {
  const prompt = [
    'Transcrição do vídeo-aula:',
    transcript,
    '',
    'INSTRUÇÃO: Crie um resumo executivo claro e direto deste conteúdo.',
    '- Máximo 400 palavras',
    '- Destaque os conceitos-chave úteis para vendedores de energia solar',
    '- Use linguagem acessível e pt-BR',
    '- Formato: parágrafos curtos e objetivos',
    '- Não use markdown com headers (#), apenas texto corrido com parágrafos',
    '- Comece direto com o conteúdo, sem frases como "Neste vídeo..." ou "O resumo..."',
  ].join('\n')

  return generateText({
    systemInstruction:
      'Você é um especialista em educação corporativa de energia solar. Seu papel é criar resumos executivos de alta qualidade para treinamento de vendedores.',
    prompt,
    temperature: 0.3,
    maxOutputTokens: 800,
    thinkingBudget: 0,
  })
}

const generateMindMap = async (transcript) => {
  const prompt = [
    'Transcrição do vídeo-aula:',
    transcript,
    '',
    'INSTRUÇÃO: Crie um mapa mental hierárquico em Markdown usando bullets aninhados.',
    '- Use "# Título" para o tema central (apenas 1 header)',
    '- Use "- " para ramos principais (de 4 a 8 ramos)',
    '- Use "  - " para sub-ramos (indentação 2 espaços)',
    '- Máximo 4 níveis de profundidade',
    '- Cada ramo deve ter uma frase curta e objetiva',
    '- Foque nos conceitos mais importantes para vendedores solares',
    '- Não inclua explicações longas dentro dos bullets',
  ].join('\n')

  return generateText({
    systemInstruction:
      'Você é um especialista em organização de conteúdo educacional para treinamento de vendas de energia solar. Crie mapas mentais claros e úteis.',
    prompt,
    temperature: 0.25,
    maxOutputTokens: 900,
    thinkingBudget: 0,
  })
}

const generateAssessmentSuggestions = async (transcript, questionCount = 5) => {
  const prompt = [
    'Transcrição do vídeo-aula:',
    transcript,
    '',
    `INSTRUÇÃO: Gere exatamente ${questionCount} sugestões de questões de avaliação.`,
    '- Cada questão deve ser uma pergunta seguida de 4 alternativas (A, B, C, D) e a resposta correta',
    '- Foque em aplicação prática, não memorização pura',
    '- Nível de dificuldade: intermediário',
    '- Contexto: treinamento de vendedores de energia solar',
    '- Formato de cada questão:',
    '  Pergunta: [texto da pergunta]',
    '  A) [alternativa]',
    '  B) [alternativa]',
    '  C) [alternativa]',
    '  D) [alternativa]',
    '  Resposta: [letra]',
    '',
    '- Separe cada questão com uma linha em branco',
    '- Não numere as questões — elas serão numeradas automaticamente pelo sistema',
  ].join('\n')

  const raw = await generateText({
    systemInstruction:
      'Você é um especialista em avaliação educacional para treinamento de vendas de energia solar. Crie questões claras, práticas e relevantes.',
    prompt,
    temperature: 0.35,
    maxOutputTokens: 1400,
    thinkingBudget: 0,
  })

  // Parse the raw text into individual question blocks
  const blocks = raw
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 30 && /[A-D]\)/i.test(block))

  return blocks.length > 0 ? blocks : [raw.trim()]
}

// ---------------------------------------------------------------------------
// Update helpers — write partial results to Supabase
// ---------------------------------------------------------------------------

const updateContentField = async (supabase, contentId, fields) => {
  const { error } = await supabase
    .from('content')
    .update(fields)
    .eq('id', contentId)

  if (error) {
    console.error(`[automation] Falha ao atualizar content ${contentId}:`, error.message)
  }
}

// ---------------------------------------------------------------------------
// Main pipeline — processes a single content item end-to-end
// ---------------------------------------------------------------------------

const processContentItem = async (supabase, item) => {
  const { id, youtube_video_id, assessment_question_count, transcript_status, summary_status, mind_map_status } = item
  const videoId = youtube_video_id

  console.log(`[automation] Processando conteúdo "${item.title}" (${id}) — vídeo: ${videoId}`)

  // Mark as processing
  await updateContentField(supabase, id, {
    automation_status: 'processing',
    automation_error: null,
  })

  let transcript = item.transcript_text || ''

  // ---- Step 1: Transcript ----
  if (transcript_status !== 'ready' || !transcript) {
    try {
      await updateContentField(supabase, id, { transcript_status: 'processing' })

      const result = await fetchYouTubeTranscript(videoId)
      transcript = result.text

      await updateContentField(supabase, id, {
        transcript_status: 'ready',
        transcript_text: transcript,
      })

      console.log(`[automation] ✅ Transcrição OK — ${result.segmentCount} segmentos, idioma: ${result.language}`)
    } catch (transcriptError) {
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Erro ao buscar transcrição'
      
      if (errorMessage.toLowerCase().includes('não disponível')) {
        console.warn(`[automation] ⏳ Legendas não prontas para vídeo ${videoId}. Na geladeira por 3 minutos.`)
        // Coloca no delay (geladeira) do worker para não bloquear outros vídeos
        RETRY_MAP.set(id, Date.now() + TRANSCRIPT_RETRY_DELAY_MS)
        
        await updateContentField(supabase, id, {
          automation_error: `Legendas do YouTube ainda não geradas. O sistema tentará novamente em 3 minutos...`,
          // Volta o status para queued para que o worker pegue na próxima vez
          automation_status: 'queued',
        })
        return
      }

      console.error(`[automation] ❌ Transcrição falhou:`, errorMessage)

      await updateContentField(supabase, id, {
        transcript_status: 'error',
        automation_status: 'error',
        automation_error: `Transcrição: ${errorMessage}`,
        automation_processed_at: new Date().toISOString(),
      })
      return
    }
  }

  // Guard: need transcript to continue
  if (!transcript || transcript.length < 50) {
    await updateContentField(supabase, id, {
      automation_status: 'error',
      automation_error: 'Transcrição muito curta ou vazia para gerar conteúdo.',
      automation_processed_at: new Date().toISOString(),
    })
    return
  }

  // Limit transcript size for Gemini (avoid token overflow)
  const trimmedTranscript = transcript.length > 100000 ? transcript.slice(0, 100000) + '...' : transcript

  // ---- Step 2: Summary ----
  if (summary_status !== 'ready') {
    try {
      await updateContentField(supabase, id, { summary_status: 'processing' })

      const summary = await generateSummary(trimmedTranscript)

      await updateContentField(supabase, id, {
        summary_status: 'ready',
        summary_text: summary,
      })

      console.log(`[automation] ✅ Resumo OK — ${summary.length} caracteres`)
    } catch (summaryError) {
      const errorMessage = summaryError instanceof Error ? summaryError.message : 'Erro ao gerar resumo'
      console.error(`[automation] ❌ Resumo falhou:`, errorMessage)

      await updateContentField(supabase, id, {
        summary_status: 'error',
        automation_status: 'error',
        automation_error: `Resumo: ${errorMessage}`,
        automation_processed_at: new Date().toISOString(),
      })
      return
    }
  }

  // ---- Step 3: Mind Map ----
  if (mind_map_status !== 'ready') {
    try {
      await updateContentField(supabase, id, { mind_map_status: 'processing' })

      const mindMap = await generateMindMap(trimmedTranscript)

      await updateContentField(supabase, id, {
        mind_map_status: 'ready',
        mind_map_markdown: mindMap,
      })

      console.log(`[automation] ✅ Mapa mental OK — ${mindMap.length} caracteres`)
    } catch (mindMapError) {
      const errorMessage = mindMapError instanceof Error ? mindMapError.message : 'Erro ao gerar mapa mental'
      console.error(`[automation] ❌ Mapa mental falhou:`, errorMessage)

      await updateContentField(supabase, id, {
        mind_map_status: 'error',
        automation_status: 'error',
        automation_error: `Mapa mental: ${errorMessage}`,
        automation_processed_at: new Date().toISOString(),
      })
      return
    }
  }

  // ---- Step 4: Assessment Suggestions ----
  try {
    const questionCount = assessment_question_count || 5
    const suggestions = await generateAssessmentSuggestions(trimmedTranscript, questionCount)

    await updateContentField(supabase, id, {
      assessment_suggestions: suggestions,
      automation_status: 'ready',
      automation_processed_at: new Date().toISOString(),
      automation_error: null,
    })

    console.log(`[automation] ✅ Sugestões de prova OK — ${suggestions.length} questões geradas`)
  } catch (assessmentError) {
    const errorMessage = assessmentError instanceof Error ? assessmentError.message : 'Erro ao gerar sugestões de prova'
    console.error(`[automation] ❌ Sugestões de prova falharam:`, errorMessage)

    await updateContentField(supabase, id, {
      automation_status: 'error',
      automation_error: `Sugestões de prova: ${errorMessage}`,
      automation_processed_at: new Date().toISOString(),
    })
    return
  }

  console.log(`[automation] 🎉 Pipeline completo para "${item.title}" (${id})`)
}

// ---------------------------------------------------------------------------
// Worker loop — polls Supabase for queued items
// ---------------------------------------------------------------------------

let workerRunning = false
let isProcessing = false
let lastProcessedAt = null
let totalProcessed = 0
let totalErrors = 0
let workerIntervalId = null

// Evita que o sistema de polling fique preso em um vídeo sem legenda
// armazena: { [contentId]: nextRetryTimestampMs }
const RETRY_MAP = new Map()
const TRANSCRIPT_RETRY_DELAY_MS = 3 * 60 * 1000 // 3 minutes in milliseconds

const pollAndProcess = async () => {
  if (isProcessing) return

  const supabase = getSupabaseAdmin()
  if (!supabase) return

  try {
    const { data: queuedItems, error } = await supabase
      .from('content')
      .select('*')
      .eq('automation_status', 'queued')
      .not('youtube_video_id', 'is', null)
      .order('automation_requested_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('[automation] Erro ao consultar fila:', error.message)
      return
    }

    if (!queuedItems || queuedItems.length === 0) return

    const now = Date.now()
    // Encontra o primeiro item que não está "na geladeira" aguardando o delay de retry
    const item = queuedItems.find(i => {
      const nextRetry = RETRY_MAP.get(i.id) || 0
      return now >= nextRetry
    })

    if (!item) {
      // Todos os itens na fila estão em período de carência (waiting for youtube)
      return
    }

    isProcessing = true

    try {
      await processContentItem(supabase, item)
      // Se processou com sucesso ou deu erro fatal, tiramos do MAP
      RETRY_MAP.delete(item.id)
      totalProcessed += 1
      lastProcessedAt = new Date().toISOString()
    } catch (processingError) {
      totalErrors += 1
      console.error('[automation] Erro geral no pipeline:', processingError)

      await updateContentField(supabase, item.id, {
        automation_status: 'error',
        automation_error:
          processingError instanceof Error ? processingError.message : 'Erro desconhecido no pipeline.',
        automation_processed_at: new Date().toISOString(),
      })
    } finally {
      isProcessing = false
    }
  } catch (pollError) {
    console.error('[automation] Erro no polling:', pollError)
    isProcessing = false
  }
}

export const startAutomationWorker = () => {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    console.warn(
      '[automation] ⚠️  Worker NÃO iniciado — SUPABASE_SERVICE_ROLE_KEY não configurada no .env',
    )
    return
  }

  if (workerRunning) {
    console.warn('[automation] Worker já está rodando.')
    return
  }

  workerRunning = true
  const intervalMs = Number(process.env.AUTOMATION_POLL_INTERVAL_MS || 15000)

  console.log(`[automation] 🚀 Worker iniciado — polling a cada ${intervalMs / 1000}s`)

  // Run immediately on startup, then poll
  pollAndProcess()
  workerIntervalId = setInterval(pollAndProcess, intervalMs)
}

export const stopAutomationWorker = () => {
  if (workerIntervalId) {
    clearInterval(workerIntervalId)
    workerIntervalId = null
  }
  workerRunning = false
  console.log('[automation] Worker parado.')
}

export const getAutomationWorkerStatus = () => ({
  running: workerRunning,
  processing: isProcessing,
  lastProcessedAt,
  totalProcessed,
  totalErrors,
  hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
})

export const processContentById = async (contentId) => {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env')
  }

  const { data: item, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single()

  if (error || !item) {
    throw new Error(`Conteúdo ${contentId} não encontrado.`)
  }

  if (!item.youtube_video_id) {
    throw new Error('Este conteúdo não tem um youtube_video_id válido.')
  }

  // Force queue status so pipeline picks it up
  await updateContentField(supabase, contentId, {
    automation_status: 'queued',
    automation_error: null,
    automation_requested_at: new Date().toISOString(),
  })

  // Se o usuário clicou para processar agora, limpa o delay
  RETRY_MAP.delete(contentId)

  // Process immediately
  await processContentItem(supabase, {
    ...item,
    automation_status: 'queued',
    transcript_status: item.transcript_status === 'ready' ? 'ready' : 'idle',
    summary_status: item.summary_status === 'ready' ? 'ready' : 'idle',
    mind_map_status: item.mind_map_status === 'ready' ? 'ready' : 'idle',
  })

  const { data: updated } = await supabase
    .from('content')
    .select('automation_status, automation_error, automation_processed_at')
    .eq('id', contentId)
    .single()

  return {
    contentId,
    status: updated?.automation_status || 'unknown',
    error: updated?.automation_error || null,
    processedAt: updated?.automation_processed_at || null,
  }
}
