import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  applyPromptOverridesToInstruction,
  buildMentorFeedbackSystemPrompt,
  createAuthedClient,
  createStructuredMentorFeedback,
  json,
  jsonError,
  latestUserMessage,
  loadPromptConfig,
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
    const payload = await req.json()
    const messages =
      Array.isArray(payload.messages) && payload.messages.length > 0
        ? payload.messages
        : [{ role: 'user', content: payload.userMessage || '' }]
    const persona = payload.persona || {}
    const promptConfig = await loadPromptConfig(supabase)

    const result = await createStructuredMentorFeedback({
      supabase,
      userId: user.id,
      messages,
      question: latestUserMessage(messages),
      persona,
      systemInstruction: applyPromptOverridesToInstruction(
        buildMentorFeedbackSystemPrompt(persona),
        promptConfig,
        'mentorFeedback',
      ),
    })

    return json(result)
  } catch (error) {
    console.error('Mentor Feedback Edge Function Error:', error)
    return jsonError(error instanceof Error ? error.message : 'Erro ao gerar feedback.', 400)
  }
})
