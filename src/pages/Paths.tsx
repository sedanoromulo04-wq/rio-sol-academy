import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles, Cpu, UserCircle, Play } from 'lucide-react'
import useAdminStore from '@/stores/useAdminStore'

const filters = ['Todas as Trilhas', 'Cultura', 'Técnico', 'Psicologia']

export default function Paths() {
  const { content } = useAdminStore()
  const [activeFilter, setActiveFilter] = useState('Todas as Trilhas')
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const isMatch = (category: string, title: string, description?: string) => {
    if (activeFilter !== 'Todas as Trilhas' && category !== activeFilter) return false
    if (searchQuery) {
      const matchesTitle = title.toLowerCase().includes(searchQuery)
      const matchesCategory = category.toLowerCase().includes(searchQuery)
      const matchesDesc = description ? description.toLowerCase().includes(searchQuery) : false
      if (!matchesTitle && !matchesCategory && !matchesDesc) return false
    }
    return true
  }

  const getIcon = (cat: string) => {
    if (cat === 'Cultura') return Sparkles
    if (cat === 'Psicologia') return UserCircle
    return Cpu
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge className="bg-[#EAB308] text-[#061B3B] hover:bg-[#EAB308]/90 rounded-sm text-[9px] font-black px-2 py-0.5 tracking-widest border-none uppercase shadow-sm">
            Sistema de Biblioteca
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] tracking-tight font-display">
            Painel de conteúdos
          </h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
          Acesse a lógica fundamental do ecossistema RIO SOL. Aprofunde-se em trilhas desenhadas
          para evolução profissional e maestria técnica.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm border border-slate-100">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-xl px-4 font-semibold transition-all text-xs',
                activeFilter === filter
                  ? 'bg-[#061B3B] hover:bg-[#0a2955] text-white border-none shadow-md'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#061B3B] bg-white',
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {content.filter((item) => isMatch(item.category, item.title, item.description)).length ===
          0 && (
          <p className="text-slate-500 col-span-full py-10 text-center">
            Nenhum conteúdo encontrado.
          </p>
        )}
        {content
          .filter((item) => isMatch(item.category, item.title, item.description))
          .map((item) => {
            const Icon = getIcon(item.category)
            return (
              <Card
                key={item.id}
                className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col bg-white overflow-hidden group h-[420px]"
              >
                <div className="relative h-48 w-full overflow-hidden shrink-0">
                  <img
                    src={item.thumbnail_url}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/60 to-transparent" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#EAB308] flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 z-10">
                    <h3 className="text-xl font-black text-white leading-tight font-display drop-shadow-md">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-3">
                    {item.description}
                  </p>
                  <Button
                    asChild
                    className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white h-11 text-sm rounded-xl font-bold tracking-wide shadow-md transition-all hover:shadow-lg mt-4"
                  >
                    <Link to={`/trilhas/${item.id}/lesson/1`}>
                      <Play className="w-4 h-4 mr-2" fill="currentColor" /> Acessar Conteúdo
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
