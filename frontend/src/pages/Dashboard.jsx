import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Bell,
  RefreshCw,
} from 'lucide-react'
import { dashboardService } from '../api/services/dashboardService'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
          'No se pudo conectar con el servicio de estadísticas'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Configuración del gráfico de evolución de ventas (últimos 7 días)
  const salesChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      animations: { enabled: true },
    },
    colors: ['#166534'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: {
      categories: stats?.salesChart?.map((p) => p.date) || [],
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: (val) => `S/ ${Number(val).toFixed(0)}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `S/ ${Number(val).toFixed(2)}`,
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
    },
  }

  const salesChartSeries = [
    {
      name: 'Ventas (S/)',
      data: stats?.salesChart?.map((p) => Number(p.total)) || [],
    },
  ]

  // Configuración del gráfico de pedidos por estado
  const statusLabels = stats?.ordersByStatus?.filter((s) => s.count > 0).map((s) => s.status) || []
  const statusSeries = stats?.ordersByStatus?.filter((s) => s.count > 0).map((s) => Number(s.count)) || []

  const statusChartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: statusLabels,
    colors: ['#166534', '#0284c7', '#f59e0b', '#10b981', '#64748b', '#ef4444'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: { colors: '#475569' },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Pedidos',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              formatter: () => statusSeries.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMADO':
        return <Badge className="bg-emerald-600 text-white">Confirmado</Badge>
      case 'PREPARANDO':
        return <Badge className="bg-blue-600 text-white">Preparando</Badge>
      case 'LISTO':
        return <Badge className="bg-teal-600 text-white">Listo</Badge>
      case 'ENTREGADO':
        return <Badge className="bg-slate-700 text-white">Entregado</Badge>
      case 'CANCELADO':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            PANEL OPERATIVO
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bienvenido, <strong className="text-slate-800">{user?.fullName}</strong>. Resumen de la operación comercial en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            disabled={loading}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Link to="/pedidos/nuevo">
            <Button size="sm" className="bg-[#166534] hover:bg-[#14532d] text-white gap-1.5 text-xs font-semibold shadow-xs">
              <PlusCircle className="h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong>Error al cargar estadísticas:</strong> {error}
          </div>
        </div>
      )}

      {/* 4 Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Productos Activos */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Productos Activos
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-black text-slate-900">{stats?.activeProducts ?? 0}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Disponibles en catálogo</p>
          </CardContent>
        </Card>

        {/* Bajo Stock */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock Bajo
            </CardTitle>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              (stats?.lowStockProducts ?? 0) > 0
                ? 'bg-amber-100 text-amber-700 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-black ${
                (stats?.lowStockProducts ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {stats?.lowStockProducts ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {(stats?.lowStockProducts ?? 0) > 0
                ? 'Requieren abastecimiento'
                : 'Nivel de inventario óptimo'}
            </p>
          </CardContent>
        </Card>

        {/* Pedidos del Día */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pedidos Hoy
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-black text-slate-900">{stats?.todayOrdersCount ?? 0}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Órdenes procesadas hoy</p>
          </CardContent>
        </Card>

        {/* Ventas del Día */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ventas Hoy
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-black text-emerald-700">
                S/ {Number(stats?.todaySalesTotal ?? 0).toFixed(2)}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Ingresos acumulados hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos ApexCharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Evolución de ventas (7 días) */}
        <Card className="lg:col-span-8 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#166534]" />
              Evolución de Ventas (Últimos 7 días)
            </CardTitle>
            <CardDescription className="text-xs">
              Monto total de ventas confirmadas por día calculado en el servidor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-56 w-full" />
              </div>
            ) : stats?.salesChart && stats.salesChart.length > 0 ? (
              <div className="h-64">
                <Chart
                  options={salesChartOptions}
                  series={salesChartSeries}
                  type="area"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Boxes className="h-8 w-8 mb-2 opacity-50" />
                No hay ventas registradas en el período seleccionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2: Pedidos por Estado */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Distribución de Pedidos
            </CardTitle>
            <CardDescription className="text-xs">
              Proporción de pedidos según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : statusSeries.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <Chart
                  options={statusChartOptions}
                  series={statusSeries}
                  type="donut"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                No hay pedidos para mostrar en el gráfico
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recientes y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Últimos Pedidos Registrados
              </CardTitle>
              <CardDescription className="text-xs">
                Movimientos comerciales recientes
              </CardDescription>
            </div>
            <Link to="/pedidos">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-[#166534]">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Orden</th>
                    <th className="py-2.5 px-4">Cliente</th>
                    <th className="py-2.5 px-4">Método</th>
                    <th className="py-2.5 px-4">Total</th>
                    <th className="py-2.5 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="p-4" colSpan={5}>
                          <Skeleton className="h-4 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{o.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {o.customerName || 'Cliente General'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {o.paymentMethod}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#166534]">
                          S/ {Number(o.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(o.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay pedidos recientes registrados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Accesos Rápidos */}
        <Card className="lg:col-span-4 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Accesos Rápidos
            </CardTitle>
            <CardDescription className="text-xs">
              Operaciones frecuentes del negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/pedidos/nuevo" className="block">
              <div className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-[#166534] flex items-center justify-center font-bold">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-[#166534]">
                      Registrar Nueva Venta
                    </strong>
                    <span className="text-[11px] text-slate-500">Descuento de stock en POS</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#166534] transition-colors" />
              </div>
            </Link>

            <Link to="/inventario" className="block">
              <div className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                      Entrada / Salida de Stock
                    </strong>
                    <span className="text-[11px] text-slate-500">Kardex y movimientos</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
              </div>
            </Link>

            <Link to="/notificaciones" className="block">
              <div className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">
                      Bandeja de Alertas
                    </strong>
                    <span className="text-[11px] text-slate-500">Eventos RabbitMQ</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
