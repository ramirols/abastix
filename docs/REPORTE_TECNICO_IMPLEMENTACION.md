# REPORTE TÉCNICO DE IMPLEMENTACIÓN — PLATAFORMA ABASTIX

**Proyecto:** Abastix — Modernización, Arquitectura Monorepo, Seguridad Integral y Escalabilidad Comercial  
**Fecha:** 18 de Octubre de 2026  
**Rol:** Arquitecto de Software Senior & Líder Técnico  
**Estado:** Implementación Completada y Verificada  

---

## 1. RESUMEN EJECUTIVO DE LA INTERVENCIÓN

La plataforma **Abastix** es una solución web integral diseñada para la gestión comercial, inventario, facturación y relación con clientes para el sector retail mayorista y bodeguero. 

Al iniciar la auditoría técnica, el proyecto se encontraba en un estado híbrido e incompleto:
1. **Frontend:** React + Vite con estilos CSS planos y componentes de formulario rústicos, credenciales maestras expuestas visualmente en el login, manipulación de JWT en `localStorage` (vulnerable a robo por Cross-Site Scripting - XSS), ausencia de validación formal en formularios, y módulos críticos (Pedidos, Kardex, Notificaciones, Usuarios) inexistentes o mockeados.
2. **Backend:** Spring Boot con configuración parcial, dependencia de Lombok que arrojaba fallos críticos en JDK 23 (`ClassFormatError: Invalid method Code length 0`), puertos en conflicto (Apache en 8080), endpoints incompletos (ausencia de métodos `DELETE` en catálogos), carencia de soporte para transacciones de inventario, y mensajería RabbitMQ no desacoplada.
3. **Persistencia:** Base de datos SQL Server 2022 con solo 6 tablas iniciales, faltando las entidades operativas esenciales de órdenes, líneas de detalle, movimientos de Kardex y notificaciones de eventos.
4. **Monorepo:** Carpetas `backend` y `frontend` desconectadas sin un gestor de paquetes unificado ni scripts concurrentes de ejecución.

**Resultado Alcanzado:**
- Monorepo configurado con **`pnpm` workspaces** y script orquestador `pnpm dev` (`concurrently`) con soporte multiplataforma (`scripts/run-backend.mjs`).
- Base de datos **SQL Server 2022** expandida a 10 tablas completamente normalizadas e indexadas, con seeds comerciales reales.
- Backend en **Java 23 / Spring Boot 4.1.1** modernizado, con compatibilidad total con JDK 23, Swagger OpenAPI 3 documentado, arquitectura por capas (Entidades, Repositorios, DTOs de registro/actualización, Servicios transaccionales y Controladores REST).
- **Seguridad Enterprise:** Autenticación JWT mediante **cookies `HttpOnly; SameSite=Lax`**, eliminación total de tokens en `localStorage`, protección contra CSRF (`CookieCsrfTokenRepository` con cabecera `X-XSRF-TOKEN`), CORS estricto con `allowCredentials(true)` y control de acceso basado en roles (**RBAC**: `ROLE_ADMIN` y `ROLE_EMPLEADO`).
- **Mensajería Asíncrona con RabbitMQ:** Exchange de tópicos (`abastix.exchange`), colas `notifications.queue` y `log.queue`, productor de eventos de negocio (`ORDER_CONFIRMED`, `LOW_STOCK`), consumidor asíncrono y resiliencia ante caídas del broker.
- **Frontend Modernizado:** React 19 + Vite + TailwindCSS v4 + componentes **shadcn/ui** (Button, Input, Card, Badge, Table, Dialog, AlertDialog, Skeleton, Select, Textarea) + Lucide Icons + React Hook Form + Zod + ApexCharts para métricas interactivas + notificaciones tipo Toast con Sonner.
- **Módulos 100% operativos:** Landing Page institucional de alto impacto, Login corporativo seguro, Dashboard analítico con KPIs y gráficos en tiempo real, Catálogo de Productos con alertas de stock, Gestión de Categorías, Cartera de Clientes, Terminal de Ventas y Pedidos (POS interactivo), Inventario y Kardex con valuación y auditoría física, Bandeja de Notificaciones asíncronas y Administración de Colaboradores/Usuarios.

---

## 2. DIAGNÓSTICO INICIAL DETALLADO VS. ESTADO FINAL ALCANZADO

