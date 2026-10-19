import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Plus,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { orderService } from '../api/services/orderService'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Skeleton } from '../components/ui/skeleton'

const STATUS_CONFIG = {
  CONFIRMADO: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
  },
  PREPARANDO: {
    label: 'En Preparación',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: PackageCheck,
  },
  LISTO: {
    label: 'Listo para Entrega',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: CheckCircle2,
  },
  ENTREGADO: {
    label: 'Entregado',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Truck,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: XCircle,
  },
}

export default function Pedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await orderService.listar()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Error al cargar la lista de pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.toLowerCase()
      const matchesSearch =
        order.id.toString().includes(q) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        (order.customerDocument && order.customerDocument.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'ALL' ? true : order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  async function handleStatusChange(orderId, newStatus) {
    setChangingStatus(true)
    try {
      await orderService.cambiarEstado(orderId, newStatus)
      toast.success(`Pedido #${orderId} actualizado a ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      await loadOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar el estado del pedido')
    } finally {
      setChangingStatus(false)
    }
  }

  function openDetail(order) {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <ShoppingBag className="h-4 w-4" />
            <span>Operaciones y Ventas</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Control de órdenes comerciales, estados de despacho y trazabilidad de entrega.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            size="sm"
            asChild
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            <Link to="/pedidos/nuevo">
              <Plus className="h-4 w-4" />
              <span>Nuevo Pedido</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Órdenes Registradas</CardTitle>
              <CardDescription>
                {filteredOrders.length} pedidos encontrados en el sistema
              </CardDescription>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por N° o cliente..."
                  className="pl-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="PREPARANDO">En Preparación</option>
                <option value="LISTO">Listo para Entrega</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-20">N° Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-36 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="h-6 w-6 text-slate-400" />
                      <p className="font-medium text-slate-700">No se encontraron pedidos</p>
                      <p className="text-xs text-slate-500">
                        {search ? 'Modifica los filtros de búsqueda.' : 'Crea un nuevo pedido para empezar a vender.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((ord) => {
                  const conf = STATUS_CONFIG[ord.status] || {
                    label: ord.status,
                    color: 'bg-slate-100 text-slate-800',
                    icon: Clock,
                  }
                  const Icon = conf.icon

                  return (
                    <TableRow key={ord.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-mono text-xs font-bold text-emerald-800">
                        #{ord.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {ord.customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ord.customerDocument}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleString('es-PE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <CreditCard className="h-3 w-3 text-slate-400" />
                          {ord.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-slate-900">
                        S/ {Number(ord.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`gap-1 ${conf.color}`}>
                          <Icon className="h-3 w-3" />
                          <span>{conf.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => openDetail(ord)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detalle</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">
                  Pedido #{selectedOrder?.id}
                </DialogTitle>
                <DialogDescription>
                  Detalle de productos y comprobante interno
                </DialogDescription>
              </div>
              {selectedOrder && (
                <Badge
                  className={`gap-1 ${
                    STATUS_CONFIG[selectedOrder.status]?.color || 'bg-slate-100'
                  }`}
                >
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-sm">
              {/* Customer and Info Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Cliente:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrder.customerName}
                  </span>
                  <span className="text-slate-500 block">
                    Doc: {selectedOrder.customerDocument}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Método de Pago:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrder.paymentMethod}
                  </span>
                  <span className="text-slate-500 block">
                    Fecha:{' '}
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString('es-PE')
                      : '-'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 text-xs">
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.id} className="text-xs">
                        <TableCell>
                          <span className="font-medium text-slate-900">
                            {item.productName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-600">
                          S/ {Number(item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-slate-900">
                          S/ {Number(item.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-56 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Imponible:</span>
                    <span className="font-mono">
                      S/ {(Number(selectedOrder.totalAmount) / 1.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>IGV (18%):</span>
                    <span className="font-mono">
                      S/{' '}
                      {(
                        Number(selectedOrder.totalAmount) -
                        Number(selectedOrder.totalAmount) / 1.18
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                    <span>Total General:</span>
                    <span className="font-mono text-emerald-800">
                      S/ {Number(selectedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status transition controller */}
              <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Actualizar Estado Operativo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CONFIRMADO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'].map(
                    (st) => (
                      <Button
                        key={st}
                        type="button"
                        size="sm"
                        variant={selectedOrder.status === st ? 'default' : 'outline'}
                        disabled={changingStatus || selectedOrder.status === st}
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`text-xs h-7 ${
                          selectedOrder.status === st
                            ? 'bg-emerald-700 text-white font-semibold'
                            : ''
                        }`}
                      >
                        {STATUS_CONFIG[st]?.label || st}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
