import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Package,
  UserCheck,
  CreditCard,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { productService } from '../api/services/productService'
import { customerService } from '../api/services/customerService'
import { categoryService } from '../api/services/categoryService'
import { orderService } from '../api/services/orderService'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Textarea } from '../components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

export default function NuevoPedido() {
  const navigate = useNavigate()

  // Data sources
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters for product selector
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Order state
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState([]) // Array of { product, quantity }

  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const [prodData, custData, catData] = await Promise.all([
          productService.listar(true), // active products
          customerService.listar(true), // active customers
          categoryService.listar(true), // active categories
        ])
        setProducts(Array.isArray(prodData) ? prodData : [])
        setCustomers(Array.isArray(custData) ? custData : [])
        setCategories(Array.isArray(catData) ? catData : [])

        if (Array.isArray(custData) && custData.length > 0) {
          setSelectedCustomerId(custData[0].id.toString())
        }
      } catch (err) {
        toast.error('Error al inicializar el catálogo para el nuevo pedido')
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [])

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      const matchesCat =
        selectedCategory === 'ALL'
          ? true
          : p.category?.id?.toString() === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [products, search, selectedCategory])

  // Cart actions
  function addToCart(product) {
    if (product.stock <= 0) {
      toast.error('Este producto no tiene stock disponible')
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning(`No puedes agregar más de ${product.stock} unidades de este producto`)
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })
  }

  function updateQuantity(productId, newQty) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (newQty <= 0) {
      removeFromCart(productId)
      return
    }

    if (newQty > product.stock) {
      toast.warning(`Stock máximo disponible: ${product.stock}`)
      return
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    )
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  // Financial calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [cart])

  const subtotal = totalAmount / 1.18
  const igv = totalAmount - subtotal

  async function handleCreateOrder(e) {
    e.preventDefault()

    if (!selectedCustomerId) {
      toast.error('Debes seleccionar un cliente para el pedido')
      return
    }

    if (cart.length === 0) {
      toast.error('El pedido debe contener al menos un producto')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customerId: parseInt(selectedCustomerId, 10),
        paymentMethod,
        notes: notes.trim() || null,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }

      const created = await orderService.crear(payload)
      toast.success(`Pedido #${created.id} procesado con éxito`)
      navigate('/pedidos')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-9 w-9 text-slate-600"
          >
            <Link to="/pedidos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Nuevo Pedido de Venta
            </h1>
            <p className="text-xs text-slate-500">
              Terminal POS y registro comercial con descuento de stock en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Catalog & Selection (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Catálogo de Productos Disponibles</span>
                <Badge variant="outline" className="text-xs">
                  {filteredProducts.length} productos
                </Badge>
              </CardTitle>
              <CardDescription>
                Selecciona productos para incorporarlos al comprobante de venta.
              </CardDescription>

              {/* Search & Category Filter */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre o código de barra..."
                    className="pl-8 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 sm:w-44"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-7 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-medium text-slate-700">No hay productos disponibles</p>
                  <p className="text-xs text-slate-500">
                    Ajusta los filtros o añade stock a los productos del inventario.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[560px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => {
                    const inCart = cart.find((item) => item.product.id === p.id)
                    const isOutOfStock = p.stock <= 0
                    const isLowStock = p.stock <= 5 && p.stock > 0

                    return (
                      <div
                        key={p.id}
                        className={`flex flex-col justify-between rounded-lg border p-3.5 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                              {p.name}
                            </h3>
                            <span className="shrink-0 text-sm font-bold text-emerald-800">
                              S/ {Number(p.price).toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <span>{p.category?.name || 'General'}</span>
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                isOutOfStock
                                  ? 'text-rose-600'
                                  : isLowStock
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              Stock: {p.stock}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {p.barcode || `SKU-${p.id}`}
                          </span>

                          <Button
                            type="button"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(p)}
                            className="h-7 px-2.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{inCart ? `Agregar (+${inCart.quantity})` : 'Agregar'}</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Checkout Summary (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <Card className="border-emerald-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 bg-emerald-50/40">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-950">
                  <ShoppingCart className="h-4 w-4 text-emerald-700" />
                  <span>Resumen del Pedido</span>
                </CardTitle>
                <CardDescription>
                  Cliente, método de cobro y desglose final.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Customer Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="customer-select" className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                    <span>Cliente *</span>
                  </Label>
                  <select
                    id="customer-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="" disabled>
                      Seleccionar cliente...
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.fullName} ({c.document})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <Label htmlFor="payment-select" className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                    <span>Forma de Pago *</span>
                  </Label>
                  <select
                    id="payment-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="EFECTIVO">Efectivo contra entrega</option>
                    <option value="YAPE">Billetera Digital - Yape</option>
                    <option value="PLIN">Billetera Digital - Plin</option>
                    <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria (BCP/BBVA)</option>
                  </select>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                    <span>Artículos ({cart.length})</span>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCart([])}
                        className="text-rose-600 hover:underline capitalize"
                      >
                        Vaciar
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-400">
                      <p className="text-sm">El carrito está vacío</p>
                      <p className="text-xs">
                        Haz clic en &quot;Agregar&quot; en cualquier producto del catálogo.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-semibold text-slate-800 line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-slate-500 font-mono">
                              S/ {Number(item.product.price).toFixed(2)} c/u
                            </p>
                          </div>

                          {/* Quantity selector */}
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Line total & remove */}
                          <div className="flex items-center gap-2 pl-2">
                            <span className="w-16 text-right font-mono font-bold text-slate-900">
                              S/ {(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-rose-600"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="order-notes" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span>Observaciones / Instrucciones de Entrega</span>
                  </Label>
                  <Textarea
                    id="order-notes"
                    placeholder="Ej. Entregar en horario matutino antes de las 11:00 AM..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-16 text-xs"
                  />
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Imponible:</span>
                    <span className="font-mono">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IGV (18%):</span>
                    <span className="font-mono">S/ {igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                    <span>Total a Pagar:</span>
                    <span className="font-mono text-emerald-800">
                      S/ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || cart.length === 0 || !selectedCustomerId}
                  className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {submitting ? 'Procesando Pedido...' : 'Confirmar y Guardar Pedido'}
                  </span>
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
