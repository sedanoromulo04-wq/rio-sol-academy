const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const defaultEmbeddingModel = () => process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2-preview'
const defaultEmbeddingDimension = () => Number(process.env.GEMINI_EMBEDDING_DIMENSION || 768)
const defaultAgentModel = () => process.env.GEMINI_AGENT_MODEL || 'gemini-2.5-flash'

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ''

const readTextResponse = (payload) =>
  payload?.text ||
  payload?.candidates
    ?.flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || '')
    .join('')
    .trim() ||
  ''

async function geminiRequest(endpoint, body) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada no backend local.')
  }

  const response = await fetch(`${GEMINI_API_BASE}/${endpoint}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error?.status ||
      `Gemini request failed with status ${response.status}.`
    throw new Error(message)
  }

  return payload
}

const normalizeVector = (values) => {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))
  if (!magnitude) return values
  return values.map((value) => value / magnitude)
}

export async function embedTexts(
  texts,
  {
    model = defaultEmbeddingModel(),
    taskType,
    outputDimensionality = defaultEmbeddingDimension(),
  } = {},
) {
  const cleanTexts = texts.map((text) => `${text || ''}`.trim()).filter(Boolean)
  if (cleanTexts.length === 0) return []

  const embeddings = []
  for (const text of cleanTexts) {
    const payload = {
      model: `models/${model}`,
      content: {
        parts: [{ text }],
      },
    }

    if (taskType) payload.taskType = taskType
    if (outputDimensionality) payload.output_dimensionality = outputDimensionality

    const result = await geminiRequest(`models/${model}:embedContent`, payload)
    const vector = normalizeVector(result?.embedding?.values || result?.embeddings?.[0]?.values || [])
    embeddings.push(vector)
  }

  return embeddings
}

export async function embedSingleText(text, options = {}) {
  const [embedding] = await embedTexts([text], options)
  return embedding || []
}

export async function generateText({
  prompt,
  systemInstruction,
  temperature = 0.35,
  maxOutputTokens = 900,
  thinkingBudget,
  model = defaultAgentModel(),
}) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  }

  if (Number.isFinite(thinkingBudget)) {
    payload.generationConfig.thinkingConfig = {
      thinkingBudget,
    }
  }

  if (systemInstruction?.trim()) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction.trim() }],
    }
  }

  const result = await geminiRequest(`models/${model}:generateContent`, payload)
  const text = readTextResponse(result)
  if (!text) {
    throw new Error('Gemini nao retornou texto para esta solicitacao.')
  }
  return text
}

export function getGeminiRuntimeConfig() {
  return {
    hasApiKey: Boolean(getApiKey()),
    embeddingModel: defaultEmbeddingModel(),
    embeddingDimension: defaultEmbeddingDimension(),
    agentModel: defaultAgentModel(),
  }
}
