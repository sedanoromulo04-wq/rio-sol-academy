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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, FileVideo, Settings, LogOut, ShieldAlert } from 'lucide-react'

const navItems = [
  { title: 'Performance Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Gestão de Trilhas', path: '/admin/tracks', icon: BookOpen },
  { title: 'Biblioteca de Mídia', path: '/admin/media', icon: FileVideo },
  { title: 'Configurações', path: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0a0a0a] font-sans text-slate-200">
        <Sidebar className="border-r border-white/10 bg-[#020817] w-[260px] text-slate-300">
          <SidebarHeader className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-6 w-6 text-[#EAB308]" />
              <h2 className="text-lg font-black text-white tracking-tight font-display">
                RIO SOL <span className="text-[#EAB308]">ADMIN</span>
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-sm text-white leading-tight">Painel de Controle</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Acesso Nível CEO
              </p>
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
                          ? 'bg-[#EAB308]/10 border border-[#EAB308]/20 text-[#EAB308] font-bold'
                          : 'text-slate-400 font-medium hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Link to={item.path}>
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

          <SidebarFooter className="p-5 pb-6">
            <Button
              asChild
              variant="outline"
              className="w-full bg-transparent border-white/20 text-slate-300 hover:bg-white/10 hover:text-white justify-start px-4 py-5 rounded-lg font-bold"
            >
              <Link to="/trilhas">
                <LogOut className="mr-2 h-4 w-4" /> Voltar para Academia
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
