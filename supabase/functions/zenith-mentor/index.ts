import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  buildMentorSystemPrompt,
  createAgentReply,
  createAuthedClient,
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
    const messages = Array.isArray(payload.messages) ? payload.messages : []

    const [{ data: profile, error: profileError }, { data: activities, error: activitiesError }, promptConfig] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        loadPromptConfig(supabase),
      ])

    if (profileError) throw new Error(profileError.message)
    if (activitiesError) throw new Error(activitiesError.message)

    const result = await createAgentReply({
      supabase,
      userId: user.id,
      messages,
      question: latestUserMessage(messages),
      agentKind: 'mentor',
      systemInstruction: buildMentorSystemPrompt({
        profile,
        activities: activities || [],
        promptConfig,
      }),
      extraInstructions:
        'Responda como mentor comercial senior. Use a base indexada para embasar a orientacao quando possivel. Sempre conclua sua resposta com frases completas.',
      temperature: 0.4,
      maxOutputTokens: 650,
      thinkingBudget: 0,
    })

    return json(result)
  } catch (error) {
    console.error('Zenith Mentor Edge Function Error:', error)
    return jsonError(error instanceof Error ? error.message : 'Erro ao consultar o Mentor Zenith.', 400)
  }
})
