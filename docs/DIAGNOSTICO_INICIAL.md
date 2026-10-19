# DIAGNÓSTICO TÉCNICO INICIAL — PROYECTO ABASTIX

**Fecha de auditoría:** 18 de octubre de 2026  
**Auditor:** Arquitecto de Software Senior  
**Repositorio:** `abastix` (Monorepo en preparación)  
**Entorno de ejecución:** Windows 11 Pro, Java JDK 23.0.1, Apache Maven 3.9.16, Node.js v22.23.2, pnpm 11.15.1, Microsoft SQL Server 2022 Developer Edition.

---

## 1. RESUMEN EJECUTIVO

El proyecto **Abastix** se concibe como una plataforma web empresarial para la gestión integral de pequeños comercios (bodegas, minimarkets y tiendas minoristas en Lima), cubriendo catálogo de productos, inventario, clientes, pedidos/ventas, alertas automáticas de bajo stock mediante mensajería asíncrona (RabbitMQ) y panel administrativo seguro.

Tras una inspección exhaustiva de todo el repositorio, código fuente, scripts de base de datos, dependencias y procesos del sistema, se concluye lo siguiente:

1. **Estado general:** El proyecto cuenta con una base inicial desarrollada para los módulos de Categorías, Clientes y Productos, así como una capa de autenticación básica mediante JWT. Sin embargo, se encuentra en un estado **incompleto**, con componentes críticos desconectados o ausentes (módulos de Pedidos, Inventario, Notificaciones y Usuarios no existen en la capa JPA ni en la API), vulnerabilidades de seguridad de severidad alta, y una ausencia total de configuración de recursos de Spring Boot (`application.properties` no existía), lo cual impedía el arranque del backend.
2. **Frontend:** Implementado con React 19 y Vite 8 en JavaScript, pero depende de estilos CSS puros (sin TailwindCSS ni shadcn/ui), almacena credenciales y tokens JWT en `localStorage`, muestra contraseñas de demostración en texto plano en la vista de login, carece de la landing page pública requerida en `/`, y no implementa React Hook Form ni validación con Zod.
3. **Backend:** Basado en Spring Boot 4.1.1 (Java 23/21). Tiene controllers delgados para Auth, Category, Customer y Product, pero carece de los controladores, servicios y entidades para Pedidos, Detalles de Pedido, Movimientos de Inventario, Notificaciones y Gestión de Usuarios. No posee configuración de cookies HttpOnly ni protección CSRF.
4. **Infraestructura:** Microsoft SQL Server 2022 Developer Edition se encuentra instalado y corriendo en la máquina local (`MSSQLSERVER`). El script `sql/AbastixDB.sql` contiene 10 tablas bien estructuradas, pero 4 de ellas no tienen correspondencia en entidades JPA. Port 8080 local se encuentra actualmente ocupado por un servicio `httpd` (Apache), requiriendo aislar el puerto del backend o configurar variables de entorno para evitar colisiones.

---

## 2. ARQUITECTURA EXISTENTE

### 2.1. Frontend
- **Tecnología:** React 19.2.8, React DOM 19.2.8, React Router DOM 7.18.4, Axios 1.20.0, Vite 8.3.0.
- **Estructura de carpetas actual:**
  ```
  frontend/src/
  ├── api/axios.js             # Instancia Axios con interceptores atados a localStorage
  ├── assets/                  # hero.png, react.svg, vite.svg
  ├── components/
  │   ├── ClienteModal.jsx     # Modal de formulario de cliente (CSS tradicional)
  │   ├── Layout.jsx           # Sidebar + Content con símbolos Unicode en vez de iconos Lucide
  │   ├── ProductoModal.jsx    # Modal de formulario de producto (CSS tradicional)
  │   └── ProtectedRoute.jsx   # Guarda de rutas dependiente de user en localStorage
  ├── context/AuthContext.jsx  # Contexto de autenticación dependiente de localStorage
  ├── pages/
  │   ├── Categorias.jsx       # Gestión de categorías
  │   ├── Clientes.jsx         # Gestión de clientes
  │   ├── Dashboard.jsx        # Vista preliminar con datos de usuario (sin métricas ni gráficos)
  │   ├── Login.jsx            # Formulario de acceso con credenciales demo en texto plano
  │   └── Productos.jsx        # Catálogo de productos
  ├── App.css / index.css      # Hoja de estilos con variables CSS nativas (~40KB de CSS)
  ├── App.jsx                  # Enrutador simple (sin landing pública, sin 404, rutas incompletas)
  └── main.jsx                 # Entrada React
  ```

