import { User, Shield, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export default function Perfil() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <User className="h-4 w-4" />
          <span>Configuración de Cuenta</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Mi Perfil de Usuario
        </h1>
        <p className="text-sm text-slate-500">
          Información de la sesión autenticada y políticas de seguridad corporativas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Card */}
        <Card className="md:col-span-1 border-emerald-100 shadow-sm text-center p-6 space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-2xl font-bold">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName || 'Usuario'}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          </div>

          <div className="flex justify-center gap-1.5">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {user?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Colaborador'}
            </Badge>
            <Badge variant="outline" className="text-emerald-700 border-emerald-300">
              Activo
            </Badge>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Cerrar Sesión Activa
            </Button>
          </div>
        </Card>

        {/* Security & Access Info */}
        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-700" />
                <span>Datos de la Cuenta</span>
              </CardTitle>
              <CardDescription>
                Detalles del usuario registrado en el servidor de autenticación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nombre Completo:</span>
                <span className="font-semibold text-slate-800">{user?.fullName || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Correo Electrónico:</span>
                <span className="font-mono text-slate-800">{user?.email || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rol del Sistema:</span>
                <span className="font-mono font-semibold text-emerald-800">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Tipo de Autenticación:</span>
                <span className="text-slate-700 font-medium">JWT Stateless Cookie</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                <Lock className="h-4 w-4 text-emerald-700" />
                <span>Estándares de Seguridad Activos en tu Sesión</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cookie HttpOnly:</strong> El token JWT está protegido contra robo por ataques Cross-Site Scripting (XSS).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Protección CSRF:</strong> Se requiere token anti-falsificación <code>X-XSRF-TOKEN</code> en cada operación que altere datos.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero LocalStorage:</strong> Ninguna credencial ni token sensible reside en el almacenamiento persistente del navegador.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
