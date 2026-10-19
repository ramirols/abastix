import { useEffect, useState, useMemo } from 'react'
import {
  FolderPlus,
  Search,
  Edit2,
  Power,
  Trash2,
  RefreshCw,
  FolderTree,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { categoryService } from '../api/services/categoryService'
import CategoriaModal from '../components/CategoriaModal'
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

export default function Categorias() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Confirm dialogs
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function loadCategories() {
    setLoading(true)
    try {
      const data = await categoryService.listar()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Error al cargar la lista de categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? cat.active
          : !cat.active
      return matchesSearch && matchesStatus
    })
  }, [categories, search, statusFilter])

  async function handleToggleStatus() {
    if (!confirmToggle) return
    setActionLoading(true)
    try {
      if (confirmToggle.active) {
        await categoryService.desactivar(confirmToggle.id)
        toast.success(`Categoría "${confirmToggle.name}" desactivada`)
      } else {
        await categoryService.activar(confirmToggle.id)
        toast.success(`Categoría "${confirmToggle.name}" activada`)
      }
      await loadCategories()
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
      await categoryService.eliminar(confirmDelete.id)
      toast.success(`Categoría "${confirmDelete.name}" eliminada`)
      await loadCategories()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'No se puede eliminar la categoría porque tiene productos asociados'
      )
    } finally {
      setActionLoading(false)
      setConfirmDelete(null)
    }
  }

  const activeCount = categories.filter((c) => c.active).length
  const inactiveCount = categories.length - activeCount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <FolderTree className="h-4 w-4" />
            <span>Catálogo Comercial</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gestión de Categorías
          </h1>
          <p className="text-sm text-slate-500">
            Organiza las familias de productos para facilitar el inventario y las ventas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
                setIsModalOpen(true)
              }}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-xs font-medium text-emerald-800">Total Categorías</p>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{categories.length}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Categorías Activas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Categorías Inactivas</p>
          <p className="text-2xl font-bold text-slate-500 mt-1">{inactiveCount}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Catálogo de Categorías</CardTitle>
              <CardDescription>
                {filteredCategories.length} categorías encontradas
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar categoría..."
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
                  Todas
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
                  Activas
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
                  Inactivas
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
                <TableHead>Nombre</TableHead>
                <TableHead className="w-32">Estado</TableHead>
                {isAdmin && <TableHead className="w-40 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    {isAdmin && <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className="h-32 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="h-6 w-6 text-slate-400" />
                      <p className="font-medium text-slate-700">No se encontraron categorías</p>
                      <p className="text-xs text-slate-500">
                        {search ? 'Intenta modificar el término de búsqueda.' : 'Crea tu primera categoría para organizar los productos.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((c) => (
                  <TableRow
                    key={c.id}
                    className={!c.active ? 'bg-slate-50/50 opacity-75' : ''}
                  >
                    <TableCell className="font-mono text-xs text-slate-500">
                      #{c.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.active ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-300">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-emerald-700"
                            onClick={() => {
                              setSelectedCategory(c)
                              setIsModalOpen(true)
                            }}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
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
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Creación / Edición */}
      <CategoriaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={selectedCategory}
        onSaved={loadCategories}
      />

      {/* Dialog Confirmación Activar/Desactivar */}
      <AlertDialog
        open={Boolean(confirmToggle)}
        onOpenChange={(open) => !open && setConfirmToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.active
                ? '¿Desactivar categoría?'
                : '¿Activar categoría?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.active
                ? `Al desactivar la categoría "${confirmToggle?.name}", no aparecerá como opción disponible para nuevos productos.`
                : `La categoría "${confirmToggle?.name}" volverá a estar activa y visible para nuevos registros.`}
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
            <AlertDialogTitle>¿Eliminar categoría definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              categoría <strong>&quot;{confirmDelete?.name}&quot;</strong>. Si tiene
              productos asociados en la base de datos, el servidor rechazará la operación por integridad referencial.
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
