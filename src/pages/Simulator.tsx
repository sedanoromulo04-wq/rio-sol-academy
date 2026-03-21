import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Mic, Send, History, Play, CheckCircle2, Circle, Sparkles, Bot, User } from 'lucide-react'

const persona = {
  name: 'The Skeptical Farmer',
  type: 'Persona: High Resistance, High Logic',
  img: 'https://img.usecurling.com/ppl/large?gender=male&seed=42',
  stats: [
    { label: 'Patience', val: 24 },
    { label: 'Technical Literacy', val: 88 },
    { label: 'Budget Sensitivity', val: 95 },
  ],
}

export default function Simulator() {
  const [input, setInput] = useState('')

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-1">
            Engineering Environment: Simulation Active
          </p>
          <h1 className="text-4xl font-black text-[#061B3B] font-display tracking-tight">
            Roleplay Lab
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white border-slate-200 text-[#061B3B] font-semibold h-11 px-6 rounded-xl shadow-sm"
          >
            <History className="w-4 h-4 mr-2 text-slate-400" /> View History
          </Button>
          <Button className="bg-[#061B3B] hover:bg-[#0a2955] text-white font-semibold h-11 px-6 rounded-xl shadow-md">
            <Play className="w-4 h-4 mr-2 text-[#EAB308]" fill="currentColor" /> Start Simulation
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-6 min-h-0">
        {/* Left Panel: Persona */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden shrink-0">
            <div className="h-64 overflow-hidden relative">
              <img
                src={persona.img}
                alt={persona.name}
                className="w-full h-full object-cover grayscale opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-sm font-medium px-2 py-0.5 mb-2">
                  High Logic
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-[#061B3B] font-display mb-1">
                {persona.name}
              </h2>
              <p className="text-xs text-slate-500 mb-6">{persona.type}</p>

              <div className="space-y-4">
                {persona.stats.map((s) => (
                  <div key={s.label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#061B3B] uppercase tracking-wider">
                      <span>{s.label}</span>
                      <span className="text-slate-400">{s.val}%</span>
                    </div>
                    <Progress value={s.val} className="h-1.5 bg-slate-100 [&>div]:bg-[#061B3B]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-3xl bg-[#061B3B] text-white shrink-0">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                Tactical Objectives
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#EAB308] shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">
                    Validate ROI over 5 years
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">
                    Address maintenance fears
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">
                    Mirror regional dialect
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Chat */}
        <Card className="border-none shadow-sm rounded-3xl bg-white flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-[#061B3B] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Simulation
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex gap-4">
              <span>
                Elapsed: <span className="text-[#061B3B]">04:12</span>
              </span>
              <span>
                Tokens: <span className="text-[#061B3B]">1,402</span>
              </span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8 pb-4">
              {/* AI Message */}
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <Bot className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                    <p>
                      Look, son. I've had three different solar outfits come through here in the
                      last decade. They all promise the sun and the moon, but when the hail starts
                      coming down in April, none of 'em can tell me if my panels will still be
                      generating enough to run the irrigation system. Why are you any different?
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-2 block">
                    The Skeptical Farmer • 2m ago
                  </span>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-[#061B3B] flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="bg-[#061B3B] p-5 rounded-2xl rounded-tr-none text-white leading-relaxed shadow-md">
                    <p>
                      I completely understand that hesitation. Most companies focus on the "tech"
                      but forget about the resilience. Our RIO SOL "Iron-Clad" panels are tested
                      against 2-inch hail impact at 80mph. If they fail, our Zenith insurance covers
                      the lost production, not just the hardware. Here is the engineering spec...
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mr-2 block text-right">
                    You • 1m ago
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] rounded-l-xl z-10" />
              <Input
                placeholder="Type your response to the Farmer..."
                className="bg-slate-50 border-slate-200 shadow-inner h-14 pl-6 pr-24 rounded-xl text-base focus-visible:ring-[#061B3B] focus-visible:border-[#061B3B] w-full"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#061B3B]">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-lg h-10 w-10 shadow-md"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel: Feedback */}
        <div className="flex flex-col gap-6 overflow-y-auto pl-2 pb-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white shrink-0">
            <CardContent className="p-6">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Live Feedback
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Persuasion', val: 72, color: 'bg-[#EAB308]' },
                  { label: 'Framework Adherence', val: 89, color: 'bg-[#061B3B]' },
                  { label: 'Tone (Empathy)', val: 54, color: 'bg-slate-300' },
                ].map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#061B3B]">
                      <span>{s.label}</span>
                      <span>{s.val}%</span>
                    </div>
                    <Progress
                      value={s.val}
                      className="h-2 bg-slate-100 [&>div]:transition-all"
                      style={{ '--progress-background': s.color } as any}
                    >
                      <div
                        className={`h-full w-full flex-1 transition-all ${s.color}`}
                        style={{ transform: `translateX(-${100 - (s.val || 0)}%)` }}
                      />
                    </Progress>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white relative overflow-hidden shrink-0">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#061B3B]" />
            <CardContent className="p-6 pl-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#061B3B]" /> AI Coach Insight
              </h3>
              <p className="text-sm text-[#061B3B] font-medium italic leading-relaxed mb-6">
                "Excellent pivot to durability. However, your tone shifted too quickly into sales
                language. The farmer values regional solidarity—try using more 'we' instead of 'I'."
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Try this phrase:
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  "Our folks around here haven't seen a storm yet that's cracked these..."
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <Card className="border-none shadow-sm rounded-2xl bg-white text-center py-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Objections
              </p>
              <p className="text-3xl font-black text-[#061B3B] font-display">
                3<span className="text-xl text-slate-300">/12</span>
              </p>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white text-center py-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Clarity
              </p>
              <p className="text-2xl font-black text-[#061B3B] font-display mt-1">High</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
