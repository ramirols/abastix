import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-md">
        <span className="font-mono text-7xl font-extrabold text-emerald-800">404</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Página no encontrada
        </h1>
        <p className="text-sm text-slate-500">
          La ruta solicitada no existe o no tienes los permisos necesarios para acceder a ella.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Ir al Inicio</span>
            </Link>
          </Button>

          <Button asChild className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