### 2.2. Backend
- **Tecnología:** Spring Boot 4.1.1, Java 23 (source/target 21), Maven Wrapper 3.9.16.
- **Estructura de paquetes Java:** `com.proyecto.abastix`
  ```
  backend/src/main/java/com/proyecto/abastix/
  ├── AbastixApplication.java       # Clase principal Spring Boot
  ├── config/
  │   ├── DataSeeder.java          # Creador de roles y usuarios iniciales (BCrypt)
  │   └── RabbitMQConfig.java      # Configura exchange 'abastix.exchange' y cola 'log.queue'
  ├── controller/
  │   ├── AuthController.java      # Login, refresh, logout (stateless sin cookie), me
  │   ├── CategoryController.java  # Listar, crear, actualizar, activar/desactivar
  │   ├── CustomerController.java  # Listar, obtener, crear, actualizar, activar/desactivar
  │   └── ProductController.java   # Listar, obtener, crear, actualizar, activar/desactivar
  ├── dto/                         # DTOs básicos para Auth, Category, Customer, Product, User
  ├── entity/
  │   ├── Category.java            # JPA para categories
  │   ├── Customer.java            # JPA para customers
  │   ├── Evento.java              # POJO de evento de auditoría para RabbitMQ
  │   ├── Log.java                 # JPA para audit_logs
  │   ├── Product.java             # JPA para products
  │   ├── Role.java                # JPA para roles
  │   └── User.java                # JPA para users
  ├── exception/
  │   ├── ApiError.java            # DTO de error HTTP
  │   └── GlobalExceptionHandler.java # Manejador de excepciones (incompleto)
  ├── rabbit/
  │   ├── RabbitMQProducer.java    # Productor de mensajes
  │   └── RabbitMQConsumer.java    # Consumidor de mensajes de auditoría
  ├── repository/                  # Repositorios Spring Data JPA para las 6 entidades
  ├── security/
  │   ├── JwtAuthFilter.java       # Filtro de autenticación JWT (solo lee cabecera Bearer)
  │   ├── JwtService.java          # Emisión y validación de tokens HS256
  │   ├── PasswordConfig.java      # Bean BCryptPasswordEncoder
  │   └── SecurityConfig.java      # Filtro de seguridad, CSRF deshabilitado, CORS allowCredentials=false
  └── service/
      ├── AuditPublisher.java      # Servicio auxiliar para publicar auditoría en RabbitMQ
      ├── AuthService.java         # Lógica de login, refresh y perfil me
      ├── CategoryService.java     # Lógica de categorías
      ├── CustomerService.java     # Lógica de clientes
      └── ProductService.java      # Lógica de productos
  ```

### 2.3. Base de Datos
- **Motor:** Microsoft SQL Server 2022 Developer Edition (`localhost`).
- **Script:** `sql/AbastixDB.sql`.
- **Tablas definidas en script (10):**
  1. `roles` (id, name)
  2. `users` (id, full_name, email, password_hash, role_id, active)
  3. `categories` (id, name, active)
  4. `products` (id, category_id, name, sku, price, stock, min_stock, active)
  5. `customers` (id, full_name, document, phone, email, active)
  6. `orders` (id, customer_id, user_id, status, payment_method, total, created_at)
  7. `order_details` (id, order_id, product_id, quantity, unit_price, subtotal)
  8. `inventory_movements` (id, product_id, type, quantity, reason, order_id, user_id, created_at)
  9. `notifications` (id, user_id, type, message, [read], created_at)
  10. `audit_logs` (id, user_id, action, entity, created_at)

---

## 3. ESTADO FUNCIONAL POR MÓDULO

