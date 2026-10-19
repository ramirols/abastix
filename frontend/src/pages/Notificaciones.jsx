import { useEffect, useState, useMemo } from 'react'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
  Inbox,
  CheckCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { notificationService } from '../api/services/notificationService'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

export default function Notificaciones() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // 'ALL' | 'UNREAD'
  const [markingId, setMarkingId] = useState(null)

  async function loadNotifications() {
    setLoading(true)
    try {
      const data = await notificationService.listar()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function handleMarkAsRead(id) {
    setMarkingId(id)
    try {
      await notificationService.marcarLeida(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      toast.success('Notificación marcada como leída')
    } catch (err) {
      toast.error('Error al actualizar notificación')
    } finally {
      setMarkingId(null)
    }
  }

  async function handleMarkAllAsRead() {
    const unread = notifications.filter((n) => !n.isRead)
    if (unread.length === 0) return

    try {
      await Promise.all(unread.map((n) => notificationService.marcarLeida(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('Todas las notificaciones fueron marcadas como leídas')
    } catch (err) {
      toast.error('Error al marcar notificaciones')
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filtered = useMemo(() => {
    if (filter === 'UNREAD') {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, filter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Bell className="h-4 w-4" />
            <span>Centro de Alertas</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bandeja de Notificaciones
          </h1>
          <p className="text-sm text-slate-500">
            Alertas asíncronas generadas por RabbitMQ sobre pedidos confirmados y quiebres de inventario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Marcar todas como leídas</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Alertas del Sistema</span>
                {unreadCount > 0 && (
                  <Badge className="bg-rose-600 text-white hover:bg-rose-700">
                    {unreadCount} sin leer
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Trazabilidad en tiempo real de eventos comerciales y de almacén.
              </CardDescription>
            </div>

            {/* Filter buttons */}
            <div className="flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('UNREAD')}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  filter === 'UNREAD'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No leídas ({unreadCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-slate-100 p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 pt-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Inbox className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">
                {filter === 'UNREAD'
                  ? 'No tienes notificaciones pendientes'
                  : 'Bandeja de alertas vacía'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Los eventos de stock crítico y pedidos confirmados aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isLowStock = item.type === 'LOW_STOCK'
                const isOrder = item.type === 'ORDER_CONFIRMED'

                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-4 p-4 transition-colors ${
                      item.isRead
                        ? 'bg-white hover:bg-slate-50/70'
                        : 'bg-emerald-50/30 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Icon */}
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          isLowStock
                            ? 'bg-amber-100 text-amber-700'
                            : isOrder
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isLowStock ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : isOrder ? (
                          <ShoppingBag className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm ${
                              item.isRead
                                ? 'font-medium text-slate-800'
                                : 'font-bold text-slate-900'
                            }`}
                          >
                            {item.title}
                          </h4>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.message}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium pt-1">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString('es-PE', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    {!item.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={markingId === item.id}
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-xs text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/50 h-8 px-2.5 shrink-0"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        <span>Marcar leída</span>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
