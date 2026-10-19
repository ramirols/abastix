import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { productService } from '../api/services/productService'
import { categoryService } from '../api/services/categoryService'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const productSchema = z.object({
  categoryId: z.coerce.number().min(1, 'Selecciona una categoría válida'),
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150, 'Máximo 150 caracteres'),
  sku: z.string().trim().min(2, 'El código SKU es obligatorio').max(50, 'Máximo 50 caracteres'),
  price: z.coerce.number().positive('El precio debe ser un número positivo mayor a 0'),
  stock: z.coerce.number().int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo'),
  minStock: z.coerce.number().int('El stock mínimo debe ser un número entero').min(0, 'El stock mínimo no puede ser negativo'),
})

export default function ProductoModal({ initial, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)

  const isEditing = Boolean(initial?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      sku: '',
      price: '',
      stock: '',
      minStock: '',
    },
  })

  useEffect(() => {
    categoryService
      .listar(true)
      .then((data) => setCategories(data))
      .catch(() => toast.error('Error al cargar la lista de categorías'))
      .finally(() => setLoadingCats(false))
  }, [])

  useEffect(() => {
    if (initial) {
      reset({
        categoryId: initial.categoryId || '',
        name: initial.name || '',
        sku: initial.sku || '',
        price: initial.price || '',
        stock: initial.stock ?? '',
        minStock: initial.minStock ?? '',
      })
    } else {
      reset({
        categoryId: '',
        name: '',
        sku: '',
        price: '',
        stock: '',
        minStock: '',
      })
    }
  }, [initial, reset])

  async function onSubmit(data) {
    try {
      if (isEditing) {
        await productService.actualizar(initial.id, data)
        toast.success('Producto actualizado', { description: `Se actualizaron los datos de ${data.name}.` })
      } else {
        await productService.crear(data)
        toast.success('Producto registrado', { description: `${data.name} se agregó al catálogo.` })
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Ocurrió un error al guardar el producto'
      toast.error('Error al guardar', { description: msg })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-xl">
        <DialogHeader>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            {isEditing ? 'MODIFICACIÓN' : 'NUEVO REGISTRO'}
          </span>
          <DialogTitle>{isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos del producto en el catálogo oficial.'
              : 'Completa los campos obligatorios para dar de alta el producto.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Categoría */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryId" className="flex justify-between">
              <span>Categoría *</span>
              {errors.categoryId && <span className="text-xs text-red-600 font-medium">{errors.categoryId.message}</span>}
            </Label>
            <Select id="categoryId" disabled={loadingCats || isSubmitting} {...register('categoryId')}>
              <option value="">Selecciona una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex justify-between">
              <span>Nombre del Producto *</span>
              {errors.name && <span className="text-xs text-red-600 font-medium">{errors.name.message}</span>}
            </Label>
            <Input
              id="name"
              placeholder="Ej: Laptop HP 15, Aceite Primor 1L..."
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
              {...register('name')}
            />
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="sku" className="flex justify-between">
              <span>Código SKU / Identificador *</span>
              {errors.sku && <span className="text-xs text-red-600 font-medium">{errors.sku.message}</span>}
            </Label>
            <Input
              id="sku"
              placeholder="Ej: LAP-001, ALIM-045..."
              disabled={isSubmitting}
              className={errors.sku ? 'border-red-500' : ''}
              {...register('sku')}
            />
          </div>

          {/* Grilla: Precio, Stock, Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="flex justify-between">
                <span>Precio (S/) *</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
                className={errors.price ? 'border-red-500' : ''}
                {...register('price')}
              />
              {errors.price && <p className="text-xs text-red-600 font-medium">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock" className="flex justify-between">
                <span>Stock Actual *</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                disabled={isSubmitting}
                className={errors.stock ? 'border-red-500' : ''}
                {...register('stock')}
              />
              {errors.stock && <p className="text-xs text-red-600 font-medium">{errors.stock.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="minStock" className="flex justify-between">
                <span>Stock Mínimo *</span>
              </Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                placeholder="0"
                disabled={isSubmitting}
                className={errors.minStock ? 'border-red-500' : ''}
                {...register('minStock')}
              />
              {errors.minStock && <p className="text-xs text-red-600 font-medium">{errors.minStock.message}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#166534] hover:bg-[#14532d] text-white">
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
