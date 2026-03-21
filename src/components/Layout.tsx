import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  BookOpen,
  Brain,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  HelpCircle,
  Search,
  Medal,
  Bell,
} from 'lucide-react'

const navItems = [
  { title: 'My Journey', path: '/', icon: BookOpen },
  { title: 'Knowledge Brain', path: '/trilhas', icon: Brain },
  { title: 'Roleplay Lab', path: '/simulador', icon: MessageSquare },
  { title: 'Rankings', path: '/ranking', icon: BarChart3 },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()

  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setLocalSearch(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalSearch(val)
    if (val.trim() === '') {
      if (location.pathname === '/trilhas') setSearchParams({})
    } else {
      if (location.pathname !== '/trilhas') navigate(`/trilhas?q=${encodeURIComponent(val)}`)
      else setSearchParams({ q: val })
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F4F6F8]">
        <Sidebar className="border-r-0 bg-transparent w-[280px]">
          <SidebarHeader className="px-8 pt-10 pb-6">
            <h2 className="text-[22px] font-black text-[#061B3B] mb-10 tracking-tight font-display">
              RIO SOL ACADEMY
            </h2>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">Solar Architect</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Zenith Level
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'transition-all h-12 rounded-xl px-4 flex items-center',
                        isActive
                          ? 'bg-white shadow-sm text-[#061B3B] font-bold'
                          : 'text-slate-500 font-semibold hover:bg-white/50 hover:text-[#061B3B]',
                      )}
                    >
                      <Link to={item.path}>
                        <item.icon
                          className={cn('h-5 w-5 mr-3', isActive ? 'text-[#061B3B]' : '')}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 pb-8 space-y-6">
            <Button
              asChild
              className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white justify-start px-5 py-6 rounded-xl font-bold shadow-md"
            >
              <Link to="/simulador">
                <Zap className="mr-3 h-5 w-5" fill="currentColor" /> RIO SOL AI Brain
              </Link>
            </Button>
            <div className="space-y-1">
              <Button
                variant="ghost"
                onClick={() =>
                  toast({
                    title: 'Settings',
                    description: 'Preferences are currently synced via system defaults.',
                  })
                }
                className="w-full justify-start text-slate-500 hover:text-[#061B3B] hover:bg-white/50 font-semibold h-10 px-4"
              >
                <Settings className="mr-3 h-5 w-5" /> Settings
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  toast({
                    title: 'Support',
                    description: 'Contact your manager or helpdesk for direct assistance.',
                  })
                }
                className="w-full justify-start text-slate-500 hover:text-[#061B3B] hover:bg-white/50 font-semibold h-10 px-4"
              >
                <HelpCircle className="mr-3 h-5 w-5" /> Support
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-24 items-center justify-between px-6 lg:px-12 gap-6 sticky top-0 z-30 bg-[#F4F6F8]/80 backdrop-blur-md">
            <div className="flex items-center gap-4 w-full">
              <SidebarTrigger className="lg:hidden text-slate-500" />
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Knowledge Brain..."
                  value={localSearch}
                  onChange={handleSearch}
                  className="pl-11 bg-white border-none shadow-sm rounded-xl h-12 w-full text-slate-600 font-medium placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-1 focus-visible:ring-slate-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <Link to="/ranking" className="text-slate-400 hover:text-[#061B3B] transition-colors">
                <Medal className="h-6 w-6" />
              </Link>
              <button
                onClick={() =>
                  toast({ title: 'Notifications', description: 'You have 1 unread update.' })
                }
                className="text-slate-400 hover:text-[#061B3B] transition-colors relative"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-[#D97706] rounded-full border-2 border-[#F4F6F8]"></span>
              </button>
              <Link to="/perfil" className="shrink-0 transition-transform hover:scale-105">
                <Avatar className="h-11 w-11 border-2 border-white shadow-md hover:border-[#061B3B] transition-colors">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3" />
                  <AvatarFallback className="bg-slate-200 text-[#061B3B] font-bold">
                    SA
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <div className="flex-1 px-6 lg:px-12 pb-12 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
