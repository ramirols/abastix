import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { categoryService } from '../api/services/categoryService'
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

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
})

export default function CategoriaModal({ open, onOpenChange, initial, onSaved }) {
  const isEditing = Boolean(initial?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name ?? '',
      })
    } else {
      reset({
        name: '',
      })
    }
  }, [initial, reset, open])

  async function onSubmit(data) {
    try {
      if (isEditing) {
        await categoryService.actualizar(initial.id, { name: data.name })
        toast.success(`Categoría "${data.name}" actualizada con éxito`)
      } else {
        await categoryService.crear({ name: data.name })
        toast.success(`Categoría "${data.name}" creada con éxito`)
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar la categoría'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica el nombre de la categoría en el catálogo.'
              : 'Ingresa los datos para registrar una nueva categoría de productos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Nombre de categoría *</Label>
            <Input
              id="category-name"
              placeholder="Ej. Abarrotes, Bebidas, Lácteos"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs font-medium text-rose-600">
                {errors.name.message}
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
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                ? 'Guardar Cambios'
                : 'Crear Categoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
