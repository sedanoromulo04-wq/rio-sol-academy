import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  assertAdminAccess,
  createAuthedClient,
  importMemoryContent,
  json,
  jsonError,
  requireAuthenticatedUser,
} from '../_shared/agent-runtime.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createAuthedClient(req)
    const user = await requireAuthenticatedUser(supabase)
    await assertAdminAccess(supabase, user.id)

    const payload = await req.json()
    const result = await importMemoryContent({
      supabase,
      userId: user.id,
      title: `${payload.title || 'Documento sem titulo'}`.trim(),
      content: `${payload.content || ''}`,
      visibility: payload.visibility === 'private' ? 'private' : 'global',
      agentKinds: Array.isArray(payload.agentKinds) ? payload.agentKinds : ['mentor'],
    })

    return json(result)
  } catch (error) {
    console.error('Agent Memory Import Edge Function Error:', error)
    return jsonError(error instanceof Error ? error.message : 'Erro ao importar memoria.', 400)
  }
})
