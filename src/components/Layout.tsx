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
  Map,
  Brain,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  HelpCircle,
  Search,
  Medal,
  Bell,
  ShieldAlert,
} from 'lucide-react'

const navItems = [
  { title: 'Minha Jornada', path: '/', icon: Map },
  { title: 'Painel de conteúdos', path: '/trilhas', icon: Brain },
  { title: 'Laboratório de Roleplay', path: '/simulador', icon: MessageSquare },
  { title: 'Ranking Global', path: '/ranking', icon: BarChart3 },
]

export default function Layout() {
  const location = useLocation()
  const [search, setSearch] = useState('')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F4F6F8] font-sans">
        <Sidebar className="border-r border-slate-200 bg-white w-[260px]">
          <SidebarHeader className="px-5 pt-6 pb-3">
            <h2 className="text-xl font-black text-[#061B3B] tracking-tight font-display mb-6">
              RIO SOL
            </h2>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Avatar className="h-9 w-9 rounded-lg">
                <AvatarImage src="https://img.usecurling.com/p/100/100?q=space&color=black" />
                <AvatarFallback className="bg-[#061B3B] text-white rounded-lg text-xs">
                  SA
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-sm text-[#061B3B] leading-tight">Arquiteto Solar</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Nível Zenith
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 pt-2">
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'transition-all h-10 rounded-lg px-3 flex items-center',
                        isActive
                          ? 'bg-white shadow-sm border border-slate-100 text-[#061B3B] font-bold relative overflow-hidden'
                          : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-[#061B3B]',
                      )}
                    >
                      <Link to={item.path}>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308]" />
                        )}
                        <item.icon
                          className={cn('h-4 w-4 mr-3', isActive ? 'text-[#061B3B]' : '')}
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
            <div className="space-y-1">
              <Button
                asChild
                className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white justify-start px-4 py-5 rounded-lg font-bold shadow-sm"
              >
                <Link to="/simulador">
                  <Zap className="mr-2 h-4 w-4 text-[#EAB308]" fill="currentColor" /> RIO SOL IA
                  Brain
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-[#061B3B] font-bold border-[#EAB308] bg-[#EAB308]/10 hover:bg-[#EAB308]/20 mt-2 h-10"
              >
                <Link to="/admin">
                  <ShieldAlert className="mr-2 h-4 w-4 text-[#d97706]" /> Painel Admin (CEO)
                </Link>
              </Button>
            </div>
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-500 hover:text-[#061B3B] hover:bg-slate-50 font-medium h-9 px-3 rounded-md text-sm"
              >
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-500 hover:text-[#061B3B] hover:bg-slate-50 font-medium h-9 px-3 rounded-md text-sm"
              >
                <HelpCircle className="mr-2 h-4 w-4" /> Suporte
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-20 items-center justify-end px-6 lg:px-8 gap-6 sticky top-0 z-30 bg-[#F4F6F8]/80 backdrop-blur-md">
            {location.pathname !== '/' && (
              <div className="relative hidden md:block w-64 mr-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white border-slate-200 shadow-sm rounded-full h-9 w-full text-sm"
                />
              </div>
            )}
            <div className="flex items-center gap-5 shrink-0">
              <Link to="/ranking" className="text-slate-400 hover:text-[#061B3B] transition-colors">
                <Medal className="h-5 w-5" />
              </Link>
              <button className="text-slate-400 hover:text-[#061B3B] transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-[#EAB308] rounded-full border-2 border-[#F4F6F8]"></span>
              </button>
              <Link to="/perfil" className="shrink-0 transition-transform hover:scale-105">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm rounded-lg">
                  <AvatarImage src="https://img.usecurling.com/p/100/100?q=landscape&color=blue" />
                  <AvatarFallback className="bg-slate-200 text-[#061B3B] rounded-lg font-bold text-xs">
                    SA
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <div className="flex-1 px-6 lg:px-8 pb-10 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