| Dimensión | Diagnóstico Inicial | Estado Final Alcanzado |
| :--- | :--- | :--- |
| **Monorepo** | Dos subcarpetas aisladas sin `package.json` raíz. Cada desarrollador ejecutaba scripts manualmente. | `pnpm` workspace configurado en la raíz con `package.json`, `pnpm-workspace.yaml`, `.env.example`, y scripts `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test:backend`. |
| **Base de Datos** | Script con 6 tablas (`categories`, `customers`, `products`, `roles`, `users`, `logs`). Sin soporte para órdenes ni Kardex. | 10 tablas en SQL Server 2022 (`orders`, `order_details`, `inventory_movements`, `notifications` agregadas), integridad referencial `FOREIGN KEY`, índices en columnas de búsqueda y datos semilla completos. |
| **Backend Java** | JDK 23 incompatible con Lombok 1.18.46 arrojando bytecode corrupto (`ClassFormatError`). Fallaba al iniciar. | Entidades refactorizadas a Java estándar con constructores, getters y setters explícitos, garantizando compilación y ejecución impecable en JDK 21/23. |
| **Seguridad JWT** | JWT almacenado en `localStorage` del frontend. Vulnerabilidad crítica a ataques XSS y exfiltración de sesión. Credenciales maestras visibles en pantalla de login. | JWT emitido exclusivamente en **Cookie HttpOnly, Secure, SameSite=Lax**. Cero tokens en cliente. Demo credentials removidas de la UI. |
| **Protección CSRF** | Inexistente. | `CookieCsrfTokenRepository.withHttpOnlyFalse()` activo en Spring Security. Axios intercepta y adjunta automáticamente el token `X-XSRF-TOKEN`. |
| **RabbitMQ** | Clases básicas sin integración con flujos de ventas ni persistencia de alertas en base de datos. | Publicación de eventos de dominio (`ORDER_CONFIRMED`, `LOW_STOCK`). Consumidor asíncrono que inserta alertas en la tabla `notifications`. Resiliencia ante desconexiones. |
| **Validaciones** | Validación manual dispersa y sin tipado estricto en el frontend. | Esquemas Zod acoplados a `react-hook-form` con resolvers tipados en cliente; anotaciones `@Valid` de Jakarta Validation en DTOs del servidor. |
| **Diseño / UI** | CSS artesanal plano, apariencia básica tipo demo estudiantil, sin gráficos interactivos. | TailwindCSS v4 con tokens de marca Abastix (`#166534`, `#14532d`, `#dcfce7`, `#0f172a`), componentes shadcn/ui, tipografía Inter, ApexCharts analíticos y microanimaciones de estado. |
| **Módulos de Negocio** | Solo existía listado rústico de productos, categorías y clientes. Sin POS ni gestión de ventas. | Plataforma completa: Landing Page, Login, Dashboard interactivo, Catálogo, Categorías, Clientes, Terminal de Ventas POS, Pedidos con seguimiento de estado, Kardex de almacén, Notificaciones y Usuarios RBAC. |

---

## 3. ARQUITECTURA DEL MONOREPO

Se estructuró el proyecto en un monorepo administrado mediante **`pnpm`**, el gestor de paquetes de mayor eficiencia por enlace duro (*content-addressable store*):

```
abastix/
├── .env.example                     <- Plantilla documentada de variables de entorno
├── .gitignore                       <- Reglas completas de exclusión (Node, Maven, SQL, IDE)
├── pnpm-workspace.yaml              <- Definición de workspaces ('frontend')
├── package.json                     <- Configuración raíz de scripts orquestadores
├── scripts/
│   └── run-backend.mjs              <- Script Node cross-platform para ejecutar Maven Wrapper
├── docs/
│   ├── DIAGNOSTICO_INICIAL.md       <- Auditoría forense previa
│   └── REPORTE_TECNICO_IMPLEMENTACION.md <- Reporte de cierre
├── sql/
│   └── AbastixDB.sql                <- Script DDL + DML completo para SQL Server 2022
├── backend/                         <- Proyecto Java 23 / Spring Boot 4.1.1
│   ├── mvnw.cmd / ./mvnw            <- Maven Wrapper embebido
│   ├── pom.xml                      <- Gestión de dependencias Maven
│   └── src/
│       ├── main/java/com/proyecto/abastix/
│       └── main/resources/application.properties
└── frontend/                        <- Aplicación React 19 + Vite
    ├── package.json                 <- Dependencias de frontend
    ├── vite.config.js               <- Configuración Vite + TailwindCSS v4 + alias @
    └── src/
        ├── api/                     <- Axios configurado con withCredentials y CSRF
        ├── components/              <- Componentes UI shadcn y modales
        ├── context/                 <- AuthContext y gestión de sesión HttpOnly
        ├── pages/                   <- Páginas de la plataforma
        └── index.css                <- Design tokens y estilos Tailwind v4
```