| Módulo | Estado | Diagnóstico Detallado |
| :--- | :--- | :--- |
| **Autenticación y Sesión** | **Parcial / Defectuoso** | Existe login y refresh que devuelven tokens JWT en JSON. Los tokens se almacenan en `localStorage` en el cliente. No se usan cookies HttpOnly ni protección CSRF. En el backend `SecurityConfig` tiene `allowCredentials(false)`. Falta endpoint `/api/auth/csrf`. |
| **Gestión de Usuarios** | **Inexistente** | Solo existe `DataSeeder` y `User` entity. No existe `UserController`, ni `UserService` para listar, crear o alternar estado de usuarios por el ADMIN. No hay vista `/usuarios` en React. |
| **Productos y Categorías** | **Parcial** | Operaciones CRUD básicas implementadas. Falta DELETE físico/lógico unificado `/api/products/{id}` y `/api/categories/{id}`. En frontend faltan filtros de búsqueda por texto, validación Zod y componentes modernos. |
| **Clientes** | **Parcial** | Operaciones de listado, creación y edición implementadas. Falta DELETE y consulta de historial de pedidos. En frontend falta validación Zod. |
| **Pedidos y Ventas** | **Inexistente** | La tabla `orders` y `order_details` está en SQL pero no existen las entidades JPA, DTOs, Repositorios, Servicios ni Controlador. En frontend no hay ruta `/pedidos` ni `/pedidos/nuevo`. |
| **Inventario y Movimientos**| **Inexistente** | La tabla `inventory_movements` existe en SQL pero no en JPA ni en la API. No hay registro de movimientos de entrada/salida ni detección de alertas de bajo stock al confirmar ventas. No hay página `/inventario`. |
| **Notificaciones y RabbitMQ**| **Inexistente para negocio** | RabbitMQ solo se usa para logs de auditoría (`log.queue`). No existen eventos `ORDER_CONFIRMED` ni `LOW_STOCK`, ni cola `notifications.queue`, ni persistencia en la tabla `notifications`. No hay vista de notificaciones en el frontend. |
| **Dashboard** | **Incompleto / Defectuoso**| Solo muestra la tarjeta de perfil del usuario logueado. No hay métricas agregadas (ventas del día, pedidos del día, productos con bajo stock), ni gráficos con ApexCharts. |
| **Landing Pública** | **Inexistente** | La ruta `/` no existe; cualquier acceso no autenticado redirige a `/login`. No se implementaron las siete secciones requeridas en la especificación. |

---

## 4. ENDPOINTS EXISTENTES Y NIVEL DE PROTECCIÓN

| Método | Endpoint | Nivel de Protección Actual | Estado y Observaciones |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público (`permitAll`) | Comprobado. Devuelve tokens en JSON (debe migrar a Cookie HttpOnly). |
| `POST` | `/api/auth/refresh` | Público (`permitAll`) | Comprobado. Recibe refresh token en JSON (debe migrar a Cookie HttpOnly). |
| `POST` | `/api/auth/logout` | Público (`permitAll`) | Comprobado. No realiza acción en backend (debe limpiar Cookie HttpOnly). |
| `GET` | `/api/auth/me` | Autenticado (`hasAnyAuthority`) | Comprobado. Devuelve perfil del usuario autenticado. |
| `GET` | `/api/products` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. Filtra activos para empleado. |
| `GET` | `/api/products/{id}` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `POST` | `/api/products` | `ROLE_ADMIN` | Comprobado. |
| `PUT` | `/api/products/{id}` | `ROLE_ADMIN` | Comprobado. |
| `PATCH`| `/api/products/{id}/deactivate` | `ROLE_ADMIN` | Comprobado. |
| `PATCH`| `/api/products/{id}/activate` | `ROLE_ADMIN` | Comprobado. |
| `DELETE`| `/api/products/{id}` | *No implementado* | **Faltante según especificación**. |
| `GET` | `/api/categories` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `POST` | `/api/categories` | `ROLE_ADMIN` | Comprobado. |
| `PUT` | `/api/categories/{id}` | `ROLE_ADMIN` | Comprobado. |
| `PATCH`| `/api/categories/{id}/deactivate`| `ROLE_ADMIN` | Comprobado. |
| `PATCH`| `/api/categories/{id}/activate` | `ROLE_ADMIN` | Comprobado. |
| `DELETE`| `/api/categories/{id}` | *No implementado* | **Faltante según especificación**. |
| `GET` | `/api/customers` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `GET` | `/api/customers/{id}` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `POST` | `/api/customers` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `PUT` | `/api/customers/{id}` | `ROLE_ADMIN`, `ROLE_EMPLEADO` | Comprobado. |
| `PATCH`| `/api/customers/{id}/deactivate`| `ROLE_ADMIN` | Comprobado. |
| `PATCH`| `/api/customers/{id}/activate` | `ROLE_ADMIN` | Comprobado. |
| `DELETE`| `/api/customers/{id}` | *No implementado* | **Faltante según especificación**. |
| `*` | `/api/orders/**` | *No implementado* | **Faltante**. |
| `*` | `/api/inventory/**` | *No implementado* | **Faltante**. |
| `*` | `/api/notifications/**`| *No implementado* | **Faltante**. |
| `*` | `/api/users/**` | *No implementado* | **Faltante**. |
| `*` | `/api/dashboard/**` | *No implementado* | **Faltante**. |
| `GET` | `/api/auth/csrf` | *No implementado* | **Faltante**. |

---

## 5. HALLAZGOS Y VULNERABILIDADES DE SEGURIDAD

