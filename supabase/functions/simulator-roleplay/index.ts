import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, persona } = await req.json()

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

    if (!GROQ_API_KEY && !OPENROUTER_API_KEY) {
      throw new Error('Nenhuma chave de API (GROQ ou OPENROUTER) configurada nos secrets.')
    }

    const systemPrompt = `Você é um cliente em um Roleplay de Vendas de Energia Solar.
Seu papel (Persona): ${persona.name}.
Seu perfil: ${persona.type}.
Seus atributos:
- Paciência: ${persona.stats[0].val}%
- Conhecimento Técnico: ${persona.stats[1].val}%
- Sensibilidade Financeira: ${persona.stats[2].val}%

Instruções Estritas:
- Responda SEMPRE encenando o papel deste cliente.
- Suas falas devem ser curtas, diretas e naturais de uma conversa de negociação falada.
- NUNCA saia do personagem. NUNCA diga que é uma IA.
- Mantenha suas reações alinhadas com as estatísticas do perfil. Se a paciência for baixa, seja rude/impaciente se o vendedor enrolar. Se a sensibilidade financeira for alta, foque implacavelmente no preço e retorno.
- Se o vendedor não souber lidar com suas objeções, continue resistindo e ameace não fechar o negócio.
- Seja realista, faça perguntas difíceis.
`

    let response

    if (GROQ_API_KEY) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      })
    }

    if (!response || !response.ok) {
      if (OPENROUTER_API_KEY) {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://riosolacademy.com',
            'X-Title': 'RIO SOL Academy Simulator',
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
          }),
        })
      } else {
        throw new Error('Groq failed and no OpenRouter fallback available.')
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`API Error: ${response.status} - Falha ao processar a resposta.`)
    }

    const aiData = await response.json()
    const reply = aiData.choices?.[0]?.message?.content || '...'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Simulator Roleplay Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