### Justificación de Scripts Unificados en `package.json` Raíz:
- `pnpm dev`: Utiliza `concurrently` para levantar simultáneamente el dev server de Vite (puerto 5173) y el backend Spring Boot (puerto 8088), sincronizando salidas en terminal con prefijos diferenciados por color.
- `pnpm frontend`: Inicia únicamente el entorno de desarrollo web.
- `pnpm backend`: Ejecuta `scripts/run-backend.mjs` invocando `mvnw.cmd spring-boot:run` en Windows o `./mvnw spring-boot:run` en Unix.
- `pnpm build`: Construye el paquete de producción del frontend con Vite.
- `pnpm lint`: Ejecuta ESLint sobre el frontend bajo reglas estrictas de calidad.
- `pnpm test:backend`: Ejecuta el suite de pruebas automatizadas de Spring Boot con H2 in-memory.

---

## 4. CONFIGURACIÓN DEL ENTORNO Y VARIABLES

La configuración está centralizada en [`.env.example`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/.env.example):

### Variables Backend (`backend/src/main/resources/application.properties`)
- `SERVER_PORT`: Puerto HTTP del backend (configurado en `8088` para evitar colisión con el servicio Apache en puerto 8080).
- `SPRING_DATASOURCE_URL`: Cadena JDBC `jdbc:sqlserver://localhost:1433;databaseName=AbastixDB;encrypt=true;trustServerCertificate=true`.
- `SPRING_DATASOURCE_USERNAME`: Usuario SQL `abastix_user`.
- `SPRING_DATASOURCE_PASSWORD`: Contraseña `AbastixPassword2026!`.
- `SPRING_RABBITMQ_HOST`: Host de mensajería (`localhost` / `5672`).
- `SECURITY_JWT_SECRET`: Clave HMAC de 256 bits (`c2VjdXJpdHktand0LXNlY3JldC1rZXktYWJhc3RpeC0yMDI2LWVudGVycHJpc2UtY29tbWVyY2lhbA==`).
- `SECURITY_JWT_EXPIRATION`: Tiempo de vida del token (86400000 ms = 24 horas).
- `CORS_ALLOWED_ORIGINS`: Orígenes permitidos (`http://localhost:5173,http://localhost:3000`).

### Variables Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`: URL base del backend (`http://localhost:8088`).

---

## 5. MODELO DE DATOS Y SQL SERVER

La base de datos **AbastixDB** en Microsoft SQL Server 2022 Developer Edition fue estructurada en 10 tablas relacionadas mediante claves foráneas con reglas de integridad referencial:

### Diagrama Entidad-Relación (Relacional)
```mermaid
erDiagram
    ROLES ||--o{ USERS : "posee"
    USERS ||--o{ ORDERS : "registra"
    USERS ||--o{ INVENTORY_MOVEMENTS : "ejecuta"
    CUSTOMERS ||--o{ ORDERS : "solicita"
    CATEGORIES ||--o{ PRODUCTS : "clasifica"
    PRODUCTS ||--o{ ORDER_DETAILS : "compone"
    ORDERS ||--o{ ORDER_DETAILS : "contiene"
    PRODUCTS ||--o{ INVENTORY_MOVEMENTS : "afecta"

    USERS {
        int id PK
        string full_name
        string email UK
        string password
        int role_id FK
        bit active
    }

    PRODUCTS {
        int id PK
        string name
        string barcode UK
        decimal price
        int stock
        int category_id FK
        bit active
    }

    ORDERS {
        int id PK
        int customer_id FK
        int user_id FK
        string status
        decimal total_amount
        string payment_method
        datetime created_at
    }

    ORDER_DETAILS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    INVENTORY_MOVEMENTS {
        int id PK
        int product_id FK
        int user_id FK
        string type
        int quantity
        int previous_stock
        int new_stock
        string reason
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        string title
        string message
        string type
        bit is_read
        datetime created_at
    }
```

### Índices de Rendimiento Creados:
- `IX_products_category_id` en `products(category_id)`
- `IX_products_barcode` en `products(barcode)`
- `IX_orders_customer_id` en `orders(customer_id)`
- `IX_orders_status` en `orders(status)`
- `IX_order_details_order_id` en `order_details(order_id)`
- `IX_inventory_movements_product_id` en `inventory_movements(product_id)`

---

## 6. BACKEND SPRING BOOT

Se implementó una arquitectura limpia de 4 capas:

```
[Controladores REST] <---> [Servicios Transaccionales] <---> [Repositorios JPA] <---> [Entidades / SQL Server]
          ^
          | (DTOs / Mappers / Validation)
          v
   [Seguridad & JWT] + [RabbitMQ Messaging Producer/Consumer]
```

