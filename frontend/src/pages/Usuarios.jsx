import { useEffect, useState, useMemo } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Search,
  Shield,
  UserCheck,
  Edit2,
  Power,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { userService } from '../api/services/userService'
import UsuarioModal from '../components/UsuarioModal'
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

export default function Usuarios() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Confirm toggle
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await userService.listar()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Error al cargar la lista de colaboradores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase()
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      )
    })
  }, [users, search])

  async function handleToggleStatus() {
    if (!confirmToggle) return
    setActionLoading(true)
    try {
      if (confirmToggle.active) {
        await userService.desactivar(confirmToggle.id)
        toast.success(`Cuenta de "${confirmToggle.fullName}" desactivada`)
      } else {
        await userService.activar(confirmToggle.id)
        toast.success(`Cuenta de "${confirmToggle.fullName}" activada`)
      }
      await loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    } finally {
      setActionLoading(false)
      setConfirmToggle(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acceso Restringido</h2>
        <p className="max-w-md text-sm text-slate-500">
          La administración de cuentas y asignación de credenciales requiere privilegios de Administrador (ROLE_ADMIN).
        </p>
      </div>
    )
  }

  const adminCount = users.filter((u) => u.role === 'ROLE_ADMIN').length
  const employeeCount = users.filter((u) => u.role === 'ROLE_EMPLEADO').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Seguridad y Accesos</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Control de Usuarios y Roles
          </h1>
          <p className="text-sm text-slate-500">
            Gestión de credenciales internas y roles RBAC (ROLE_ADMIN, ROLE_EMPLEADO).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedUser(null)
              setIsModalOpen(true)
            }}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Colaborador</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-xs font-medium text-emerald-800">Total Colaboradores</p>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{users.length}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Administradores (ROLE_ADMIN)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{adminCount}</p>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <p className="text-xs font-medium text-slate-600">Operadores (ROLE_EMPLEADO)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{employeeCount}</p>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Cuentas Registradas</CardTitle>
              <CardDescription>
                {filteredUsers.length} cuentas con credenciales de acceso activas
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o correo..."
                className="pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Correo de Acceso</TableHead>
                <TableHead>Rol Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle className="h-6 w-6 text-slate-400" />
                      <p className="font-medium text-slate-700">No se encontraron usuarios</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === user?.id

                  return (
                    <TableRow key={u.id} className={!u.active ? 'opacity-70 bg-slate-50/50' : ''}>
                      <TableCell className="font-mono text-xs text-slate-400">
                        #{u.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[10px] bg-slate-100">
                              Tú
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        {u.role === 'ROLE_ADMIN' ? (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 font-semibold">
                            <Shield className="h-3 w-3" />
                            <span>Administrador</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 gap-1 font-medium">
                            <UserCheck className="h-3 w-3" />
                            <span>Empleado</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.active ? (
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
                              setSelectedUser(u)
                              setIsModalOpen(true)
                            }}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                u.active
                                  ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              onClick={() => setConfirmToggle(u)}
                              title={u.active ? 'Desactivar' : 'Activar'}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <UsuarioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={selectedUser}
        onSaved={loadUsers}
      />

      {/* AlertDialog Toggle */}
      <AlertDialog
        open={Boolean(confirmToggle)}
        onOpenChange={(open) => !open && setConfirmToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.active
                ? '¿Desactivar acceso a este colaborador?'
                : '¿Reactivar acceso?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.active
                ? `Al desactivar a "${confirmToggle?.fullName}", sus credenciales serán revocadas de inmediato y no podrá iniciar sesión en Abastix.`
                : `Se reactivará la cuenta de "${confirmToggle?.fullName}" y podrá volver a acceder a la plataforma.`}
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
                : 'Sí, reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
