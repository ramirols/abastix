import { useEffect, useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { productService } from '../api/services/productService'
import { categoryService } from '../api/services/categoryService'
import { useAuth } from '../context/AuthContext'
import ProductoModal from '../components/ProductoModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Select } from '@/components/ui/select'

export default function Productos() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [modalState, setModalState] = useState(null) // null | { mode: 'create' | 'edit', item: ... }
  const [confirmDialog, setConfirmDialog] = useState(null) // null | { type: 'deactivate' | 'activate' | 'delete', item: ... }

  async function loadData() {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        productService.listar(isAdmin ? null : true),
        categoryService.listar(),
      ])
      setItems(prods)
      setCategories(cats)
    } catch (err) {
      toast.error('Error al cargar productos', {
        description: err.response?.data?.message ?? 'Verifica la conexión con el backend',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtrado reactivo en cliente (por búsqueda de nombre/SKU, categoría y estado)
  const filteredProducts = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || String(p.categoryId) === String(categoryFilter)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active) ||
        (statusFilter === 'inactive' && !p.active) ||
        (statusFilter === 'low_stock' && p.active && p.stock <= p.minStock)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, searchTerm, categoryFilter, statusFilter])

  async function handleConfirmAction() {
    if (!confirmDialog) return
    const { type, item } = confirmDialog
    try {
      if (type === 'deactivate') {
        await productService.desactivar(item.id)
        toast.success(`Producto "${item.name}" desactivado`)
      } else if (type === 'activate') {
        await productService.activar(item.id)
        toast.success(`Producto "${item.name}" activado`)
      } else if (type === 'delete') {
        await productService.eliminar(item.id)
        toast.success(`Producto "${item.name}" eliminado del catálogo`)
      }
      setConfirmDialog(null)
      loadData()
    } catch (err) {
      toast.error('Error al realizar la acción', {
        description: err.response?.data?.message ?? 'No se pudo completar la operación',
      })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            CATÁLOGO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Productos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administra los precios, códigos SKU y control de inventario de cada producto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setModalState({ mode: 'create' })}
              className="bg-[#166534] hover:bg-[#14532d] text-white gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card className="shadow-xs border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Input
                placeholder="Buscar por nombre de producto o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="sm:col-span-3">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs sm:text-sm"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs sm:text-sm"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Solo Activos</option>
                {isAdmin && <option value="inactive">Inactivos</option>}
                <option value="low_stock">Stock Bajo (Crítico)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Productos */}
      <Card className="shadow-xs border-slate-200 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Inventario de Productos
            </CardTitle>
            <CardDescription className="text-xs">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Estado</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={isAdmin ? 7 : 6} className="p-4 text-center text-slate-400">
                        Cargando catálogo...
                      </td>
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const isLowStock = p.active && p.stock <= p.minStock
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/70 transition-colors ${!p.active ? 'opacity-60 bg-slate-50/40' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 text-sm">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                          {p.sku}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                            {p.categoryName || 'Sin Categoría'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#166534] text-sm">
                          S/ {Number(p.price).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{p.stock}</span>
                            {isLowStock && (
                              <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Bajo stock (mín: {p.minStock})
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.active ? (
                            <Badge variant="success">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </td>

                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalState({ mode: 'edit', item: p })}
                                className="h-7 px-2 text-xs gap-1 text-slate-700 cursor-pointer"
                                title="Editar producto"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>

                              {p.active ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDialog({ type: 'deactivate', item: p })}
                                  className="h-7 px-2 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 cursor-pointer"
                                  title="Desactivar producto"
                                >
                                  Desactivar
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDialog({ type: 'activate', item: p })}
                                  className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                                  title="Activar producto"
                                >
                                  Activar
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDialog({ type: 'delete', item: p })}
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      No se encontraron productos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear / Editar */}
      {modalState && (
        <ProductoModal
          initial={modalState.mode === 'edit' ? modalState.item : null}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null)
            loadData()
          }}
        />
      )}

      {/* Dialog de Confirmación de Acción */}
      {confirmDialog && (
        <AlertDialog
          open={true}
          onOpenChange={() => setConfirmDialog(null)}
          title={
            confirmDialog.type === 'delete'
              ? `¿Eliminar "${confirmDialog.item.name}"?`
              : confirmDialog.type === 'deactivate'
              ? `¿Desactivar "${confirmDialog.item.name}"?`
              : `¿Activar "${confirmDialog.item.name}"?`
          }
          description={
            confirmDialog.type === 'delete'
              ? 'El producto será dado de baja del catálogo activo. Esta acción es registrada en el registro de auditoría.'
              : confirmDialog.type === 'deactivate'
              ? 'El producto no estará visible para ventas por los colaboradores.'
              : 'El producto volverá a estar disponible para su venta en el sistema.'
          }
          confirmText={
            confirmDialog.type === 'delete'
              ? 'Sí, eliminar'
              : confirmDialog.type === 'deactivate'
              ? 'Sí, desactivar'
              : 'Sí, activar'
          }
          variant={confirmDialog.type === 'activate' ? 'default' : 'destructive'}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  )
}