1. **Almacenamiento de tokens en `localStorage` (Riesgo Crítico):**
   - En `frontend/src/api/axios.js` y `AuthContext.jsx`, los tokens de acceso y refresco se guardan y leen directamente de `localStorage`. Cualquier script malicioso o inyección XSS tiene acceso total a los tokens para secuestrar la sesión.
2. **Ausencia de Cookie HttpOnly (Riesgo Alto):**
   - El backend emite tokens en el cuerpo de la respuesta HTTP y no establece cookies con flags `HttpOnly`, `SameSite=Lax` ni `Secure`.
3. **Falta de Protección CSRF (Riesgo Alto):**
   - En `SecurityConfig.java`, línea 33: `.csrf(AbstractHttpConfigurer::disable)`. Al migrar a autenticación basada en cookies enviadas automáticamente por el navegador, la falta de CSRF dejaría al sistema vulnerable a Cross-Site Request Forgery en operaciones de mutación (POST, PUT, PATCH, DELETE).
4. **Configuración CORS incompatible con Cookies (Riesgo Medio):**
   - En `SecurityConfig.java`, línea 70: `config.setAllowCredentials(false)`. Los navegadores rechazan el envío y recepción de cookies en peticiones XMLHttpRequest/Fetch con credenciales cruzadas. Debe cambiarse a `true` con origen explícito (`http://localhost:5173`).
5. **Credenciales en texto plano expuestas en la UI (Riesgo Medio):**
   - En `Login.jsx`, el estado inicial tiene precargado `admin@abastix.com` y `123456`, y además se renderiza una tarjeta visible con las contraseñas para administradores y empleados. Debe removerse de la interfaz.
6. **Filtro JWT restrictivo a encabezados (Riesgo Operativo):**
   - `JwtAuthFilter` únicamente inspecciona `request.getHeader("Authorization")`. Debe actualizarse para extraer el token prioritariamente de la cookie HttpOnly (`access_token`) y como fallback del header Bearer.
7. **Mapeo de errores erróneo en GlobalExceptionHandler:**
   - En `GlobalExceptionHandler.java`, `IllegalArgumentException` se mapea a código HTTP 401 UNAUTHORIZED en vez de 400 BAD REQUEST.

---

## 6. INCONSISTENCIAS Y DISCREPANCIAS TÉCNICAS

1. **Ausencia de `src/main/resources/application.properties`:**
   - La carpeta `resources` no existe en `backend/src/main`. Spring Boot no dispone de URL de conexión a base de datos, credenciales, secreto JWT ni configuración de RabbitMQ, lo que ocasiona fallo inmediato en tests y ejecución (`Failed to determine a suitable driver class`).
2. **Conflicto potencial de puerto 8080:**
   - La máquina anfitriona tiene un proceso Apache (`httpd`, PID 4980) escuchando en `0.0.0.0:8080`. Se debe configurar el backend en un puerto libre (ejemplo `8088` o `8081`) o parametrizarlo mediante variable de entorno `PORT` / `SERVER_PORT`.
3. **Inconsistencia de esquema relacional vs JPA:**
   - `orders`, `order_details`, `inventory_movements`, `notifications` existen en `AbastixDB.sql` pero carecen de entidades Java JPA equivalentes.
   - La tabla `audit_logs` en SQL Server cuenta con `(id, user_id, action, entity, created_at)`. La guía del proyecto menciona `entity_id`. Se agregará una migración aditiva segura para soportar `entity_id` opcional.
4. **Roles en Base de Datos vs Especificación:**
   - En SQL y `DataSeeder`: `ROLE_ADMIN` y `ROLE_EMPLEADO`.
   - La especificación cita ADMIN y EMPLOYEE en varios apartados. Se unificará manteniendo la compatibilidad en base de datos (`ROLE_ADMIN`, `ROLE_EMPLEADO`) y normalizando las verificaciones en Spring Security y el frontend para no romper datos existentes.

---

## 7. MATRIZ DE RIESGOS TÉCNICOS Y PRIORIDADES

| Riesgo | Probabilidad | Impacto | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- |
| **Colisión de puerto 8080 con Apache** | Alta | Alto | Configurar `server.port=8088` (o configurable vía `.env`) y actualizar `VITE_API_BASE_URL` en el frontend. |
| **Falla de conexión a RabbitMQ en local** | Alta | Medio | Configurar RabbitMQ para publicación/consumo resiliente; capturar excepciones para no bloquear el guardado transaccional en SQL Server si el broker no está activo en tiempo de desarrollo. |
| **Rompimiento de CORS al migrar a Cookies** | Media | Alto | Configurar `AllowCredentials(true)`, especificar origen explícito (`http://localhost:5173`), `CookieSameSite=Lax` y manejo de preflight OPTIONS. |
| **Inconsistencias en cálculo de ventas** | Media | Alto | Todo cálculo de importes, subtotales y totales se realizará exclusivamente en el servidor (`OrderService`) a partir del precio unitario registrado en base de datos. |

