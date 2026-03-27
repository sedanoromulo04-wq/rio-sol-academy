import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import useUserStore from '@/stores/useUserStore'
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
  Settings,
  Search,
  Bell,
  Award,
  LogOut,
  ArrowLeft,
  BrainCircuit,
} from 'lucide-react'

const navItems = [
  { title: 'Agentes', path: '/admin/agents', icon: BrainCircuit },
  { title: 'Visao Geral', path: '/admin', icon: LayoutDashboard },
  { title: 'Gestao de Conteudo', path: '/admin/tracks', icon: BookOpen },
  { title: 'Relatorios de Vendas', path: '/admin/analytics', icon: BarChart3 },
  { title: 'Ranking Global', path: '/admin/rankings', icon: Medal },
]

export function AdminLayout() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const { signOut } = useAuth()
  const { profile } = useUserStore()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full font-sans text-slate-200 bg-[#020817]">
        <Sidebar className="border-r border-white/5 bg-[#01040A] w-[260px]">
          <SidebarHeader className="px-5 pt-6 pb-4">
            <h2 className="text-xl font-black text-white tracking-tight font-display mb-6">
              RIO SOL <span className="text-[#EAB308]">ACADEMY</span>
            </h2>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <Avatar className="h-10 w-10 border border-white/20">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/medium?seed=${profile?.id || 'admin'}`}
                />
                <AvatarFallback className="bg-slate-800 font-bold text-slate-300">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold leading-tight text-white">
                  {profile?.full_name || 'Admin'}
                </h3>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#EAB308]">
                  Nivel Executivo
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
                        'flex h-11 items-center rounded-lg px-3 transition-all',
                        isActive
                          ? 'relative overflow-hidden border border-white/10 bg-white/10 font-bold text-white shadow-sm'
                          : 'font-medium text-slate-400 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Link to={item.path}>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308]" />
                        )}
                        <item.icon
                          className={cn('mr-3 h-4 w-4', isActive ? 'text-[#EAB308]' : '')}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="space-y-4 p-5 pb-6">
            <Button
              asChild
              className="w-full justify-start rounded-lg border border-white/10 bg-[#061B3B] px-4 py-5 font-bold text-white shadow-lg shadow-black/20 hover:bg-[#0a2955]"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4 text-[#EAB308]" fill="currentColor" /> Voltar ao
                App
              </Link>
            </Button>
            <div className="space-y-0.5 border-t border-white/5 pt-2">
              <Button
                variant="ghost"
                className="h-9 w-full justify-start rounded-md px-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <Settings className="mr-2 h-4 w-4" /> Configuracoes
              </Button>
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="h-9 w-full justify-start rounded-md px-3 text-sm font-medium text-slate-400 hover:bg-red-950/30 hover:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#061b3b] via-[#020b18] to-[#01060e]">
          <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>

          <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-6 border-b border-white/5 bg-[#020b18]/60 px-6 backdrop-blur-xl lg:px-8">
            <div className="relative hidden w-96 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar usuarios, trilhas ou relatorios..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-full border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-slate-400 shadow-inner focus-visible:border-[#EAB308] focus-visible:ring-[#EAB308]"
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-5 md:ml-0">
              <button className="relative text-slate-400 transition-colors hover:text-white">
                <Award className="h-5 w-5" />
              </button>
              <button className="relative text-slate-400 transition-colors hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-[#020b18] bg-[#EAB308]"></span>
              </button>
              <Link to="/perfil" className="ml-2 shrink-0 transition-transform hover:scale-105">
                <Avatar className="h-9 w-9 rounded-full border border-white/20 shadow-sm">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${profile?.id || 'admin'}`}
                  />
                  <AvatarFallback className="bg-slate-800 text-xs font-bold text-white">
                    {profile?.full_name?.substring(0, 2).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          <div className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
