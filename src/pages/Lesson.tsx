import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Play, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Lesson() {
  const [reflectionState, setReflectionState] = useState<'idle' | 'simulating' | 'feedback'>('idle')
  const [reflectionText, setReflectionText] = useState('')

  const handleSimulate = () => {
    if (!reflectionText.trim()) return
    setReflectionState('simulating')
    setTimeout(() => {
      setReflectionState('feedback')
    }, 2500)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-20">
      <Link
        to="/trilhas"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Trilhas
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Badge className="mb-2 bg-orange-500/20 text-orange-500 border-none">
            Módulo 3 • Aula 2
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Lidando com objeções de preço e ROI
          </h1>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10 shadow-elevation group flex items-center justify-center">
        <img
          src="https://img.usecurling.com/p/1280/720?q=solar%20panel%20presentation&color=blue"
          alt="Video cover"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform relative z-10 shadow-lg"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none h-auto p-0 space-x-6">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 text-base"
          >
            Conteúdo da Aula
          </TabsTrigger>
          <TabsTrigger
            value="reflection"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 text-base"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Reflexão IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="py-6 space-y-4 text-slate-300 leading-relaxed">
          <p>
            Nesta aula, exploramos a diferença entre "Preço" e "Valor". Quando um cliente diz que a
            energia solar é muito cara, ele geralmente está olhando apenas para o custo inicial
            (CAPEX) e não para a economia a longo prazo (OPEX).
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-2">Principais Tópicos:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Como apresentar o Payback (Tempo de retorno do investimento).</li>
            <li>O impacto da inflação energética nos próximos 10 anos.</li>
            <li>
              Gatilhos mentais de segurança: "Você prefere alugar sua energia para sempre ou ser
              dono dela?"
            </li>
          </ul>
        </TabsContent>

        <TabsContent value="reflection" className="py-6">
          <Card className="glass-panel border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              {reflectionState === 'idle' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-primary/20 rounded-full text-primary mt-1">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Cenário Dinâmico</h3>
                      <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                        O cliente diz: "Olha, eu entendi os benefícios, mas R$ 35.000,00 é muito
                        dinheiro agora. Acho que vou deixar para o ano que vem."
                        <br />
                        <br />
                        <strong>
                          Como você responderia a essa objeção usando os conceitos aprendidos?
                        </strong>
                      </p>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    className="min-h-[150px] bg-background border-white/10 focus-visible:ring-primary text-base p-4"
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSimulate} disabled={!reflectionText.trim()}>
                      Enviar para Análise IA
                    </Button>
                  </div>
                </div>
              )}

              {reflectionState === 'simulating' && (
                <div className="space-y-6 py-4 animate-fade-in">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-medium animate-pulse">
                      A IA está analisando sua resposta...
                    </span>
                  </div>
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-[90%] bg-slate-800" />
                  <Skeleton className="h-4 w-[95%] bg-slate-800" />
                  <Skeleton className="h-4 w-[60%] bg-slate-800" />
                </div>
              )}

              {reflectionState === 'feedback' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex justify-between items-start border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-500" /> Feedback Concluído
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Você ganhou <span className="text-primary font-bold">+50 XP</span> por esta
                        reflexão.
                      </p>
                    </div>
                    <div className="text-center bg-slate-800 p-3 rounded-xl border border-white/5">
                      <div className="text-2xl font-bold text-primary">8.5</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Nota IA
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Pontos Fortes
                      </h4>
                      <p className="text-sm text-slate-300 bg-green-500/10 p-4 rounded-lg border border-green-500/20 leading-relaxed">
                        Você identificou corretamente o medo da descapitalização e usou o conceito
                        de Payback muito bem. A transição para mostrar que o dinheiro investido
                        volta para ele foi clara e empática.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-orange-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Oportunidade de Melhoria
                      </h4>
                      <p className="text-sm text-slate-300 bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 leading-relaxed">
                        Você poderia ter adicionado o fator "Inflação Energética". Quando ele diz
                        "deixar para o ano que vem", lembre-o que a conta de luz continuará subindo
                        nesse período, custando dinheiro que não tem retorno.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReflectionState('idle')
                        setReflectionText('')
                      }}
                    >
                      Tentar Novamente
                    </Button>
                    <Button className="ml-4" asChild>
                      <Link to="/trilhas">Avançar para Próxima Aula</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