---

## 8. PLAN DE IMPLEMENTACIÓN POR FASES

- [x] **Fase 1: Auditoría Técnica del Proyecto** (Diagnóstico inicial generado y documentado).
- [ ] **Fase 2: Monorepo con pnpm**:
  - `pnpm-workspace.yaml`, `package.json` raíz con scripts unificados (`pnpm dev`, `pnpm frontend`, `pnpm backend`, `pnpm build`, `pnpm lint`, `pnpm test:backend`).
  - Script multiplataforma `scripts/run-backend.mjs` con selección dinámica de `mvnw.cmd` / `./mvnw`.
  - Archivos `.env.example` y `.gitignore` unificados.
- [ ] **Fase 3: Modernización del Frontend**:
  - Instalación y configuración de TailwindCSS, shadcn/ui utils (`cn`, `clsx`, `tailwind-merge`), `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `sonner`, `apexcharts`.
  - Configuración de la paleta institucional (#166534, #14532d, #dcfce7, #0f172a, #1e293b, etc.) y tipografía Inter.
  - Componentes reutilizables UI (Button, Input, Card, Dialog, Table, Badge, Select, Skeleton, etc.).
- [ ] **Fase 4: Landing Pública de Siete Secciones**:
  - Implementación en la ruta `/` de las 7 secciones: Hero, Problema/Solución, Módulos, Cómo funciona, Beneficios, Seguridad/Tecnología y CTA final + Header y Footer.
- [ ] **Fase 5: Autenticación, Cookies Seguras y Protección CSRF**:
  - Backend: Emisión de JWT en Cookie HttpOnly con flags seguros; soporte CSRF mediante `CookieCsrfTokenRepository` y endpoint `/api/auth/csrf`; `allowCredentials(true)` en CORS; logout que limpia la cookie.
  - Frontend: Axios con `withCredentials: true`, interceptor para cabecera `X-XSRF-TOKEN`, eliminación de `localStorage` para tokens, adaptación de `AuthContext` con verificación inicial `/api/auth/me`.
  - Eliminación de credenciales visibles en el formulario de login.
- [ ] **Fase 6: Formularios y CRUDs con React Hook Form + Zod**:
  - Formularios de Login, Productos, Categorías, Clientes, Usuarios y Pedidos validados con Zod en español.
  - Tablas con búsqueda, filtros, estados de carga y modales de confirmación accesibles.
- [ ] **Fase 7: Completar Módulos Funcionales en Backend y Frontend**:
  - Entidades, DTOs, Servicios y Controllers para `Orders`, `OrderDetails`, `InventoryMovements`, `Notifications`, `Users`.
  - Reglas de negocio: descuento de inventario, cálculo en servidor, validación de stock disponible.
- [ ] **Fase 8: Dashboard Empresarial y Gráficos con ApexCharts**:
  - Métricas reales (productos activos, ventas del día, pedidos del día, bajo stock).
  - Gráficos reales de ventas por período y pedidos por estado con temas de color corporativo.
- [ ] **Fase 9: Consistencia SQL Server - JPA y Migraciones**:
  - Script de migración aditiva y verificación de esquemas con SQL Server 2022.
- [ ] **Fase 10: API REST, Validaciones y OpenAPI/Swagger**:
  - Configuración de `springdoc-openapi` para Swagger UI interactivo.
- [ ] **Fase 11: RabbitMQ y Procesamiento Asíncrono**:
  - Eventos de negocio `ORDER_CONFIRMED` y `LOW_STOCK` con consumidor que persiste en la tabla `notifications`.
- [ ] **Fase 12: Enrutamiento y Navegación Responsive**:
  - Rutas públicas (`/`, `/login`) y privadas (`/dashboard`, `/productos`, `/pedidos`, `/pedidos/nuevo`, `/inventario`, `/notificaciones`, `/usuarios`, `/perfil`), página 404, Sidebar y Header con datos del usuario.
- [ ] **Fase 13: Pruebas y Validación**:
  - Ejecución de `pnpm build`, `pnpm lint`, pruebas unitarias de backend con Maven.
- [ ] **Fase 14: Reporte Técnico Final**:
  - Documentación detallada en `docs/REPORTE_TECNICO_IMPLEMENTACION.md`.

---
*Diagnóstico verificado y documentado conforme a las reglas obligatorias del proyecto.*
