import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { inventoryService } from '../api/services/inventoryService'
import { productService } from '../api/services/productService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

const movementSchema = z.object({
  productId: z.string().min(1, 'Debes seleccionar un producto'),
  type: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'La cantidad debe ser un número entero' })
    .int('Debe ser un número entero')
    .positive('La cantidad debe ser mayor a cero'),
  reason: z
    .string()
    .trim()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(255, 'Máximo 255 caracteres'),
})

export default function MovimientoModal({ open, onOpenChange, onSaved }) {
  const [products, setProducts] = useState([])
  const [loadingProds, setLoadingProds] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: '',
      type: 'ENTRADA',
      quantity: '',
      reason: '',
    },
  })

  const selectedProdId = watch('productId')

  const selectedProduct = products.find(
    (p) => p.id?.toString() === selectedProdId?.toString()
  )

  useEffect(() => {
    async function loadProducts() {
      if (!open) return
      setLoadingProds(true)
      try {
        const data = await productService.listar(true)
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        toast.error('Error al cargar productos para el movimiento')
      } finally {
        setLoadingProds(false)
      }
    }

    loadProducts()
    reset({
      productId: '',
      type: 'ENTRADA',
      quantity: '',
      reason: '',
    })
  }, [open, reset])

  async function onSubmit(data) {
    const qty = parseInt(data.quantity, 10)
    if (data.type === 'SALIDA' && selectedProduct && qty > selectedProduct.stock) {
      toast.error(
        `No puedes registrar una salida mayor al stock disponible (${selectedProduct.stock})`
      )
      return
    }

    try {
      await inventoryService.registrarMovimiento({
        productId: parseInt(data.productId, 10),
        type: data.type,
        quantity: qty,
        reason: data.reason,
      })

      toast.success('Movimiento de almacén registrado con éxito')
      onSaved()
      onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar el movimiento'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Kardex</DialogTitle>
          <DialogDescription>
            Ajusta, recepciona o retira existencias físicas del almacén con auditoría.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product selector */}
          <div className="space-y-1.5">
            <Label htmlFor="mov-product">Producto *</Label>
            <select
              id="mov-product"
              {...register('productId')}
              disabled={isSubmitting || loadingProds}
              className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name} (Stock actual: {p.stock})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs font-medium text-rose-600">
                {errors.productId.message}
              </p>
            )}
          </div>

          {selectedProduct && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs flex justify-between">
              <span className="text-slate-500">Stock Actual en Sistema:</span>
              <span className="font-bold text-slate-900 font-mono">
                {selectedProduct.stock} unidades
              </span>
            </div>
          )}

          {/* Movement Type & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mov-type">Tipo de Operación *</Label>
              <select
                id="mov-type"
                {...register('type')}
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ENTRADA">ENTRADA (Recepción)</option>
                <option value="SALIDA">SALIDA (Merma/Retiro)</option>
                <option value="AJUSTE">AJUSTE (Conteo físico)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mov-qty">Cantidad *</Label>
              <Input
                id="mov-qty"
                type="number"
                min="1"
                placeholder="Ej. 10"
                {...register('quantity')}
                disabled={isSubmitting}
              />
              {errors.quantity && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="mov-reason">Motivo o Justificación *</Label>
            <Textarea
              id="mov-reason"
              placeholder="Ej. Ingreso de factura F001-492 / Decomiso por fecha de vencimiento..."
              {...register('reason')}
              disabled={isSubmitting}
              className="h-20 text-xs"
            />
            {errors.reason && (
              <p className="text-xs font-medium text-rose-600">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
