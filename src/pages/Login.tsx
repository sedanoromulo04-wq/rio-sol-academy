import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Sun } from 'lucide-react'

export default function Login() {
  const { user, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao entrar', description: error.message })
    } else {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#061B3B] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-[#EAB308] rounded-2xl">
          <Sun className="w-8 h-8 text-[#061B3B]" />
        </div>
        <h1 className="text-3xl font-black text-white font-display tracking-tight">
          RIO SOL <span className="text-[#EAB308]">ACADEMY</span>
        </h1>
      </div>

      <Card className="w-full max-w-md bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold text-[#061B3B]">Acesso ao Sistema</CardTitle>
          <CardDescription>Insira suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] font-bold text-lg rounded-xl mt-2"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-bold mb-1">Credenciais de teste Admin:</p>
            <p className="select-all">lucas.salles@riosolenergias.com.br</p>
            <p className="select-all">securepassword123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
