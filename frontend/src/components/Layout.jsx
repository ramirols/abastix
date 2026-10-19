import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingCart,
  PlusCircle,
  Boxes,
  Bell,
  UserCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Store,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationService } from '../api/services/notificationService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Cargar conteo de notificaciones no leídas periódicamente
  useEffect(() => {
    let active = true

    async function fetchUnread() {
      try {
        const count = await notificationService.contarNoLeidas()
        if (active) setUnreadNotifications(count)
      } catch {
        // En caso de que no haya sesión o error de red
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pedidos', label: 'Ventas y Pedidos', icon: ShoppingCart },
    { to: '/pedidos/nuevo', label: 'Nuevo Pedido', icon: PlusCircle },
    { to: '/productos', label: 'Productos', icon: Package },
    { to: '/categorias', label: 'Categorías', icon: Layers },
    { to: '/clientes', label: 'Clientes', icon: Users },
    { to: '/inventario', label: 'Inventario', icon: Boxes },
    {
      to: '/notificaciones',
      label: 'Notificaciones',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    ...(isAdmin
      ? [{ to: '/usuarios', label: 'Usuarios', icon: UserCheck, adminOnly: true }]
      : []),
    { to: '/perfil', label: 'Mi Perfil', icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 select-none">
        {/* Brand */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="h-10 w-10 rounded-xl bg-[#166534] flex items-center justify-center text-white font-bold shadow-md">
            <Store className="h-5 w-5 text-emerald-100" />
          </div>
          <div>
            <strong className="text-white text-base tracking-tight block leading-tight">Abastix</strong>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              {isAdmin ? 'Administrador' : 'Colaborador'}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center justify-center h-5 px-1.5 text-xs font-bold rounded-full bg-emerald-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Usuario y Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-9 w-9 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-600">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <strong className="text-xs font-semibold text-white block truncate">
                {user?.fullName}
              </strong>
              <span className="text-[11px] text-slate-400 block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-2 h-9 text-xs font-medium cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Header móvil */}
      <header className="md:hidden bg-slate-900 text-white px-4 h-16 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#166534] flex items-center justify-center text-white font-bold">
            <Store className="h-4 w-4" />
          </div>
          <strong className="text-base font-bold">Abastix</strong>
        </div>

        <div className="flex items-center gap-2">
          {unreadNotifications > 0 && (
            <NavLink to="/notificaciones" className="p-2 text-emerald-400 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-300 hover:text-white"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/90 flex flex-col p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white">
              <Store className="h-5 w-5 text-emerald-400" />
              <strong className="text-lg">Abastix</strong>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-slate-400 hover:text-white p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium ${
                      isActive
                        ? 'bg-[#166534] text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="success" className="bg-emerald-500 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