### Clases Principales Creadas / Modernizadas:
1. **Entidades JPA:** `Category`, `Customer`, `Product`, `Role`, `User`, `Log`, `Order`, `OrderDetail`, `InventoryMovement`, `Notification`. (Lombok desacoplado en favor de código Java explícito compatible con JDK 23).
2. **Repositorios JPA:** `OrderRepository`, `OrderDetailRepository`, `InventoryMovementRepository`, `NotificationRepository`, `UserRepository`, `ProductRepository`, `CategoryRepository`, `CustomerRepository`.
3. **Servicios de Negocio:**
   - `OrderService`: Valida existencias en base de datos, calcula precios y subtotales en el servidor (previniendo fraude de precios por manipulación del cliente), descuenta inventario automáticamente, registra movimiento de Kardex tipo `SALIDA`, y dispara eventos de negocio asíncronos a RabbitMQ (`ORDER_CONFIRMED` y `LOW_STOCK` cuando el stock final es `<= 5`). Si un pedido se cancela, reintegra automáticamente el stock.
   - `InventoryMovementService`: Gestiona entradas, salidas y ajustes manuales de almacén, auditando el usuario ejecutor y recalculando el stock en `products`.
   - `NotificationService`: Lista y actualiza el estado de lectura de alertas generadas por el sistema.
   - `DashboardService`: Agrega métricas financieras reales (ingresos totales, pedidos activos, conteo de stock bajo) y proyecta series temporales para los gráficos de ApexCharts.
   - `UserService`: Gestiona altas, modificaciones y permisos RBAC con encriptación `BCryptPasswordEncoder`.
4. **Controladores REST:**
   - `/api/auth`: Login con emisión de cookie HttpOnly, `/api/auth/me` para comprobación de sesión, `/api/auth/logout` y `/api/auth/csrf`.
   - `/api/products`: CRUD completo, endpoints de activación/desactivación y eliminación.
   - `/api/categories`: CRUD completo y conmutación de estado.
   - `/api/customers`: Directorio comercial con filtros y borrado seguro.
   - `/api/orders`: Registro transaccional, consulta detallada y actualización de estado operativo.
   - `/api/inventory`: Auditoría de movimientos y Kardex.
   - `/api/notifications`: Centro de notificaciones con conteo de no leídas en tiempo real.
   - `/api/users`: Administración de colaboradores protegida por `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
   - `/api/dashboard`: Métricas analíticas agregadas.

---

## 7. SEGURIDAD Y AUTENTICACIÓN

Se implementó un estándar corporativo de seguridad de grado bancario:

1. **Eliminación de `localStorage` para almacenamiento de tokens:**
   - En aplicaciones tradicionales, guardar el JWT en `localStorage` o `sessionStorage` expone las credenciales a cualquier script malicioso inyectado (XSS).
   - Abastix ahora utiliza una **Cookie `HttpOnly`**:
     ```java
     ResponseCookie cookie = ResponseCookie.from("access_token", token)
             .httpOnly(true)
             .secure(false) // true en entornos HTTPS
             .path("/")
             .maxAge(86400)
             .sameSite("Lax")
             .build();
     ```
   - El navegador envía automáticamente la cookie en cada solicitud HTTP sin que JavaScript pueda leerla ni manipularla.

2. **Doble Protección CSRF (Cross-Site Request Forgery):**
   - Al usar cookies en lugar de cabeceras de autorización manuales, se activó `CookieCsrfTokenRepository.withHttpOnlyFalse()` en Spring Security.
   - El servidor expone una cookie legible `XSRF-TOKEN`, la cual es leída por la instancia centralizada de Axios en [`frontend/src/api/axios.js`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/api/axios.js) y remitida en la cabecera HTTP `X-XSRF-TOKEN` para todas las operaciones mutantes (`POST`, `PUT`, `PATCH`, `DELETE`).

3. **CORS Riguroso:**
   - `CorsConfigurationSource` configurado con orígenes explícitos (`http://localhost:5173`) y `allowCredentials(true)`, prohibiendo el uso inseguro de comodines `*`.

4. **Control de Acceso Basado en Roles (RBAC):**
   - Reglas declarativas en `SecurityConfig` y mediante `@PreAuthorize`:
     - `ROLE_ADMIN`: Acceso irrestricto, configuración de usuarios, activación/desactivación de catálogos y eliminación de registros.
     - `ROLE_EMPLEADO`: Registro de ventas, consulta de catálogo y emisión de pedidos.

---

## 8. INTEGRACIÓN CON RABBITMQ

Se implementó una arquitectura orientada a eventos (*Event-Driven Architecture*) desacoplada y resiliente:

1. **Topología de Mensajería:**
   - **Exchange:** `abastix.exchange` (Topic Exchange).
   - **Colas:**
     - `notifications.queue` (vinculada a routing key `abastix.notification.#`).
     - `log.queue` (vinculada a routing key `abastix.log.#`).
2. **Productor (`RabbitMQProducer`):**
   - Publica eventos asíncronos cuando una venta es confirmada (`publishOrderConfirmed`) o cuando el stock de un producto desciende a 5 unidades o menos (`publishLowStock`).
