import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, BrainCircuit, Bot, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

import LivreView from '@/components/dashboard/LivreView'
import StreakView from '@/components/dashboard/StreakView'
import useSystemStore from '@/stores/useSystemStore'

export default function Index() {
  const { isStreakModeGlobal, weeklyFocus } = useSystemStore()
  const [localStreakMode, setLocalStreakMode] = useState(true)

  // Only use streak mode if global is enabled AND user wants it locally
  const isStreakMode = isStreakModeGlobal && localStreakMode

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in-up space-y-6">
      {/* Weekly Focus Banner */}
      {weeklyFocus && (
        <div className="bg-[#061B3B] p-5 rounded-2xl shadow-lg border border-[#EAB308]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#EAB308]/10 blur-3xl rounded-full pointer-events-none" />
          <div className="p-3.5 bg-[#EAB308] rounded-xl text-[#061B3B] shrink-0 relative z-10 shadow-lg shadow-[#EAB308]/20">
            <Target className="w-6 h-6" />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-xs font-black text-[#EAB308] uppercase tracking-widest mb-1.5 flex items-center gap-2">
              Foco da Semana
              <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                SISTEMA CENTRAL
              </span>
            </h3>
            <p className="text-white text-sm md:text-base font-medium leading-relaxed">
              {weeklyFocus}
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#061B3B] font-display uppercase tracking-tight">
            Painel de Comando Executivo
          </h1>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">
            Modo de Treinamento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Mode Toggle (Only visible if globally enabled) */}
          {isStreakModeGlobal && (
            <div className="flex items-center gap-3 bg-white py-1.5 px-3 rounded-xl shadow-sm border border-slate-200">
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors',
                  isStreakMode ? 'text-[#d97706]' : 'text-slate-400',
                )}
              >
                Ofensiva
              </span>
              <Switch
                checked={!localStreakMode}
                onCheckedChange={(c) => setLocalStreakMode(!c)}
                className="data-[state=checked]:bg-[#061B3B] data-[state=unchecked]:bg-[#EAB308]"
              />
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors',
                  !isStreakMode ? 'text-[#061B3B]' : 'text-slate-400',
                )}
              >
                Livre
              </span>
            </div>
          )}

          {/* Zenith Progress */}
          <div className="hidden md:flex items-center gap-6 bg-white py-2 px-4 rounded-xl shadow-sm border border-slate-100">
            <div className="w-32 space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Progresso Zenith</span>
                <span className="text-[#EAB308]">84%</span>
              </div>
              <Progress value={84} className="h-1 bg-slate-100 [&>div]:bg-[#EAB308]" />
            </div>
            <div className="w-px h-6 bg-slate-100"></div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#061B3B]">12.8k XP</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Arquiteto Solar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Left Column: Dynamic Mode Content */}
        <div className="space-y-6 min-w-0">{isStreakMode ? <StreakView /> : <LivreView />}</div>

        {/* Right Column: AI Brain & Rankings */}
        <div className="space-y-6">
          {/* AI Brain Card */}
          <Card className="border-none shadow-sm rounded-3xl bg-[#061B3B] overflow-hidden relative flex flex-col h-[400px]">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-white" />
            </div>
            <CardContent className="p-5 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#EAB308] rounded-lg text-[#061B3B]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">RIO SOL AI</h4>
                  <p className="text-[9px] text-[#EAB308] font-bold tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span>{' '}
                    Ativa
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4 flex-1 overflow-y-auto pr-1">
                <div className="bg-white/10 text-slate-200 text-xs p-3 rounded-xl rounded-tl-sm border border-white/5 leading-relaxed backdrop-blur-sm">
                  {isStreakMode
                    ? 'Zenith, não se esqueça: você está a poucos passos de garantir sua ofensiva de hoje! Recomendamos iniciar pelo Simulador de Objeções para aquecer.'
                    : 'Zenith, analisei sua última simulação. Sua eficiência máxima foi às 08:45 UTC. Foco na dissipação térmica para a próxima rodada no Modo Livre.'}
                </div>
                <div className="bg-[#EAB308]/10 text-white text-xs p-3 rounded-xl rounded-tr-sm border border-[#EAB308]/20 leading-relaxed ml-6 text-right">
                  Entendido. Mostre-me os pontos de calor dessa sessão.
                </div>
              </div>

              <div className="relative mt-auto shrink-0">
                <Input
                  placeholder="Pergunte à IA..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg h-10 pl-3 pr-10 text-sm focus-visible:ring-[#EAB308]"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-md"
                >
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rankings Mini */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-[#061B3B] font-display">Ranking Global</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Semana 42
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    rank: '01',
                    name: 'Marcus Thorne',
                    role: 'Arquiteto Principal',
                    xp: '31.2k XP',
                    active: false,
                  },
                  {
                    rank: '02',
                    name: 'Elena Vance',
                    role: 'Especialista de Grid',
                    xp: '24.8k XP',
                    active: false,
                  },
                  {
                    rank: '14',
                    name: 'Você (Zenith)',
                    role: 'Arquiteto Solar',
                    xp: '12.8k XP',
                    active: true,
                  },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl border transition-colors',
                      user.active
                        ? 'bg-[#061B3B] border-[#061B3B] text-white'
                        : 'bg-white border-slate-100 hover:border-slate-200',
                    )}
                  >
                    <span
                      className={cn(
                        'font-black text-xs w-4 text-center',
                        user.active ? 'text-white' : 'text-slate-400',
                      )}
                    >
                      {user.rank}
                    </span>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md shrink-0 bg-cover bg-center',
                        user.active ? 'border-2 border-[#EAB308]' : 'bg-slate-200',
                      )}
                      style={{
                        backgroundImage: `url('https://img.usecurling.com/p/100/100?q=portrait&seed=${idx}')`,
                      }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-bold text-xs truncate',
                          user.active ? 'text-white' : 'text-[#061B3B]',
                        )}
                      >
                        {user.name}
                      </p>
                      <p
                        className={cn(
                          'text-[9px] uppercase tracking-wider truncate',
                          user.active ? 'text-slate-300' : 'text-slate-500',
                        )}
                      >
                        {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
