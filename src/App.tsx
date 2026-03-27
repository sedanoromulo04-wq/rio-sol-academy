import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { systemStore } from '@/stores/useSystemStore'
import { adminStore } from '@/stores/useAdminStore'
import { userStore } from '@/stores/useUserStore'
import useUserStore from '@/stores/useUserStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

const Layout = lazy(() => import('./components/Layout'))
const AdminLayout = lazy(() =>
  import('./components/AdminLayout').then((module) => ({ default: module.AdminLayout })),
)
const Index = lazy(() => import('./pages/Index'))
const Paths = lazy(() => import('./pages/Paths'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Simulator = lazy(() => import('./pages/Simulator'))
const Ranking = lazy(() => import('./pages/Ranking'))
const Profile = lazy(() => import('./pages/Profile'))
const Performance = lazy(() => import('./pages/Performance'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'))
const AdminTracks = lazy(() => import('./pages/admin/AdminTracks'))
const AdminTrackEdit = lazy(() => import('./pages/admin/AdminTrackEdit'))
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'))
const Login = lazy(() => import('./pages/Login'))

const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] text-[#061B3B]">
    Carregando...
  </div>
)

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

const AppRoutes = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      // Inicialização paralela para máxima performance
      // Usamos o ID para garantir estabilidade da dependência
      Promise.all([
        systemStore.init(),
        adminStore.init(),
        userStore.init(user.id)
      ]).catch(err => console.error('Error initializing stores', err))
    }
  }, [user?.id])

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
        <Route path="agents" element={<AdminAgents />} />
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
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<AppLoader />}>
            <AppRoutes />
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
