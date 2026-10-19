import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Layers,
  Users,
  ShoppingCart,
  Boxes,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Lock,
  Server,
  Database,
  Menu,
  X,
  Store,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const modules = [
    {
      icon: Package,
      name: 'Productos y Precios',
      description: 'Gestión unificada de catálogo, precios de venta, SKU y control de stock mínimo con alertas preventivas.',
    },
    {
      icon: Layers,
      name: 'Categorías Organizadas',
      description: 'Clasificación intuitiva de inventario para agilizar la búsqueda y mantener el orden del negocio.',
    },
    {
      icon: Users,
      name: 'Directorio de Clientes',
      description: 'Registro de clientes habituales con número de documento, teléfono y trazabilidad de sus pedidos.',
    },
    {
      icon: ShoppingCart,
      name: 'Ventas y Pedidos',
      description: 'Registro rápido de ventas, cálculo seguro de importes en el servidor y control de estados de pedido.',
    },
    {
      icon: Boxes,
      name: 'Control de Inventario',
      description: 'Trazabilidad de entradas, salidas y ajustes de stock con registro del usuario responsable.',
    },
    {
      icon: Bell,
      name: 'Alertas Inteligentes',
      description: 'Notificaciones automáticas procesadas de forma asíncrona mediante RabbitMQ ante stock crítico.',
    },
    {
      icon: LayoutDashboard,
      name: 'Dashboard Operativo',
      description: 'Visualización clara de ventas del día, pedidos activos y métricas de existencias en tiempo real.',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Registro de Venta',
      description: 'El colaborador ingresa los productos solicitados por el cliente desde la interfaz web.',
      icon: ShoppingCart,
    },
    {
      step: '02',
      title: 'Validación en Servidor',
      description: 'Spring Boot valida las existencias en tiempo real y calcula los importes con los precios oficiales.',
      icon: Server,
    },
    {
      step: '03',
      title: 'Persistencia Transaccional',
      description: 'La orden y el movimiento de salida se guardan en Microsoft SQL Server garantizando la integridad de los datos.',
      icon: Database,
    },
    {
      step: '04',
      title: 'Alerta Asíncrona con RabbitMQ',
      description: 'Si el stock restante alcanza el mínimo establecido, se emite un evento asíncrono que genera la alerta al administrador.',
      icon: Bell,
    },
  ]

  const benefits = [
    {
      title: 'Control exacto de existencias',
      description: 'Elimina las discrepancias entre lo anotado y lo físico, conociendo el stock disponible al instante.',
      icon: CheckCircle2,
    },
    {
      title: 'Reducción de tareas manuales',
      description: 'Deja atrás los cuadernos borrosos y las hojas de cálculo propensas a errores de digitación.',
      icon: Clock,
    },
    {
      title: 'Trazabilidad completa de operaciones',
      description: 'Cada venta y movimiento de inventario queda registrado con fecha, hora y usuario responsable.',
      icon: TrendingUp,
    },
    {
      title: 'Roles y permisos diferenciados',
      description: 'Acceso delimitado para colaboradores operativos y control total para los administradores.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header institucional */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#166534] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-900/10">
              <Store className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Abastix
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800">
                Gestión Comercial
              </span>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#problema" className="hover:text-[#166534] transition-colors">
              Problema y Solución
            </a>
            <a href="#modulos" className="hover:text-[#166534] transition-colors">
              Módulos
            </a>
            <a href="#flujo" className="hover:text-[#166534] transition-colors">
              Cómo Funciona
            </a>
            <a href="#beneficios" className="hover:text-[#166534] transition-colors">
              Beneficios
            </a>
            <a href="#seguridad" className="hover:text-[#166534] transition-colors">
              Seguridad
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button className="bg-[#166534] hover:bg-[#14532d] text-white shadow-sm font-medium px-5">
                Ingresar al sistema
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Botón Móvil */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú principal"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menú Móvil desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <a
              href="#problema"
              className="block py-2 text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Problema y Solución
            </a>
            <a
              href="#modulos"
              className="block py-2 text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Módulos
            </a>
            <a
              href="#flujo"
              className="block py-2 text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cómo Funciona
            </a>
            <a
              href="#beneficios"
              className="block py-2 text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beneficios
            </a>
            <a
              href="#seguridad"
              className="block py-2 text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Seguridad
            </a>
            <div className="pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#166534] text-white">
                  Ingresar al sistema
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ========================================================
            SECCIÓN 1: HERO
        ======================================================== */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  PLATAFORMA INTEGRAL PARA COMERCIOS
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
                  Gestión ordenada de{' '}
                  <span className="text-[#166534] bg-gradient-to-r from-[#166534] to-emerald-700 bg-clip-text text-transparent">
                    inventario, ventas y pedidos
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                  Diseñado para pequeñas bodegas y tiendas que necesitan dar el salto del cuaderno y las notas dispersas hacia una administración centralizada, trazable y segura.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link to="/login">
                    <Button size="lg" className="w-full sm:w-auto bg-[#166534] hover:bg-[#14532d] text-white font-semibold shadow-md">
                      Ingresar al sistema
                      <ArrowRight className="h-5 w-5 ml-1.5" />
                    </Button>
                  </Link>
                  <a href="#modulos">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100">
                      Explorar módulos
                    </Button>
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-lg">
                  <div>
                    <strong className="block text-xl font-bold text-slate-900">100%</strong>
                    <span className="text-xs text-slate-500">Transaccional en servidor</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-bold text-slate-900">RabbitMQ</strong>
                    <span className="text-xs text-slate-500">Alertas asíncronas</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-bold text-slate-900">SQL Server</strong>
                    <span className="text-xs text-slate-500">Persistencia relacional</span>
                  </div>
                </div>
              </div>

              {/* Mockup visual representativo */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 max-w-md">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Panel Abastix POS</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">Última Venta</span>
                        <strong className="text-emerald-950 text-sm">Pedido #1042 — Confirmado</strong>
                      </div>
                      <span className="text-sm font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                        S/ 249.90
                      </span>
                    </div>

                    <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-3 flex items-center gap-3">
                      <Bell className="h-5 w-5 text-amber-600 shrink-0" />
                      <div className="text-xs text-amber-900">
                        <strong>Alerta de Stock Bajo:</strong> Mouse Logitech G203 llegó a 3 unidades (mínimo: 5).
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Productos activos:</span>
                        <strong className="text-slate-900">Catálogo al día</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Método de pago:</span>
                        <strong className="text-slate-900">Yape / Plin / Efectivo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Control de sesión:</span>
                        <strong className="text-emerald-700">Cookie HttpOnly Activa</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 2: PROBLEMA Y SOLUCIÓN
        ======================================================== */}
        <section id="problema" className="py-20 bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              DIAGNÓSTICO COMERCIAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
              Los retos reales del comercio minorista
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              La digitalización de las microempresas requiere herramientas prácticas y seguras que ordenen su día a día sin complejidades innecesarias.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
              {/* Problema */}
              <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-red-100 text-red-700 font-bold">
                  Problema Tradicional
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Desorden en inventarios, notas sueltas y quiebres de stock
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold text-base">•</span>
                    <span>Anotaciones en cuadernos que se pierden o generan confusiones en precios y saldos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold text-base">•</span>
                    <span>Falta de visibilidad sobre los productos que están próximos a agotarse, perdiendo ventas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold text-base">•</span>
                    <span>Sin registro formal de quién registró una venta o retiró mercadería del almacén.</span>
                  </li>
                </ul>
              </div>

              {/* Solución */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 space-y-4">
                <div className="inline-flex p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  La Solución Abastix
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Gestión unificada, trazabilidad y automatización
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Catálogo de productos con SKU, precios y stock mínimo sincronizados en servidor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Descuento automático de inventario al concretar ventas con cálculo seguro de importes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Notificaciones automáticas en segundo plano procesadas con RabbitMQ cuando el stock baja.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 3: MÓDULOS DE ABASTIX
        ======================================================== */}
        <section id="modulos" className="py-20 bg-slate-50 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              FUNCIONALIDADES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
              Módulos diseñados para el flujo de tu negocio
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base">
              Cada módulo resuelve un área clave de la operación diaria con interfaces claras y conectadas a la base de datos empresarial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 text-left">
              {modules.map((m, idx) => {
                const IconComponent = m.icon
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#166534] border border-emerald-200/80 flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{m.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 4: CÓMO FUNCIONA
        ======================================================== */}
        <section id="flujo" className="py-20 bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              PROCESO INTEGRADO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
              Flujo operativo de punta a punta
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base">
              Desde el registro de una venta hasta la alerta preventiva de abastecimiento, todo sincronizado en milisegundos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 text-left">
              {workflowSteps.map((step, idx) => {
                const IconComponent = step.icon
                return (
                  <div key={idx} className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black text-[#166534] font-mono">{step.step}</span>
                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                          <IconComponent className="h-5 w-5 text-emerald-800" />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 5: BENEFICIOS
        ======================================================== */}
        <section id="beneficios" className="py-20 bg-slate-50 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                VALOR DE NEGOCIO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                Ventajas para la gestión diaria de tu comercio
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                Resultados claros y comprobables que impactan directamente en la continuidad de la operación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {benefits.map((b, idx) => {
                const IconComponent = b.icon
                return (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 flex items-start gap-4 shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-[#166534] border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 6: SEGURIDAD Y TECNOLOGÍA
        ======================================================== */}
        <section id="seguridad" className="py-20 bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ARQUITECTURA Y PROTECCIÓN
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">
                Seguridad empresarial en cada capa
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                Implementamos estándares de seguridad web para proteger los accesos, la integridad de los datos y las operaciones comerciales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#166534] flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Autenticación con Cookies HttpOnly</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Los tokens JWT no se guardan en el almacenamiento local del navegador (localStorage), eliminando la exposición a ataques de secuestro de sesión mediante XSS.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#166534] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Protección contra CSRF</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Estrategia CSRF con tokens dinámicos en encabezados (X-XSRF-TOKEN) que protege cada operación de creación, actualización y eliminación contra peticiones no autorizadas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#166534] flex items-center justify-center">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Contraseñas con BCrypt</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Las credenciales nunca se almacenan en texto plano en la base de datos SQL Server, aplicando hashing criptográfico irreversible mediante BCryptPasswordEncoder.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECCIÓN 7: CTA FINAL
        ======================================================== */}
        <section className="py-20 bg-gradient-to-br from-[#166534] via-[#14532d] to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-200 border border-emerald-600 px-3.5 py-1.5 rounded-full">
              COMIENZA AHORA
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Lleva el control de tu comercio al siguiente nivel
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Ingresa al panel administrativo de Abastix para gestionar tus productos, consultar inventarios y registrar ventas de forma organizada.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button size="lg" className="bg-white hover:bg-emerald-50 text-[#166534] font-bold px-8 shadow-xl text-base">
                  Ingresar a Abastix
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#166534] flex items-center justify-center text-white font-bold text-sm">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <strong className="text-white block font-semibold">Abastix</strong>
              <span className="text-xs text-slate-500">Gestión Comercial para Pequeños Comercios</span>
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-slate-500 space-y-1">
            <p>© 2026 Abastix. Cibertec — Desarrollo de Aplicaciones Web II.</p>
            <p>React + Vite • Spring Boot • SQL Server • RabbitMQ</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
