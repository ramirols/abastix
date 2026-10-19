import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { userService } from '../api/services/userService'
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

const createSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  email: z
    .string()
    .trim()
    .email('Formato de correo electrónico inválido')
    .max(150, 'Máximo 150 caracteres'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_EMPLEADO']),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

const updateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  email: z.string().optional(),
  role: z.enum(['ROLE_ADMIN', 'ROLE_EMPLEADO']),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'Si cambias la contraseña, debe tener al menos 6 caracteres',
    }),
})

export default function UsuarioModal({ open, onOpenChange, initial, onSaved }) {
  const isEditing = Boolean(initial?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'ROLE_EMPLEADO',
      password: '',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        fullName: initial.fullName ?? '',
        email: initial.email ?? '',
        role: initial.role ?? 'ROLE_EMPLEADO',
        password: '',
      })
    } else {
      reset({
        fullName: '',
        email: '',
        role: 'ROLE_EMPLEADO',
        password: '',
      })
    }
  }, [initial, reset, open])

  async function onSubmit(data) {
    try {
      if (isEditing) {
        const payload = {
          fullName: data.fullName,
          role: data.role,
          password: data.password ? data.password : null,
        }
        await userService.actualizar(initial.id, payload)
        toast.success(`Usuario "${data.fullName}" actualizado con éxito`)
      } else {
        const payload = {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          password: data.password,
        }
        await userService.crear(payload)
        toast.success(`Usuario "${data.fullName}" registrado con éxito`)
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el usuario'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Usuario' : 'Nuevo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza los permisos de acceso y datos del usuario.'
              : 'Registra una nueva cuenta para dar acceso al sistema Abastix.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="usr-fullName">Nombre Completo *</Label>
            <Input
              id="usr-fullName"
              placeholder="Ej. Ana Lucía Gómez"
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
            <Label htmlFor="usr-email">Correo Electrónico (Login) *</Label>
            <Input
              id="usr-email"
              type="email"
              placeholder="ana.gomez@abastix.pe"
              {...register('email')}
              disabled={isSubmitting || isEditing}
            />
            {isEditing && (
              <p className="text-[11px] text-slate-400">
                El correo electrónico identifica la cuenta y no se puede modificar.
              </p>
            )}
            {errors.email && (
              <p className="text-xs font-medium text-rose-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usr-role">Rol de Seguridad *</Label>
            <select
              id="usr-role"
              {...register('role')}
              disabled={isSubmitting}
              className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ROLE_EMPLEADO">Empleado (Ventas y Catálogo)</option>
              <option value="ROLE_ADMIN">Administrador (Acceso Total)</option>
            </select>
            {errors.role && (
              <p className="text-xs font-medium text-rose-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usr-password">
              {isEditing
                ? 'Nueva Contraseña (dejar en blanco para conservar actual)'
                : 'Contraseña de Acceso *'}
            </Label>
            <Input
              id="usr-password"
              type="password"
              placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs font-medium text-rose-600">
                {errors.password.message}
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
                : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
