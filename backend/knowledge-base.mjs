import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data')
const STORE_PATH = path.join(DATA_DIR, 'knowledge-base.json')

const emptyStore = () => ({
  version: 1,
  updatedAt: null,
  notebooks: {},
})

const normalizeWhitespace = (text) =>
  `${text || ''}`
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const splitSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÿ0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

export function chunkKnowledgeText(text, maxChars = 1600, overlapChars = 250) {
  const cleanText = normalizeWhitespace(text)
  if (!cleanText) return []
  if (cleanText.length <= maxChars) return [cleanText]

  const sentences = splitSentences(cleanText)
  if (sentences.length === 0) return [cleanText.slice(0, maxChars)]

  const chunks = []
  let buffer = ''

  const pushBuffer = () => {
    const nextChunk = buffer.trim()
    if (!nextChunk) return
    chunks.push(nextChunk)
    buffer = nextChunk.slice(Math.max(0, nextChunk.length - overlapChars))
  }

  for (const sentence of sentences) {
    const candidate = buffer ? `${buffer} ${sentence}`.trim() : sentence
    if (candidate.length <= maxChars) {
      buffer = candidate
      continue
    }

    pushBuffer()
    buffer = sentence

    while (buffer.length > maxChars) {
      chunks.push(buffer.slice(0, maxChars).trim())
      buffer = buffer.slice(Math.max(0, maxChars - overlapChars)).trim()
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim())
  return [...new Set(chunks)]
}

async function ensureStoreDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function loadKnowledgeBase() {
  await ensureStoreDir()
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      ...emptyStore(),
      ...parsed,
      notebooks: parsed?.notebooks || {},
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return emptyStore()
    }
    throw error
  }
}

export async function saveKnowledgeBase(store) {
  await ensureStoreDir()
  const payload = {
    ...store,
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(STORE_PATH, JSON.stringify(payload, null, 2), 'utf8')
  return payload
}

export function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || !left.length) {
    return 0
  }
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index] || 0
    const b = right[index] || 0
    dot += a * b
    leftMagnitude += a * a
    rightMagnitude += b * b
  }

  if (!leftMagnitude || !rightMagnitude) return 0
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}

export async function upsertKnowledgeSource({
  notebookId,
  notebookTitle,
  source,
  rawContent,
  embeddings,
  embeddingModel,
  embeddingDimension,
}) {
  const store = await loadKnowledgeBase()
  const notebook = store.notebooks[notebookId] || {
    id: notebookId,
    title: notebookTitle || 'Notebook sem titulo',
    updatedAt: null,
    sources: {},
    chunks: [],
  }

  const chunks = chunkKnowledgeText(rawContent)
  const indexedChunks = chunks.map((text, index) => ({
    id: randomUUID(),
    notebookId,
    sourceId: source.id,
    sourceTitle: source.title || 'Fonte sem titulo',
    sourceKind: source.kind || 'unknown',
    sourceUrl: source.url || null,
    text,
    chunkIndex: index,
    embedding: embeddings[index] || [],
  }))

  notebook.title = notebookTitle || notebook.title
  notebook.updatedAt = new Date().toISOString()
  notebook.sources[source.id] = {
    id: source.id,
    title: source.title || 'Fonte sem titulo',
    kind: source.kind || 'unknown',
    url: source.url || null,
    indexedAt: notebook.updatedAt,
    charCount: normalizeWhitespace(rawContent).length,
    chunkCount: indexedChunks.length,
    embeddingModel,
    embeddingDimension,
  }
  notebook.chunks = [
    ...notebook.chunks.filter((chunk) => chunk.sourceId !== source.id),
    ...indexedChunks,
  ]

  store.notebooks[notebookId] = notebook
  await saveKnowledgeBase(store)

  return {
    sourceCount: Object.keys(notebook.sources).length,
    chunkCount: notebook.chunks.length,
    indexedSource: notebook.sources[source.id],
  }
}

export async function getKnowledgeBaseStats(notebookId) {
  const store = await loadKnowledgeBase()
  const notebook = store.notebooks[notebookId]
  if (!notebook) {
    return {
      sourceCount: 0,
      chunkCount: 0,
      updatedAt: null,
    }
  }

  return {
    sourceCount: Object.keys(notebook.sources || {}).length,
    chunkCount: (notebook.chunks || []).length,
    updatedAt: notebook.updatedAt || null,
  }
}

export async function searchKnowledgeBase({ notebookIds, queryEmbedding, limit = 6 }) {
  const store = await loadKnowledgeBase()
  const selectedNotebookIds =
    notebookIds && notebookIds.length > 0 ? notebookIds : Object.keys(store.notebooks)

  const matches = []
  for (const notebookId of selectedNotebookIds) {
    const notebook = store.notebooks[notebookId]
    if (!notebook) continue

    for (const chunk of notebook.chunks || []) {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding || [])
      matches.push({
        ...chunk,
        notebookTitle: notebook.title,
        score,
      })
    }
  }

  return matches.sort((left, right) => right.score - left.score).slice(0, limit)
}