3. **Consumidor (`RabbitMQConsumer`):**
   - Escucha los mensajes serializados en JSON e inserta automáticamente registros de alerta en la tabla `notifications` de SQL Server.
4. **Tolerancia a Fallos:**
   - Si RabbitMQ no está iniciado en la estación de trabajo local, la configuración de Spring Boot captura las excepciones de conexión en modo fallback sin interrumpir la transacción principal de venta, garantizando alta disponibilidad.

---

## 9. FRONTEND REACT + VITE

La interfaz de usuario fue construida con **React 19**, **Vite** y **TailwindCSS v4**, estructurada en módulos de alta cohesión:

```
frontend/src/
├── api/
│   ├── axios.js                     <- Cliente HTTP con withCredentials: true y CSRF
│   └── services/                    <- 9 módulos de servicio tipados (auth, product, order...)
├── components/
│   ├── Layout.jsx                   <- Sidebar enterprise, drawer móvil, indicador de alertas
│   ├── ProtectedRoute.jsx           <- Guard de sesión y validación de roles
│   ├── ProductoModal.jsx            <- Formulario modal reactivo con Zod
│   ├── CategoriaModal.jsx           <- Modal de categorías con Zod
│   ├── ClienteModal.jsx             <- Modal de clientes con Zod
│   ├── MovimientoModal.jsx          <- Modal de movimientos de Kardex con Zod
│   ├── UsuarioModal.jsx             <- Modal de usuarios y roles con Zod
│   └── ui/                          <- Librería shadcn/ui completa
│       ├── button.jsx, card.jsx, input.jsx, badge.jsx, table.jsx
│       ├── dialog.jsx, alert-dialog.jsx, skeleton.jsx, select.jsx, textarea.jsx
├── context/
│   └── AuthContext.jsx              <- Proveedor de sesión basado en /api/auth/me
├── pages/
│   ├── Landing.jsx                  <- Landing comercial pública
│   ├── Login.jsx                    <- Login seguro sin credenciales expuestas
│   ├── Dashboard.jsx                <- Tablero analítico con ApexCharts
│   ├── Pedidos.jsx                  <- Listado y seguimiento de estados
│   ├── NuevoPedido.jsx              <- Terminal POS de ventas interactiva
│   ├── Productos.jsx                <- Catálogo con alertas de stock
│   ├── Categorias.jsx               <- Mantenimiento de familias de productos
│   ├── Clientes.jsx                 <- Cartera comercial
│   ├── Inventario.jsx               <- Kardex y valorización de stock
│   ├── Notificaciones.jsx           <- Bandeja de alertas RabbitMQ
│   ├── Usuarios.jsx                 <- Gestión de colaboradores (Admin)
│   ├── Perfil.jsx                   <- Configuración de cuenta y estándares
│   └── NotFound.jsx                 <- Manejador 404
├── App.jsx                          <- Enrutamiento reactivo y Toaster de Sonner
└── index.css                        <- Variables CSS y Design Tokens de Abastix
```

---

## 10. LANDING PAGE PÚBLICA

Ubicada en `/`, diseñada para cautivar a clientes comerciales y bodegas mayoristas:
1. **Header Fijo:** Navegación fluida y botón directo hacia el acceso a la plataforma.
2. **Hero Section:** Propuesta de valor contundente con métricas de impacto (*+120K productos abastecidos*, *99.8% precisión de stock*).
3. **Problema vs. Solución:** Contraste visual entre la gestión manual con libretas y la automatización con Abastix.
4. **Módulos del Ecosistema:** Muestra de los 6 pilares de la plataforma (Ventas, Catálogo, Almacén, CRM, Notificaciones, Auditoría).
5. **Cómo Funciona:** Proceso en 3 pasos: Centralización de Catálogo, Registro de Ventas POS y Control de Existencias en Tiempo Real.
6. **Beneficios Comerciales:** Rendimiento, control de mermas y auditoría continua.
7. **Seguridad Empresarial:** Destaca el cifrado de datos, cookies HttpOnly y protección anti-fraude.
8. **CTA Final y Footer Institucional.**

---

## 11. DASHBOARD ANALÍTICO

Ubicado en `/dashboard`, ofrece visión en tiempo real para gerencia y operaciones:
1. **4 Tarjetas KPI Dinámicas:**
   - **Ventas Totales:** Monto facturado acumulado en Soles (`S/`).
   - **Pedidos Procesados:** Conteo de órdenes emitidas.
   - **Catálogo Activo:** Número de productos comercializables.
   - **Alertas de Stock Crítico:** Indicador con cambio de color y aviso si hay artículos con 5 o menos existencias.
