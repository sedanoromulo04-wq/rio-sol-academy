import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Trophy,
  Medal,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Trilhas', path: '/trilhas', icon: BookOpen },
  { title: 'Simulador', path: '/simulador', icon: MessageSquare },
  { title: 'Ranking', path: '/ranking', icon: Trophy },
  { title: 'Perfil & Conquistas', path: '/perfil', icon: Medal },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
        <Sidebar variant="inset" className="border-r-0 glass-panel">
          <SidebarHeader className="py-6 px-4">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <Sparkles className="h-6 w-6" />
              <span>RIO SOL Academy</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        className="transition-all hover:translate-x-1"
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="rounded-xl bg-card p-4 border border-white/5">
              <div className="text-xs text-muted-foreground mb-2">Suporte Técnico RAG</div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pergunte à IA..."
                  className="pl-8 h-9 bg-background/50 border-white/10"
                />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 glass-panel sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden sm:block text-sm text-muted-foreground">
                Bem-vindo de volta ao centro de treinamento
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative text-muted-foreground hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-foreground">João Silva</div>
                  <div className="text-xs text-primary font-medium flex items-center gap-1 justify-end">
                    Consultor Pleno
                  </div>
                </div>
                <Avatar className="border-2 border-primary/20">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
