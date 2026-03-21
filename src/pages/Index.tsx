import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Play, Award, Zap, BrainCircuit, Leaf, Settings2, Target, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="transform -rotate-90 w-14 h-14">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-[#061B3B] transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-[#061B3B]">{value}%</span>
    </div>
  )
}

const trails = [
  {
    title: 'Cultura',
    desc: 'Solar Ethos & Engineering Values',
    modules: '8/10 Modules',
    progress: 75,
    tag: '',
  },
  {
    title: 'Técnico',
    desc: 'Advanced Photovoltaic Systems',
    modules: '15/36 Modules',
    progress: 42,
    tag: '',
  },
  {
    title: 'Psicologia',
    desc: 'High-Stress Leadership Protocols',
    modules: 'Master Level',
    progress: 90,
    tag: 'bg-slate-100 text-slate-600',
  },
  {
    title: 'Prática',
    desc: 'On-site Field Implementation',
    modules: 'New Unlock',
    progress: 12,
    tag: 'bg-blue-50 text-blue-600',
  },
]

const achievements = [
  { icon: Award, label: 'GOLD ARCHITECT', bg: 'bg-[#EAB308]', color: 'text-white' },
  { icon: Zap, label: 'ECO SILVER', bg: 'bg-slate-700', color: 'text-white' },
  { icon: Settings2, label: 'BRONZE MASTER', bg: 'bg-slate-300', color: 'text-slate-500' },
  { icon: Leaf, label: 'SOLAR RACER', bg: 'bg-[#061B3B]', color: 'text-[#EAB308]' },
  { icon: BrainCircuit, label: 'AI NEURAL LINK', bg: 'bg-[#061B3B]', color: 'text-cyan-400' },
]

export default function Index() {
  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in-up space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#061B3B] font-display uppercase tracking-tight">
            RIO SOL ACADEMY
          </h1>
          <p className="text-sm font-bold text-[#061B3B] tracking-widest uppercase">
            Operations Command
          </p>
        </div>
        <div className="flex items-center gap-8 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Zenith Level Progress</span>
              <span className="text-[#EAB308]">84%</span>
            </div>
            <Progress value={84} className="h-1.5 bg-slate-100 [&>div]:bg-[#EAB308]" />
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-100"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#061B3B]">Solar Architect Zenith</p>
              <p className="text-xs text-slate-500">Rank #12 Worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Hero */}
          <div className="relative rounded-[2rem] overflow-hidden h-[340px] shadow-sm border border-slate-200 group">
            <img
              src="https://img.usecurling.com/p/1200/600?q=modern%20solar%20building&color=gray"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061B3B]/95 via-[#061B3B]/80 to-transparent" />
            <div className="relative z-10 p-10 flex flex-col h-full justify-between">
              <Badge className="w-fit bg-[#EAB308] text-[#422006] hover:bg-[#EAB308] font-bold text-[10px] tracking-widest uppercase border-none px-3 py-1">
                Current Mission: Tier 4
              </Badge>
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display leading-[1.1]">
                  Grid Integration
                  <br />
                  Mastery Phase
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Execute the advanced synchronization protocols for the Atacama PV Hub. This
                  simulation requires 99.8% stability maintenance.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold h-12 px-6 rounded-xl border-none shadow-lg">
                  Launch Simulation
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white font-medium h-12 px-6 rounded-xl backdrop-blur-sm"
                >
                  Mission Brief
                </Button>
              </div>
            </div>
          </div>

          {/* Knowledge Trails */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#061B3B] font-display">Knowledge Trails</h3>
                <p className="text-sm text-slate-500">
                  Targeted development pathways for your specialization.
                </p>
              </div>
              <Link
                to="/trilhas"
                className="text-sm font-bold text-[#061B3B] hover:text-[#EAB308] transition-colors"
              >
                View All Trails
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trails.map((trail, idx) => (
                <Card
                  key={idx}
                  className="border-none shadow-sm rounded-[1.5rem] bg-white hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex items-center gap-6">
                    <CircularProgress value={trail.progress} label={trail.title} />
                    <div>
                      <h4 className="font-bold text-lg text-[#061B3B]">{trail.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{trail.desc}</p>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-500',
                          trail.tag,
                        )}
                      >
                        {trail.modules}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievement Vault */}
          <Card className="border-none shadow-sm rounded-[1.5rem] bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#061B3B] font-display flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#EAB308]" /> Achievement Vault
                </h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  24/50 Unlocked
                </span>
              </div>
              <div className="flex flex-wrap gap-6">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 w-24">
                    <div
                      className={cn(
                        'w-20 h-20 rounded-[1.25rem] flex items-center justify-center shadow-inner',
                        ach.bg,
                        ach.color,
                      )}
                    >
                      <ach.icon className="w-8 h-8" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center leading-tight">
                      {ach.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Brain Card */}
          <Card className="border-none shadow-xl rounded-[2rem] bg-[#061B3B] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <BrainCircuit className="w-48 h-48 text-white" />
            </div>
            <CardContent className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#EAB308] rounded-xl text-[#061B3B]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-wide">RIO SOL AI</h4>
                  <p className="text-[10px] text-[#EAB308] font-bold tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span>{' '}
                    Active • Neural Synapse
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="bg-white/10 text-slate-200 text-sm p-4 rounded-2xl rounded-tl-sm border border-white/5 leading-relaxed backdrop-blur-sm">
                  Zenith, I have analyzed your last simulation. Your peak efficiency was at 08:45
                  UTC. Focus on thermal dissipation for next run.
                </div>
                <div className="bg-[#EAB308]/10 text-white text-sm p-4 rounded-2xl rounded-tr-sm border border-[#EAB308]/20 leading-relaxed ml-6 text-right">
                  Understood. Show me the thermal hotspots from that session.
                </div>
              </div>

              <div className="relative mt-auto">
                <Input
                  placeholder="Ask AI Brain..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 pl-4 pr-12 focus-visible:ring-[#EAB308]"
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-9 w-9 bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-lg"
                >
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rankings Mini */}
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#061B3B] font-display">Global Rankings</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Week 42
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    rank: '01',
                    name: 'Sarah Flux',
                    role: 'High-Density Specialist',
                    xp: '12.8k XP',
                    active: false,
                  },
                  {
                    rank: '02',
                    name: 'Marcus Watt',
                    role: 'Grid Manager',
                    xp: '11.4k XP',
                    active: false,
                  },
                  {
                    rank: '12',
                    name: 'You (Zenith)',
                    role: 'Solar Architect',
                    xp: '9.2k XP',
                    active: true,
                  },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl border transition-colors',
                      user.active
                        ? 'bg-[#061B3B] border-[#061B3B] text-white'
                        : 'bg-white border-slate-100 hover:border-slate-200',
                    )}
                  >
                    <span
                      className={cn(
                        'font-black text-sm w-5 text-center',
                        user.active ? 'text-white' : 'text-slate-400',
                      )}
                    >
                      {user.rank}
                    </span>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg',
                        user.active ? 'bg-[#EAB308]' : 'bg-[#F4F6F8]',
                      )}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-bold text-sm truncate',
                          user.active ? 'text-white' : 'text-[#061B3B]',
                        )}
                      >
                        {user.name}
                      </p>
                      <p
                        className={cn(
                          'text-[10px] uppercase tracking-wider truncate',
                          user.active ? 'text-slate-300' : 'text-slate-500',
                        )}
                      >
                        {user.role}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold',
                        user.active ? 'text-[#EAB308]' : 'text-slate-500',
                      )}
                    >
                      {user.xp}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#061B3B]"
              >
                Full Rankings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