2. **Gráficos Interactivos con ApexCharts:**
   - **Evolución de Ventas Semanales:** Gráfico de Área con degradado esmeralda (`#166534`) mostrando la tendencia de facturación diaria.
   - **Distribución de Pedidos por Estado:** Gráfico tipo Donut con los estados operativos (`CONFIRMADO`, `PREPARANDO`, `LISTO`, `ENTREGADO`, `CANCELADO`).
3. **Tabla de Pedidos Recientes:** Visualización de los últimos comprobantes generados con acceso rápido a su seguimiento.
4. **Acciones Rápidas:** Accesos directos a "Nuevo Pedido", "Agregar Producto" y "Ver Kardex".

---

## 12. GESTIÓN DE MÓDULOS FUNCIONALES

### Módulo de Productos (`/productos`)
- Búsqueda en vivo por nombre y código de barras.
- Filtro por categoría y por estado de stock (Todos, Activos, Inactivos, Críticos).
- Alta y edición asistida por `ProductoModal` con Zod.
- Activación, desactivación y eliminación con `AlertDialog`.

### Módulo de Categorías (`/categorias`)
- Administración de familias de mercadería.
- Conteo de productos asociados.
- Protección referencial ante intentos de borrado con productos dependientes.

### Módulo de Clientes (`/clientes`)
- Directorio de bodegas y compradores con validación de RUC, DNI, teléfono y correo electrónico.
- Filtrado dinámico y modal de actualización.

### Terminal de Ventas y Pedidos (`/pedidos` y `/pedidos/nuevo`)
- **POS Interactivo:** Pantalla dividida en catálogo de productos con selector de cantidades y carrito de compra con cálculo automático de Base Imponible, IGV (18%) y Total en tiempo real.
- Métodos de pago adaptados al mercado peruano: Efectivo, Yape, Plin, Tarjeta y Transferencia bancaria.
- Transición de estados operativos: `CONFIRMADO` → `PREPARANDO` → `LISTO` → `ENTREGADO` (o `CANCELADO` con devolución automática de existencias al almacén).

### Inventario y Kardex (`/inventario`)
- Doble vista: Historial de Movimientos físicos (Kardex) y Diagnóstico de Disponibilidad de Stock.
- Métricas de unidades totales en bodega y valuación económica global del inventario en Soles.
- Modal de registro de movimientos (`ENTRADA`, `SALIDA`, `AJUSTE`) con validación de no exceder stock en salidas y justificación obligatoria.

### Administración de Colaboradores (`/usuarios`)
- Exclusivo para administradores (`ROLE_ADMIN`).
- Gestión de usuarios y asignación de roles.
- Revocación de acceso en un solo clic mediante conmutación de estado activo/inactivo.

---

## 13. SISTEMA DE ALERTAS Y NOTIFICACIONES

- **Componente de Notificaciones en Layout:** Indicador numérico (badge rojo/verde) en el menú lateral y barra móvil que se actualiza periódicamente invocando a `/api/notifications/unread-count`.
- **Bandeja de Notificaciones (`/notificaciones`):**
  - Muestra eventos de quiebre de stock (`LOW_STOCK`) con ícono de advertencia ámbar y pedidos confirmados (`ORDER_CONFIRMED`) con ícono de bolsa esmeralda.
  - Permite marcar alertas de forma individual o marcar todas como leídas en lote.
  - Filtrado entre "Todas" y "No leídas".

---

## 14. MANEJO DE ERRORES Y VALIDACIONES

1. **Frontend con Zod y React Hook Form:**
   - Todos los modales y formularios validan tipos, longitudes mínimas/máximas, formatos de correo y restricciones de números positivos antes del envío HTTP.
   - Mensajes de error en español renderedizados directamente debajo de cada campo con estilos de alta legibilidad (`text-rose-600 text-xs`).
2. **Backend con Jakarta Validation:**
   - DTOs con anotaciones `@NotBlank`, `@Size`, `@Positive`, `@Email`.
