import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mic, Send, Bot, User, BarChart, PhoneOff } from 'lucide-react'

const personas = [
  {
    id: 1,
    name: 'Sr. Antônio',
    type: 'Fazendeiro Tradicional',
    difficulty: 'Fácil',
    img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=4',
    description:
      'Focado em economizar na conta de luz da propriedade. Desconfiado de novas tecnologias.',
  },
  {
    id: 2,
    name: 'Roberto',
    type: 'Empresário focado em ROI',
    difficulty: 'Médio',
    img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=8',
    description: 'Quer saber números exatos, payback e garantias contratuais.',
  },
  {
    id: 3,
    name: 'Dra. Carla',
    type: 'Família Sustentável',
    difficulty: 'Difícil',
    img: 'https://img.usecurling.com/ppl/medium?gender=female&seed=12',
    description: 'Preocupada com estética do telhado, impacto ambiental e marcas dos equipamentos.',
  },
]

type Message = { id: number; text: string; sender: 'ai' | 'user' }

export default function Simulator() {
  const [selectedPersona, setSelectedPersona] = useState<(typeof personas)[0] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [simulationEnded, setSimulationEnded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const startSimulation = (persona: (typeof personas)[0]) => {
    setSelectedPersona(persona)
    setSimulationEnded(false)
    setMessages([
      {
        id: 1,
        text: `Olá, bom dia! Vi o anúncio da RIO SOL e resolvi ligar. Meu nome é ${persona.name.split(' ')[0]}.`,
        sender: 'ai',
      },
    ])
  }

  const handleSend = () => {
    if (!input.trim() || simulationEnded) return
    const newMsg: Message = { id: Date.now(), text: input, sender: 'user' }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      const responses = [
        'Entendi, mas quanto isso vai me custar afinal?',
        'E se chover muito? Eu fico sem energia?',
        'Me falaram que a manutenção disso é caríssima, é verdade?',
        'Olha, eu preciso pensar melhor, parece muito complexo.',
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      if (messages.length > 5) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: 'Ok, entendi seus pontos. Vou analisar a proposta e retorno. Obrigado!',
            sender: 'ai',
          },
        ])
        setTimeout(() => setSimulationEnded(true), 1500)
      } else {
        setMessages((prev) => [...prev, { id: Date.now(), text: randomResponse, sender: 'ai' }])
      }
    }, 2000)
  }

  const handleEnd = () => {
    setSimulationEnded(true)
  }

  if (!selectedPersona) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Simulador de Roleplay</h1>
          <p className="text-muted-foreground">
            Escolha um perfil de cliente e pratique seus argumentos em tempo real com a IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className="glass-panel border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer"
              onClick={() => startSimulation(persona)}
            >
              <CardContent className="p-6 text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto border-4 border-slate-800">
                  <AvatarImage src={persona.img} />
                  <AvatarFallback>{persona.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-xl text-white">{persona.name}</h3>
                  <p className="text-sm text-primary mb-2">{persona.type}</p>
                  <Badge variant="outline" className="border-white/10 text-muted-foreground">
                    Dificuldade: {persona.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{persona.description}</p>
                <Button className="w-full mt-4" variant="secondary">
                  Iniciar Simulação
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Chat Header */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-t-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={selectedPersona.img} />
            <AvatarFallback>
              <Bot />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-white">{selectedPersona.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Em chamada com IA
            </div>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleEnd} disabled={simulationEnded}>
          <PhoneOff className="w-4 h-4 mr-2" /> Encerrar
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-none border-t-0 border-b-0 overflow-hidden relative">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-6 pb-20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 shrink-0 border border-white/10">
                    <AvatarFallback
                      className={
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-slate-800'
                      }
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-primary/90 text-primary-foreground rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%] flex-row">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-slate-800">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 rounded-2xl bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Feedback Overlay */}
        {simulationEnded && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in z-20">
            <Card className="max-w-lg w-full glass-panel border-primary/30 shadow-[0_0_50px_rgba(251,191,36,0.1)]">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <BarChart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Relatório de Performance</CardTitle>
                <CardDescription>
                  Análise da IA sobre sua simulação com {selectedPersona.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <span className="font-semibold text-slate-300">Nota Final</span>
                  <span className="text-3xl font-bold text-primary">7.8</span>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-white text-sm">Feedback Específico:</h4>
                  <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                    <li>Boa escuta ativa no início da conversa.</li>
                    <li>Você demorou a abordar a objeção de preço com firmeza.</li>
                    <li>Faltou usar o gatilho de escassez no fechamento.</li>
                  </ul>
                </div>
                <div className="pt-4 flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedPersona(null)}
                  >
                    Voltar aos Perfis
                  </Button>
                  <Button className="flex-1" onClick={() => startSimulation(selectedPersona)}>
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 glass-panel rounded-b-xl border-t border-white/5">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="shrink-0"
            title="Falar (Simulação de voz)"
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Digite sua resposta ou use o microfone..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={simulationEnded || isTyping}
            className="bg-background/50 border-white/10 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={!input.trim() || simulationEnded || isTyping}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
