import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Store, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un formato de correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data) {
    setServerError('')
    try {
      const user = await login(data.email.trim(), data.password)
      toast.success(`¡Bienvenido de nuevo, ${user.fullName}!`, {
        description: 'Sesión iniciada correctamente mediante cookie segura.',
      })
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        (err.response?.status === 401
          ? 'Credenciales incorrectas o usuario inactivo'
          : 'No se pudo conectar con el servidor. Verifica que el backend esté activo.')
      setServerError(msg)
      toast.error('Error al iniciar sesión', { description: msg })
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="h-12 w-12 rounded-xl bg-[#166534] flex items-center justify-center text-white shadow-md group-hover:bg-[#14532d] transition-colors">
            <Store className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900 block leading-none">
              Abastix
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 tracking-wider uppercase">
              Gestión Comercial
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Iniciar sesión en tu cuenta
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Ingresa tus credenciales autorizadas para acceder al sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3">
                <span className="font-bold text-red-600">!</span>
                <p>{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center justify-between text-slate-700">
                <span>Correo electrónico</span>
                <span className="text-xs text-slate-400 font-normal">Obligatorio</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@abastix.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  {...register('email')}
                />
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center justify-between text-slate-700">
                <span>Contraseña</span>
                <span className="text-xs text-slate-400 font-normal">Obligatorio</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  {...register('password')}
                />
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#166534] hover:bg-[#14532d] text-white font-semibold h-11 text-base shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar a Abastix
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>Acceso protegido con JWT en Cookie HttpOnly y protección CSRF</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#166534] transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  )
}
