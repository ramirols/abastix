import { useEffect, useState, useMemo } from 'react'
import {
  Boxes,
  PlusCircle,
  Search,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  PackageX,
  Package,
  Layers,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { inventoryService } from '../api/services/inventoryService'
import { productService } from '../api/services/productService'
import MovimientoModal from '../components/MovimientoModal'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'

export default function Inventario() {
  const [activeTab, setActiveTab] = useState('kardex') // 'kardex' | 'stock'
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL, ENTRADA, SALIDA, AJUSTE

  // Modal
  const [modalOpen, setModalOpen] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [movData, prodData] = await Promise.all([
        inventoryService.listarMovimientos(),
        productService.listar(),
      ])
      setMovements(Array.isArray(movData) ? movData : [])
      setProducts(Array.isArray(prodData) ? prodData : [])
    } catch (err) {
      toast.error('Error al cargar la información del inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // KPI Calculations
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0), 0)
  }, [products])

  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0)
  }, [products])

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 5).length
  }, [products])

  // Filtered movements for Kardex
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const q = search.toLowerCase()
      const matchesSearch =
        (m.productName && m.productName.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q)) ||
        (m.username && m.username.toLowerCase().includes(q))

      const matchesType = typeFilter === 'ALL' ? true : m.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [movements, search, typeFilter])

  // Filtered products for Stock View
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      )
    })
  }, [products, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Boxes className="h-4 w-4" />
            <span>Almacén y Logística</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Control de Inventario y Kardex
          </h1>
          <p className="text-sm text-slate-500">
            Supervisión continua de existencias, rotación de mercadería y movimientos físicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar Movimiento</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-800">Unidades en Stock</p>
            <Package className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{totalStockUnits}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Artículos físicos en bodega</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Valorización Estimada</p>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            S/ {totalValuation.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Precio venta al público</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Catálogo Activo</p>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">SKUs registrados en sistema</p>
        </Card>

        <Card
          className={`p-4 border ${
            lowStockCount > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p
              className={`text-xs font-medium ${
                lowStockCount > 0 ? 'text-amber-800' : 'text-slate-600'
              }`}
            >
              Stock Crítico (≤ 5)
            </p>
            <AlertTriangle
              className={`h-4 w-4 ${
                lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'
              }`}
            />
          </div>
          <p
            className={`text-2xl font-bold mt-1 ${
              lowStockCount > 0 ? 'text-amber-900' : 'text-slate-900'
            }`}
          >
            {lowStockCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-1">Requieren reposición urgente</p>
        </Card>
      </div>

      {/* Main View Card with Tabs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* View switcher buttons */}
            <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50 self-start">
              <button
                type="button"
                onClick={() => setActiveTab('kardex')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'kardex'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Historial Kardex ({filteredMovements.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'stock'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disponibilidad por Producto ({filteredProducts.length})
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {activeTab === 'kardex' && (
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="ALL">Todas las Operaciones</option>
                  <option value="ENTRADA">Entradas (+)</option>
                  <option value="SALIDA">Salidas (-)</option>
                  <option value="AJUSTE">Ajustes (±)</option>
                </select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeTab === 'kardex' ? (
            /* Kardex Movements Table */
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-xs">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Operación</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-center">Stock: Antes → Después</TableHead>
                  <TableHead>Motivo / Justificación</TableHead>
                  <TableHead className="text-right">Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                      No se encontraron movimientos registrados en Kardex
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((m) => (
                    <TableRow key={m.id} className="text-xs hover:bg-slate-50/60">
                      <TableCell className="font-mono text-slate-400">
                        #{m.id}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString('es-PE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {m.productName}
                      </TableCell>
                      <TableCell>
                        {m.type === 'ENTRADA' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 font-semibold">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>ENTRADA</span>
                          </Badge>
                        ) : m.type === 'SALIDA' ? (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-200 gap-1 font-semibold">
                            <ArrowDownRight className="h-3 w-3" />
                            <span>SALIDA</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 font-semibold">
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>AJUSTE</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-900 font-mono">
                        {m.type === 'ENTRADA'
                          ? `+${m.quantity}`
                          : m.type === 'SALIDA'
                          ? `-${m.quantity}`
                          : m.quantity}
                      </TableCell>
                      <TableCell className="text-center font-mono text-slate-600">
                        {m.previousStock} →{' '}
                        <strong className="text-slate-900">{m.newStock}</strong>
                      </TableCell>
                      <TableCell className="text-slate-700 max-w-xs truncate">
                        {m.reason}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 font-medium">
                        {m.username || 'Sistema'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            /* Stock Status Table */
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 text-xs">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock Actual</TableHead>
                  <TableHead className="text-center">Diagnóstico</TableHead>
                  <TableHead className="text-right">Valuación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0
                  const isLow = p.stock <= 5 && p.stock > 0

                  return (
                    <TableRow key={p.id} className="text-xs hover:bg-slate-50/60">
                      <TableCell className="font-mono text-slate-400">
                        #{p.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.barcode || 'Sin código'}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {p.category?.name || 'General'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-800">
                        S/ {Number(p.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-slate-900">
                        {p.stock}
                      </TableCell>
                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-200 gap-1">
                            <PackageX className="h-3 w-3" />
                            <span>Agotado</span>
                          </Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Crítico</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Óptimo</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-emerald-800">
                        S/ {(p.stock * p.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Movement Modal */}
      <MovimientoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={loadData}
      />
    </div>
  )
}
