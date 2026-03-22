import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Play,
  Settings,
  Maximize,
  Activity,
  Server,
  Database,
  Send,
  MoreVertical,
  Wifi,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const chartData = [
  { time: '6:00', value: 12 },
  { time: '7:00', value: 18 },
  { time: '15:00', value: 25 },
  { time: '21:00', value: 19 },
  { time: '3:00', value: 28 },
]

export default function AdminDashboard() {
  const [msg, setMsg] = useState('')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 xl:gap-8 max-w-[1600px] mx-auto animate-fade-in-up pb-10">
      {/* Left Column - Main Content */}
      <div className="space-y-6 lg:space-y-8 flex flex-col min-w-0">
        {/* Central Analytics View */}
        <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative aspect-[16/9] md:aspect-[21/9] flex flex-col">
          <img
            src="https://img.usecurling.com/p/1200/600?q=solar%20farm%20abstract&color=blue"
            alt="Platform Visual"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b18] via-[#020b18]/40 to-transparent" />

          <div className="relative z-10 flex-1 flex flex-col justify-end p-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 font-display">
                Platform Performance Summary
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Executive overview of global learning kinetic energy and overall training health
                across all 14 deployed sectors. System synchronization is optimal.
              </p>
            </div>

            {/* Player Controls mock (as seen in image) */}
            <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/10 mt-auto">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
              >
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              </Button>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-[#EAB308]"></div>
                <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#EAB308] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)] -ml-1.5"></div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white h-8 w-8"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPI Dashboard (Live Resources) */}
        <div>
          <h3 className="text-xl font-bold text-white mb-5 font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#EAB308]" /> Live Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Card 1: Active Users */}
            <Card className="glass-panel bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h4 className="text-sm font-bold text-white">Active Users (Daily)</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{' '}
                  Live
                </div>
              </div>
              <div className="flex-1 h-[120px] w-full -ml-3">
                <ChartContainer config={{ value: { color: '#EAB308' } }} className="h-full w-full">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      width={25}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </Card>

            {/* Card 2: Global Completion Rate (Gauge) */}
            <Card className="glass-panel bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-white">Global Completion Rate</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="relative w-40 h-20 overflow-hidden mb-2">
                  <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - 125.6 * 0.78}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[65deg] transition-all duration-1000">
                    <div className="w-1 h-14 bg-white rounded-full -translate-y-2 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#020b18]"></div>
                    </div>
                  </div>
                </div>
                <h5 className="text-2xl font-black text-white">78%</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#EAB308] mr-1.5"></span>{' '}
                  Optimal
                </p>
              </div>
            </Card>

            {/* Card 3: Content Volume */}
            <Card className="glass-panel bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-sm font-bold text-white">Content Volume</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <h5 className="text-5xl font-black text-white font-display leading-none">1.2k</h5>
                  <span className="text-sm text-slate-400 font-medium pb-1">Hours</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Capacity Limit</span>
                    <span className="text-[#EAB308]">85%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#EAB308]/50 to-[#EAB308] w-[85%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 4: System Status */}
            <Card className="glass-panel bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-sm font-bold text-white">System Status</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center flex-1 pb-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                    <Server className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Main Node
                    </span>
                    <span className="text-xs font-bold text-white">99.9%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/20 flex items-center justify-center shadow-inner relative">
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></div>
                    <Database className="w-6 h-6 text-[#EAB308]" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Storage
                    </span>
                    <span className="text-xs font-bold text-white">Active</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                    <Wifi className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Network
                    </span>
                    <span className="text-xs font-bold text-white">12ms</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                    <Cpu className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      AI Core
                    </span>
                    <span className="text-xs font-bold text-white">Stable</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Column - Management Intelligence Panel */}
      <Card className="glass-panel bg-white/[0.02] border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-hidden max-h-[85vh] lg:max-h-[calc(100vh-8rem)] sticky top-28">
        <div className="p-5 pb-0 shrink-0">
          <h3 className="text-xl font-bold text-white font-display mb-4">Management Panel</h3>
        </div>

        <Tabs defaultValue="tracks" className="flex-1 flex flex-col min-h-0">
          <div className="px-5 shrink-0">
            <TabsList className="bg-[#020b18]/80 border border-white/10 w-full h-11 p-1 rounded-xl">
              <TabsTrigger
                value="tracks"
                className="flex-1 rounded-lg data-[state=active]:bg-[#061b3b] data-[state=active]:text-white text-slate-400 text-xs font-bold"
              >
                Top Tracks
              </TabsTrigger>
              <TabsTrigger
                value="feed"
                className="flex-1 rounded-lg data-[state=active]:bg-[#061b3b] data-[state=active]:text-white text-slate-400 text-xs font-bold"
              >
                Activity Feed
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Top Tracks Tab */}
          <TabsContent
            value="tracks"
            className="flex-1 overflow-y-auto p-5 mt-0 space-y-4 outline-none"
          >
            {[
              {
                title: 'Advanced PV Systems',
                module: 'Module 1',
                prog: 85,
                time: '8h 30m',
                active: true,
              },
              {
                title: 'Smart Grid Integration',
                module: 'Module 2',
                prog: 32,
                time: '6h 15m',
                active: false,
              },
              {
                title: 'Battery Storage',
                module: 'Module 3',
                prog: 73,
                time: '5h 45m',
                active: false,
              },
              {
                title: 'Designing Layouts',
                module: 'Module 4',
                prog: 10,
                time: '4h 20m',
                active: false,
              },
              {
                title: 'Inverter Topology',
                module: 'Module 5',
                prog: 95,
                time: '3h 10m',
                active: false,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={cn(
                  'p-4 rounded-2xl border transition-colors',
                  t.active
                    ? 'bg-white/10 border-white/20 shadow-lg shadow-black/20'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]',
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {t.module}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{t.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-white -mr-2 -mt-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mb-3">
                  <Progress value={t.prog} className="h-1.5 bg-white/10 [&>div]:bg-[#EAB308]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> {t.time}
                  </span>
                  <span className="text-[#EAB308]">{t.prog}% Avg Complete</span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="feed" className="flex-1 flex flex-col min-h-0 mt-0 outline-none">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white/10 border border-white/10 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed">
                  System Broadcast: "Advanced PV Systems" track has been updated with 3 new lessons.
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Admin • 14:30
                </span>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%] self-end items-end ml-auto">
                <div className="bg-[#EAB308] text-[#061b3b] p-3 rounded-2xl rounded-tr-sm text-sm font-medium leading-relaxed">
                  Noted. I'll notify the Pacific Division squad to review the new materials.
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mr-1">
                  You • 14:35
                </span>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="bg-white/10 border border-white/10 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed">
                  Marcus Thorne just achieved "Zenith Level" in the roleplay simulator.
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  System • 15:10
                </span>
              </div>

              <div className="flex flex-col gap-1 max-w-[85%] self-end items-end ml-auto">
                <div className="bg-[#EAB308] text-[#061b3b] p-3 rounded-2xl rounded-tr-sm text-sm font-medium leading-relaxed">
                  Send him the priority lead list!
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mr-1">
                  You • 15:15
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#020b18]/50 shrink-0">
              <div className="relative">
                <Input
                  placeholder="Broadcast a message..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl pr-12 h-11 focus-visible:ring-[#EAB308]"
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-8 w-8 bg-[#EAB308] hover:bg-[#d97706] text-[#061b3b] rounded-lg"
                >
                  <Send className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
