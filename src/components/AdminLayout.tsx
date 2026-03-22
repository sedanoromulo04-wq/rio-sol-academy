import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Medal,
  Zap,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Award,
} from 'lucide-react'

const navItems = [
  { title: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
  { title: 'Gestão de Conteúdo', path: '/admin/tracks', icon: BookOpen },
  { title: 'Relatórios de Vendas', path: '/admin/analytics', icon: BarChart3 },
  { title: 'Ranking Global', path: '/admin/rankings', icon: Medal },
]

export function AdminLayout() {
  const location = useLocation()
  const [search, setSearch] = useState('')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full font-sans text-slate-200 bg-[#020817]">
        <Sidebar className="border-r border-white/5 bg-[#01040A] w-[260px]">
          <SidebarHeader className="px-5 pt-6 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight font-display mb-6">
              RIO SOL <span className="text-[#EAB308]">ACADEMY</span>
            </h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Avatar className="h-10 w-10 border border-white/20">
                <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=female&seed=99" />
                <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">
                  CE
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">Sarah Connor</h3>
                <p className="text-[9px] font-bold text-[#EAB308] uppercase tracking-widest mt-0.5">
                  Nível Executivo
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 pt-2">
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  location.pathname.startsWith(item.path) &&
                  (item.path !== '/admin' || location.pathname === '/admin')
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'transition-all h-11 rounded-lg px-3 flex items-center',
                        isActive
                          ? 'bg-white/10 shadow-sm border border-white/10 text-white font-bold relative overflow-hidden'
                          : 'text-slate-400 font-medium hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Link to={item.path}>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308]" />
                        )}
                        <item.icon
                          className={cn('h-4 w-4 mr-3', isActive ? 'text-[#EAB308]' : '')}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-5 pb-6 space-y-4">
            <Button
              asChild
              className="w-full bg-[#061B3B] hover:bg-[#0a2955] border border-white/10 text-white justify-start px-4 py-5 rounded-lg font-bold shadow-lg shadow-black/20"
            >
              <Link to="/simulador">
                <Zap className="mr-2 h-4 w-4 text-[#EAB308]" fill="currentColor" /> Admin IA RIO SOL
              </Link>
            </Button>
            <div className="space-y-0.5 pt-2 border-t border-white/5">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 font-medium h-9 px-3 rounded-md text-sm"
              >
                <Settings className="mr-2 h-4 w-4" /> Configurações do Sistema
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 font-medium h-9 px-3 rounded-md text-sm"
              >
                <HelpCircle className="mr-2 h-4 w-4" /> Suporte
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#061b3b] via-[#020b18] to-[#01060e] relative overflow-hidden">
          {/* Glowing orb background effect */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <header className="flex h-20 items-center justify-between px-6 lg:px-8 gap-6 sticky top-0 z-30 bg-[#020b18]/60 backdrop-blur-xl border-b border-white/5">
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar usuários, trilhas ou relatórios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 shadow-inner rounded-full h-10 w-full text-sm focus-visible:ring-[#EAB308] focus-visible:border-[#EAB308]"
              />
            </div>

            <div className="flex items-center gap-5 shrink-0 ml-auto md:ml-0">
              <button className="text-slate-400 hover:text-white transition-colors relative">
                <Award className="h-5 w-5" />
              </button>
              <button className="text-slate-400 hover:text-white transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-[#EAB308] rounded-full border-2 border-[#020b18]"></span>
              </button>
              <Link to="/perfil" className="shrink-0 transition-transform hover:scale-105 ml-2">
                <Avatar className="h-9 w-9 border border-white/20 shadow-sm rounded-full">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=99" />
                  <AvatarFallback className="bg-slate-800 text-white text-xs font-bold">
                    CE
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
