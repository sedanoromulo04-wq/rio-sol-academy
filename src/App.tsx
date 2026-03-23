import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { systemStore } from '@/stores/useSystemStore'
import { adminStore } from '@/stores/useAdminStore'
import { userStore } from '@/stores/useUserStore'

import Layout from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import Index from './pages/Index'
import Paths from './pages/Paths'
import Lesson from './pages/Lesson'
import Simulator from './pages/Simulator'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import Performance from './pages/Performance'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTracks from './pages/admin/AdminTracks'
import AdminTrackEdit from './pages/admin/AdminTrackEdit'
import AdminUserDetail from './pages/admin/AdminUserDetail'

const App = () => {
  useEffect(() => {
    systemStore.init()
    adminStore.init()
    userStore.init()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/trilhas" element={<Paths />} />
            <Route path="/trilhas/:id/lesson/:lessonId" element={<Lesson />} />
            <Route path="/simulador" element={<Simulator />} />
            <Route path="/desempenho" element={<Performance />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tracks" element={<AdminTracks />} />
            <Route path="tracks/new" element={<AdminTrackEdit />} />
            <Route path="tracks/:id" element={<AdminTrackEdit />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route
              path="*"
              element={<div className="p-10 text-slate-400">Em desenvolvimento...</div>}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
