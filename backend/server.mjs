import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const bridgePath = path.join(__dirname, 'notebooklm_bridge.py')
const port = Number(process.env.NOTEBOOKLM_BACKEND_PORT || 3002)
const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://localhost:8080',
])
const jobs = new Map()

const sendJson = (response, statusCode, payload, origin = '') => {
  if (response.destroyed || response.writableEnded) return
  const allowOrigin = allowedOrigins.has(origin) ? origin : '*'
  try {
    response.writeHead(statusCode, {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    })
    response.end(JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to send backend response:', error)
  }
}

const readBody = async (request) => {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const runBridge = (command, payload = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn('python', [bridgePath, command], {
      cwd: repoRoot,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => reject(error))

    child.on('close', (code) => {
      const parseBridgePayload = () => {
        try {
          return JSON.parse(stdout)
        } catch {
          return null
        }
      }

      if (code !== 0) {
        const bridgePayload = parseBridgePayload()
        if (bridgePayload?.error?.message) {
          reject(new Error(bridgePayload.error.message))
          return
        }
        reject(new Error(stderr || stdout || `Bridge exited with code ${code}`))
        return
      }

      try {
        resolve(parseBridgePayload())
      } catch (error) {
        reject(new Error(`Invalid bridge response: ${stdout || stderr || error.message}`))
      }
    })

    child.stdin.write(JSON.stringify(payload))
    child.stdin.end()
  })

const createJob = (kind, runner) => {
  const timestamp = new Date().toISOString()
  const job = {
    id: randomUUID(),
    kind,
    status: 'queued',
    createdAt: timestamp,
    updatedAt: timestamp,
    result: null,
    error: null,
  }

  jobs.set(job.id, job)

  queueMicrotask(async () => {
    job.status = 'in_progress'
    job.updatedAt = new Date().toISOString()

    try {
      job.result = await runner()
      job.status = 'completed'
    } catch (error) {
      job.status = 'failed'
      job.error = {
        message: error instanceof Error ? error.message : 'Unknown job error.',
      }
    } finally {
      job.updatedAt = new Date().toISOString()
    }
  })

  return job
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || ''
  const url = new URL(request.url || '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true }, origin)
    return
  }

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(
        response,
        200,
        {
          ok: true,
          service: 'notebooklm-backend',
          bridge: path.relative(repoRoot, bridgePath),
        },
        origin,
      )
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/notebooklm/status') {
      const result = await runBridge('status')
      sendJson(response, 200, result, origin)
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/notebooklm/notebooks') {
      const result = await runBridge('list_notebooks')
      sendJson(response, 200, result, origin)
      return
    }

    const notebookMatch = url.pathname.match(/^\/api\/notebooklm\/notebooks\/([^/]+)$/)
    if (request.method === 'GET' && notebookMatch) {
      const notebookId = decodeURIComponent(notebookMatch[1])
      const result = await runBridge('get_notebook', { notebookId })
      sendJson(response, 200, result, origin)
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/notebooklm/podcast') {
      const payload = await readBody(request)
      const job = createJob('podcast', () => runBridge('generate_podcast', payload))
      sendJson(response, 202, { ok: true, data: job }, origin)
      return
    }

    const jobMatch = url.pathname.match(/^\/api\/notebooklm\/jobs\/([^/]+)$/)
    if (request.method === 'GET' && jobMatch) {
      const jobId = decodeURIComponent(jobMatch[1])
      const job = jobs.get(jobId)
      if (!job) {
        sendJson(response, 404, { ok: false, error: { message: 'Job not found.' } }, origin)
        return
      }
      sendJson(response, 200, { ok: true, data: job }, origin)
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/notebooklm/ask') {
      const payload = await readBody(request)
      const result = await runBridge('ask', payload)
      sendJson(response, 200, result, origin)
      return
    }

    sendJson(response, 404, { ok: false, error: { message: 'Route not found.' } }, origin)
  } catch (error) {
    sendJson(
      response,
      500,
      {
        ok: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown backend error.',
        },
      },
      origin,
    )
  }
})

server.requestTimeout = 0
server.headersTimeout = 0
server.keepAliveTimeout = 60_000

server.listen(port, '127.0.0.1', () => {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
  console.log(`${pkg.name} NotebookLM backend listening on http://127.0.0.1:${port}`)
})