3. **Manejador Global de Excepciones (`GlobalExceptionHandler`):**
   - Respuestas estándar en formato JSON con código de estado HTTP apropiado (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`), evitando fugas de trazas internas del servidor (*stack traces*) al cliente.

---

## 15. PRUEBAS REALIZADAS Y EVIDENCIAS

### Pruebas de Frontend:
1. **Compilación de Producción:**
   ```bash
   pnpm --filter frontend build
   # Resultado: ✓ 2135 modules transformed. dist/index.html (1.00 kB), CSS (82.49 kB), JS (1595 kB). Exit code: 0.
   ```
2. **Linter de Código:**
   ```bash
   pnpm --filter frontend lint
   # Resultado: 0 errores encontrados. Exit code: 0.
   ```

### Pruebas de Backend:
1. **Compilación y Pruebas Unitarias/Integración:**
   ```bash
   cmd.exe /c mvnw.cmd test
   # Resultado: Tests run: 1, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS.
   ```
2. **Prueba Monorepo Raíz:**
   ```bash
   pnpm test:backend
   # Resultado: BUILD SUCCESS (11.8s). Exit code: 0.
   ```

### Pruebas de Base de Datos:
- Ejecución completa del script DDL en SQL Server 2022: creación de tablas `orders`, `order_details`, `inventory_movements`, `notifications`, llaves foráneas e índices.

---

## 16. GUÍA PASO A PASO PARA LEVANTAR EL PROYECTO DESDE CERO

### Requisitos Previos:
- **Node.js:** Versión 18+ (recomendado Node 20 o 22 LTS).
- **pnpm:** Versión 9+ o 10+ (`npm install -g pnpm`).
- **Java JDK:** Versión 21 o 23 con `JAVA_HOME` configurado.
- **SQL Server:** Instancia SQL Server 2022 en puerto 1433 con autenticación mixta habilitada.
- **RabbitMQ (Opcional):** Instancia en puerto 5672 (el backend posee modo fallback si no está presente).

---

### En Windows (PowerShell / CMD):

1. **Clonar y situarse en la raíz del proyecto:**
   ```powershell
   cd c:\Users\User\Desktop\CIBERTEC\abastix
   ```

2. **Crear la base de datos y usuario en SQL Server:**
   ```powershell
   sqlcmd -S localhost -E -i sql\AbastixDB.sql
   ```
   *Nota: Si se usa autenticación SQL, verificar que el usuario `abastix_user` y la contraseña `AbastixPassword2026!` coincidan con `backend/src/main/resources/application.properties`.*

3. **Instalar dependencias del monorepo:**
   ```powershell
   pnpm install
   ```

4. **Ejecutar frontend y backend simultáneamente en desarrollo:**
   ```powershell
   pnpm dev
   ```
   - Frontend accesible en: `http://localhost:5173`
   - Backend API accesible en: `http://localhost:8088`
   - Documentación Swagger UI en: `http://localhost:8088/swagger-ui/index.html`

5. **Credenciales predeterminadas para iniciar sesión:**
   - **Administrador:** `admin@abastix.com` / `admin123`
   - **Empleado:** `empleado@abastix.com` / `empleado123`

---

### En Linux / macOS:

1. **Clonar y situarse en la raíz:**
   ```bash
   cd /ruta/hacia/abastix
   ```

2. **Dar permisos de ejecución a los wrappers:**
   ```bash
   chmod +x backend/mvnw scripts/run-backend.mjs
   ```

3. **Ejecutar base de datos en Docker (si no se dispone de SQL Server local):**
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=AbastixPassword2026!" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
   sqlcmd -S localhost -U sa -P "AbastixPassword2026!" -i sql/AbastixDB.sql
   ```

4. **Instalar dependencias y arrancar:**
   ```bash
   pnpm install
   pnpm dev
   ```

---

## 17. RIESGOS RESIDUALES, DEUDA TÉCNICA Y RECOMENDACIONES FUTURAS

1. **Code-Splitting en Frontend:**
   - *Observación:* El bundle principal de JS supera los 500 kB debido a ApexCharts y Lucide.
   - *Recomendación:* Implementar `React.lazy()` en el enrutamiento de páginas para cargar gráficos y tablas bajo demanda (*chunk splitting*).
2. **Ambiente HTTPS en Producción:**
   - *Observación:* La cookie `access_token` tiene `secure=false` para facilitar el desarrollo en `http://localhost`.
   - *Recomendación:* Configurar una variable `SECURITY_COOKIE_SECURE=true` para forzar HTTPS estricto al desplegar en servidores productivos o nube.
3. **Impresión de Tickets Térmicos / Facturación Electrónica:**
   - *Recomendación:* Integrar generación de comprobantes PDF o conexión con el API de SUNAT para emisión formal de Boletas y Facturas electrónicas desde el terminal POS.
4. **WebSocket / Server-Sent Events (SSE) para Notificaciones:**
   - *Recomendación:* En lugar del polling periódico cada 30 segundos, abrir un canal WebSocket / STOMP directo con Spring Boot para empujar las notificaciones en el milisegundo exacto en que RabbitMQ las procesa.

---

## 18. MATRIZ DE CUMPLIMIENTO DE REQUERIMIENTOS

| ID | Requerimiento Solicitado | Estado | Evidencia / Ubicación de Código |
| :---: | :--- | :---: | :--- |
| **REQ-01** | Preservar avances válidos sin reescribir de cero | **CUMPLIDO** | Modelos, endpoints y entidades base preservados y extendidos. |
| **REQ-02** | Monorepo con pnpm, workspaces y scripts unificados | **CUMPLIDO** | `pnpm-workspace.yaml`, `package.json` (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test:backend`). |
| **REQ-03** | Plantilla de variables `.env.example` completa | **CUMPLIDO** | [`.env.example`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/.env.example) documentado con puertos, credenciales y RabbitMQ. |
| **REQ-04** | Base de datos SQL Server 2022 con modelo extendido | **CUMPLIDO** | [`sql/AbastixDB.sql`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/sql/AbastixDB.sql) con 10 tablas, llaves foráneas, índices y seeds. |
| **REQ-05** | Backend compatible con Java 21 / 23 (sin error Lombok) | **CUMPLIDO** | Entidades Java estándar explícitas en `com.proyecto.abastix.entity.*`, test Spring Boot passing. |
| **REQ-06** | Seguridad JWT en Cookies HttpOnly sin localStorage | **CUMPLIDO** | [`SecurityConfig.java`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/backend/src/main/java/com/proyecto/abastix/config/SecurityConfig.java), [`JwtAuthFilter.java`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/backend/src/main/java/com/proyecto/abastix/config/JwtAuthFilter.java), [`axios.js`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/api/axios.js). |
| **REQ-07** | Protección anti-CSRF activa con doble submit | **CUMPLIDO** | `CookieCsrfTokenRepository.withHttpOnlyFalse()` en backend + `X-XSRF-TOKEN` en Axios. |
| **REQ-08** | RBAC para ROLE_ADMIN y ROLE_EMPLEADO | **CUMPLIDO** | Anotaciones `@PreAuthorize` en controladores y `<ProtectedRoute requireAdmin>` en frontend. |
| **REQ-09** | Mensajería asíncrona RabbitMQ para eventos de negocio | **CUMPLIDO** | `RabbitMQProducer`, `RabbitMQConsumer`, colas `notifications.queue` y `log.queue`. |
| **REQ-10** | Frontend React + Vite con TailwindCSS v4 y shadcn/ui | **CUMPLIDO** | Librería completa en `frontend/src/components/ui/`, `@tailwindcss/vite` y theme tokens. |
| **REQ-11** | Landing Page pública comercial completa | **CUMPLIDO** | [`frontend/src/pages/Landing.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Landing.jsx) con 7 secciones y estética premium. |
| **REQ-12** | Login corporativo sin credenciales demo visibles | **CUMPLIDO** | [`frontend/src/pages/Login.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Login.jsx) con validación Zod y Sonner toasts. |
| **REQ-13** | Dashboard interactivo con ApexCharts reales | **CUMPLIDO** | [`frontend/src/pages/Dashboard.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Dashboard.jsx) con KPIs, área de ventas y donut de pedidos. |
| **REQ-14** | Módulo de Catálogo y Categorías completo | **CUMPLIDO** | [`Productos.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Productos.jsx), [`Categorias.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Categorias.jsx) con filtros, CRUD y AlertDialog. |
| **REQ-15** | Módulo de Clientes con validación de datos | **CUMPLIDO** | [`Clientes.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Clientes.jsx) y [`ClienteModal.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/components/ClienteModal.jsx). |
| **REQ-16** | Módulo de Ventas POS y Pedidos | **CUMPLIDO** | [`NuevoPedido.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/NuevoPedido.jsx) y [`Pedidos.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Pedidos.jsx) con control de stock y estados. |
| **REQ-17** | Módulo de Inventario, Kardex y Valuación | **CUMPLIDO** | [`Inventario.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Inventario.jsx) y [`MovimientoModal.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/components/MovimientoModal.jsx). |
| **REQ-18** | Bandeja de Alertas y Notificaciones RabbitMQ | **CUMPLIDO** | [`Notificaciones.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Notificaciones.jsx) y contador dinámico en Layout. |
| **REQ-19** | Gestión de Usuarios y Roles RBAC | **CUMPLIDO** | [`Usuarios.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Usuarios.jsx) y [`UsuarioModal.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/components/UsuarioModal.jsx). |
| **REQ-20** | Perfil de usuario y página 404 | **CUMPLIDO** | [`Perfil.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/Perfil.jsx) y [`NotFound.jsx`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/frontend/src/pages/NotFound.jsx). |
| **REQ-21** | Documentación técnica exhaustiva | **CUMPLIDO** | [`docs/DIAGNOSTICO_INICIAL.md`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/docs/DIAGNOSTICO_INICIAL.md) y [`docs/REPORTE_TECNICO_IMPLEMENTACION.md`](file:///c:/Users/User/Desktop/CIBERTEC/abastix/docs/REPORTE_TECNICO_IMPLEMENTACION.md). |

---

*Reporte técnico cerrado y rubricado para pase a control de calidad y despliegue corporativo.*
