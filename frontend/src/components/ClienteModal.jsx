import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { customerService } from '../api/services/customerService'
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

const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  document: z
    .string()
    .trim()
    .min(5, 'El documento debe tener al menos 5 caracteres (DNI / RUC)')
    .max(30, 'Máximo 30 caracteres'),
  phone: z
    .string()
    .trim()
    .max(30, 'Máximo 30 caracteres')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Formato de correo electrónico inválido')
    .max(150, 'Máximo 150 caracteres')
    .optional()
    .or(z.literal('')),
})

export default function ClienteModal({ open, onOpenChange, initial, onSaved }) {
  const isEditing = Boolean(initial?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      document: '',
      phone: '',
      email: '',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        fullName: initial.fullName ?? '',
        document: initial.document ?? '',
        phone: initial.phone ?? '',
        email: initial.email ?? '',
      })
    } else {
      reset({
        fullName: '',
        document: '',
        phone: '',
        email: '',
      })
    }
  }, [initial, reset, open])

  async function onSubmit(data) {
    try {
      const payload = {
        fullName: data.fullName,
        document: data.document,
        phone: data.phone || null,
        email: data.email || null,
      }

      if (isEditing) {
        await customerService.actualizar(initial.id, payload)
        toast.success(`Cliente "${data.fullName}" actualizado con éxito`)
      } else {
        await customerService.crear(payload)
        toast.success(`Cliente "${data.fullName}" registrado con éxito`)
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el cliente'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los datos de contacto y facturación del cliente.'
              : 'Registra un nuevo cliente comercial en Abastix.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-fullName">Razón Social / Nombre Completo *</Label>
            <Input
              id="customer-fullName"
              placeholder="Ej. Bodega Don Lucho S.A.C. o Juan Pérez"
              {...register('fullName')}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-xs font-medium text-rose-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-document">N° Documento (DNI / RUC / CE) *</Label>
            <Input
              id="customer-document"
              placeholder="Ej. 20601234567 o 45892134"
              {...register('document')}
              disabled={isSubmitting}
            />
            {errors.document && (
              <p className="text-xs font-medium text-rose-600">
                {errors.document.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer-phone">Teléfono / Celular</Label>
              <Input
                id="customer-phone"
                placeholder="Ej. 987654321"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer-email">Correo Electrónico</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="cliente@ejemplo.pe"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>
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
                : 'Registrar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
