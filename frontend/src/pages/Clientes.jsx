import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  FileText,
  Edit2,
  Power,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { customerService } from '../api/services/customerService'
import ClienteModal from '../components/ClienteModal'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { Skeleton } from '../components/ui/skeleton'

export default function Clientes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Confirm dialogs
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await customerService.listar()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Error al cargar la lista de clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const q = search.toLowerCase()
      const matchesSearch =
        cust.fullName.toLowerCase().includes(q) ||
        cust.document.toLowerCase().includes(q) ||
        (cust.phone && cust.phone.toLowerCase().includes(q)) ||
        (cust.email && cust.email.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? cust.active
          : !cust.active

      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

  async function handleToggleStatus() {
    if (!confirmToggle) return
    setActionLoading(true)
    try {
      if (confirmToggle.active) {
        await customerService.desactivar(confirmToggle.id)
        toast.success(`Cliente "${confirmToggle.fullName}" desactivado`)
      } else {
        await customerService.activar(confirmToggle.id)
        toast.success(`Cliente "${confirmToggle.fullName}" activado`)
      }
      await loadCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    } finally {
      setActionLoading(false)
      setConfirmToggle(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setActionLoading(true)
    try {
      await customerService.eliminar(confirmDelete.id)
      toast.success(`Cliente "${confirmDelete.fullName}" eliminado`)
      await loadCustomers()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'No se puede eliminar el cliente porque tiene pedidos asociados'
      )
    } finally {
      setActionLoading(false)
      setConfirmDelete(null)
    }
  }

  const activeCount = customers.filter((c) => c.active).length
  const inactiveCount = customers.length - activeCount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Users className="h-4 w-4" />
            <span>Relaciones Comerciales</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-slate-500">
            Directorio de bodegas, comercios y compradores habituales de la red Abastix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomers}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedCustomer(null)
              setIsModalOpen(true)
            }}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-xs font-medium text-emerald-800">Total Clientes</p>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{customers.length}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Clientes Habilitados</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Clientes Inactivos</p>
          <p className="text-2xl font-bold text-slate-500 mt-1">{inactiveCount}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Cartera de Clientes</CardTitle>
              <CardDescription>
                {filteredCustomers.length} clientes encontrados en el sistema
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, DNI/RUC, teléfono..."
                  className="pl-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex rounded-md shadow-sm border border-slate-200 overflow-hidden text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-2 transition-colors border-l border-r border-slate-200 ${
                    statusFilter === 'active'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-2 transition-colors ${
                    statusFilter === 'inactive'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Inactivos
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="w-28">Estado</TableHead>
                <TableHead className="w-36 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="h-6 w-6 text-slate-400" />
                      <p className="font-medium text-slate-700">No se encontraron clientes</p>
                      <p className="text-xs text-slate-500">
                        {search ? 'Intenta modificar el término de búsqueda.' : 'Registra un nuevo cliente para asociarle pedidos.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow
                    key={c.id}
                    className={!c.active ? 'bg-slate-50/50 opacity-75' : ''}
                  >
                    <TableCell className="font-mono text-xs text-slate-500">
                      #{c.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {c.fullName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {c.document}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs text-slate-600">
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                        )}
                        {!c.phone && !c.email && (
                          <span className="text-slate-400 italic">Sin datos de contacto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.active ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-300">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                          onClick={() => {
                            setSelectedCustomer(c)
                            setIsModalOpen(true)
                          }}
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                c.active
                                  ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              onClick={() => setConfirmToggle(c)}
                              title={c.active ? 'Desactivar' : 'Activar'}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setConfirmDelete(c)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Creación / Edición */}
      <ClienteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={selectedCustomer}
        onSaved={loadCustomers}
      />

      {/* Dialog Confirmación Activar/Desactivar */}
      <AlertDialog
        open={Boolean(confirmToggle)}
        onOpenChange={(open) => !open && setConfirmToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.active ? '¿Desactivar cliente?' : '¿Activar cliente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.active
                ? `Al desactivar a "${confirmToggle?.fullName}", no aparecerá en el selector para nuevos pedidos.`
                : `"${confirmToggle?.fullName}" volverá a estar habilitado para registrar nuevos pedidos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={
                confirmToggle?.active
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }
            >
              {actionLoading
                ? 'Procesando...'
                : confirmToggle?.active
                ? 'Sí, desactivar'
                : 'Sí, activar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Confirmación Eliminar */}
      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará al cliente{' '}
              <strong>&quot;{confirmDelete?.fullName}&quot;</strong>. Si ya cuenta con pedidos o comprobantes históricos, el servidor protegerá la integridad referencial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {actionLoading ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
