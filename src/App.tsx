import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { systemStore } from '@/stores/useSystemStore'
import { adminStore } from '@/stores/useAdminStore'
import { userStore } from '@/stores/useUserStore'
import useSystemStore from '@/stores/useSystemStore'
import useUserStore from '@/stores/useUserStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import Index from './pages/Index'
import Paths from './pages/Paths'
import Lesson from './pages/Lesson'
import Simulator from './pages/Simulator'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import Performance from './pages/Performance'
import NotebookLM from './pages/NotebookLM'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNotebookLM from './pages/admin/AdminNotebookLM'
import AdminTracks from './pages/admin/AdminTracks'
import AdminTrackEdit from './pages/admin/AdminTrackEdit'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import Login from './pages/Login'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        Carregando...
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  return children
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const { profile } = useUserStore()

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020b18] text-white">
        Carregando permissões...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!profile?.is_admin) return <Navigate to="/" replace />
  return children
}

const NotebookLMRoute = ({ children }: { children: React.ReactNode }) => {
  const { notebookLM } = useSystemStore()
  const hasPublishedExperience =
    notebookLM.enabled &&
    (notebookLM.userCanCreatePodcast || notebookLM.silos.some((silo) => silo.isVisible))

  if (!hasPublishedExperience) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      systemStore.init()
      adminStore.init()
      userStore.init(user.id)
    }
  }, [user])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/trilhas" element={<Paths />} />
        <Route path="/trilhas/:id/lesson/:lessonId" element={<Lesson />} />
        <Route path="/simulador" element={<Simulator />} />
        <Route path="/desempenho" element={<Performance />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/perfil" element={<Profile />} />
        <Route
          path="/notebooklm"
          element={
            <NotebookLMRoute>
              <NotebookLM />
            </NotebookLMRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="notebooklm" element={<AdminNotebookLM />} />
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
  )
}

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
