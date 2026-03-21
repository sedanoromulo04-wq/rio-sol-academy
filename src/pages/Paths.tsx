import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sparkles, Cpu, UserCircle, Wrench, Clock, BarChart2, Play } from 'lucide-react'

export default function Paths() {
  return (
    <div className="max-w-6xl space-y-10 animate-fade-in-up">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-[#EAB308] text-[#422006] hover:bg-[#EAB308] rounded-sm text-[10px] font-black px-2.5 py-0.5 tracking-wider border-none uppercase">
            Library System
          </Badge>
          <h1 className="text-4xl md:text-[56px] font-black text-[#061B3B] tracking-tight font-display">
            Knowledge Brain
          </h1>
        </div>
        <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">
          Access the foundational logic of the RIO SOL ecosystem. Deep-dive into architectural
          trails designed for professional evolution.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            className="rounded-full px-6 bg-[#061B3B] hover:bg-[#0a2955] text-white font-semibold"
          >
            All Trails
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 text-slate-600 border-slate-300 hover:bg-white bg-transparent font-semibold"
          >
            Cultura
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 text-slate-600 border-slate-300 hover:bg-white bg-transparent font-semibold"
          >
            Técnico
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 text-slate-600 border-slate-300 hover:bg-white bg-transparent font-semibold"
          >
            Psicologia
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 text-slate-600 border-slate-300 hover:bg-white bg-transparent font-semibold"
          >
            Prática
          </Button>
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">
          Sort By: <span className="text-[#061B3B] ml-2">Most Recent</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cultura Card */}
        <Card className="rounded-3xl border-none shadow-sm shadow-slate-200/50 flex flex-col bg-white">
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Cultura
              </span>
            </div>
            <h3 className="text-[28px] font-bold text-[#061B3B] mb-8 leading-[1.1] font-display">
              Solar
              <br />
              Philosophy &
              <br />
              Ethics
            </h3>
            <div className="mt-auto">
              <Separator className="mb-6 bg-slate-100 h-0.5" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>12 Modules</span>
                <span className="text-[#9B751D]">85% Complete</span>
              </div>
              <Progress value={85} className="h-1.5 mb-8 bg-slate-100 [&>div]:bg-[#D97706]" />
              <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> 6h 30m
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-slate-400" /> Advanced
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Técnico Card */}
        <Card className="rounded-3xl border-none shadow-sm shadow-slate-200/50 flex flex-col bg-white">
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                <Cpu className="w-7 h-7" />
              </div>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Técnico
              </span>
            </div>
            <h3 className="text-[28px] font-bold text-[#061B3B] mb-8 leading-[1.1] font-display">
              Photovoltaic
              <br />
              Core
              <br />
              Engineering
            </h3>
            <div className="mt-auto">
              <Separator className="mb-6 bg-slate-100 h-0.5" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>24 Modules</span>
                <span className="text-[#9B751D]">32% Complete</span>
              </div>
              <Progress value={32} className="h-1.5 mb-8 bg-slate-100 [&>div]:bg-[#D97706]" />
              <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> 18h 45m
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-slate-400" /> Expert
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Psicologia Card */}
        <Card className="rounded-3xl border-none shadow-sm shadow-slate-200/50 flex flex-col bg-white">
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                <UserCircle className="w-7 h-7" />
              </div>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Psicologia
              </span>
            </div>
            <h3 className="text-[28px] font-bold text-[#061B3B] mb-8 leading-[1.1] font-display">
              The
              <br />
              Architecture
              <br />
              of Persuasion
            </h3>
            <div className="mt-auto">
              <Separator className="mb-6 bg-slate-100 h-0.5" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>8 Modules</span>
                <span className="text-slate-400">0% Complete</span>
              </div>
              <Progress value={0} className="h-1.5 mb-8 bg-slate-100 [&>div]:bg-[#D97706]" />
              <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> 4h 20m
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-slate-400" /> Intermediate
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Field Deployment Mastery (Prática) - Wide Card */}
        <Card className="rounded-3xl border-none shadow-sm shadow-slate-200/50 lg:col-span-2 overflow-hidden flex flex-col md:flex-row p-2.5 bg-white">
          <div className="p-8 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                  <Wrench className="w-7 h-7" />
                </div>
                <span className="bg-[#9B751D]/10 text-[#9B751D] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Prática
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#061B3B] mb-4 font-display">
                Field
                <br />
                Deployment
                <br />
                Mastery
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-sm font-medium">
                Advanced simulation modules for real-world hardware integration and solar grid
                synchronization.
              </p>
            </div>
            <div>
              <Separator className="mb-6 bg-slate-100 h-0.5" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                <span>32 Modules</span>
                <span className="text-[#9B751D]">55% Complete</span>
              </div>
              <Progress value={55} className="h-1.5 bg-slate-100 [&>div]:bg-[#D97706]" />
            </div>
          </div>
          <div className="relative md:w-[45%] bg-slate-100 rounded-[20px] overflow-hidden min-h-[300px] m-2 md:m-0">
            <img
              src="https://img.usecurling.com/p/800/600?q=tree%20grass"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Video Preview"
            />
            <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all flex items-center justify-center group cursor-pointer">
              <button className="w-16 h-12 bg-[#9B751D] group-hover:bg-[#b48a27] group-hover:scale-105 transition-all rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>
        </Card>

        {/* Upcoming Card */}
        <Card className="rounded-3xl border-none shadow-xl shadow-[#061B3B]/10 bg-[#061B3B] text-white p-8 flex flex-col justify-between">
          <div>
            <span className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-8 inline-block">
              Upcoming
            </span>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 font-display leading-[1.1]">
              Quantum Grid
              <br />
              Networks
            </h3>
            <p className="text-slate-300/80 text-[15px] leading-relaxed mb-8 font-medium pr-4">
              The future of energy distribution is decentralized. Learn the protocols of the next
              generation.
            </p>
          </div>
          <Button className="w-full bg-[#9B751D] hover:bg-[#7c5d17] text-white font-bold h-14 rounded-xl text-xs tracking-widest uppercase shadow-md shadow-black/20 transition-all">
            Notify Me
          </Button>
        </Card>
      </div>
    </div>
  )
}
