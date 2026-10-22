# Guía de despliegue Abastix: Azure SQL + Render + Vercel

Abastix se despliega en tres servicios gratuitos: la base de datos en **Azure SQL**, el backend en **Render** y el frontend en **Vercel**. El único cambio de código es [`frontend/vercel.json`](frontend/vercel.json).

```
Navegador ──> Vercel (React + proxy /api) ──> Render (Spring Boot, Docker) ──> Azure SQL (AbastixDB)
```

El navegador solo habla con Vercel; Vercel reenvía `/api` a Render, y así las cookies quedan en un solo dominio.

---

## Resumen

| Parte | Tecnología | Dónde va | Plan |
| --- | --- | --- | --- |
| Base de datos | SQL Server | Azure SQL Database (`abastix-main`, base `AbastixDB`) | Oferta gratuita de Azure for Students |
| Backend | Java 21 + Spring Boot (Docker) | Render, Web Service, región Ohio | Free (0.1 CPU, 512 MB) |
| Frontend | React + Vite | Vercel, carpeta `frontend` | Hobby (gratis) |

Tres decisiones que explican el resto de la guía:

- **Azure SQL.** Abastix usa SQL Server (driver `mssql-jdbc`, dialecto SQLServer, script en T-SQL), y Azure SQL es SQL Server administrado, así que no requiere cambios.
- **Render con Docker y no Node.** Render detecta Node por el `package.json` de la raíz, pero el backend se construye con [`backend/Dockerfile`](backend/Dockerfile).
- **Sin RabbitMQ.** Los envíos a RabbitMQ están dentro de `try/catch` y las notificaciones se guardan directo en la base, así que la app funciona sin broker.

---

## Paso 1: crear la base de datos en Azure SQL

Crea la base desde **Bases de datos SQL → Crear** con la oferta gratuita aplicada y autenticación SQL.

1. **Suscripción:** Azure for Students. **Grupo de recursos:** uno nuevo o existente (por ejemplo `appweb`).
2. **Nombre de la base de datos:** `AbastixDB`. No dejes el nombre que propone Azure (`free-sql-db-...`).
3. Revisa que aparezca **Oferta gratuita aplicada** y que la facturación por encima del límite esté **Deshabilitada**. Así no hay cobros: si se acaba el límite del mes, la base se pausa.
4. **Servidor → Crear nuevo:**
    - Nombre: `abastix-main` (queda como `abastix-main.database.windows.net`).
    - Ubicación: una región permitida por tu suscripción, lo más cerca posible de Ohio (ver nota abajo).
    - Método de autenticación: **Uso de la autenticación de SQL**. El backend se conecta con usuario y contraseña; la opción "solo Microsoft Entra" no funcionaría sin cambiar el código.
    - Inicio de sesión del administrador: por ejemplo `Abastix-server` (no puede ser `admin` ni `sa`). Guarda la contraseña en un lugar seguro.
5. **Revisar y crear → Crear.** Espera de 2 a 5 minutos hasta que diga "Se completó la implementación".

**Error `RequestDisallowedByAzure`:** Azure for Students solo permite algunas regiones; Chile Central fue rechazada. Crea el servidor de nuevo en otra región: prueba East US 2, Central US, West US 2/3 o Brazil South. La lista exacta está en **Directiva → Asignaciones → Allowed resource deployment regions → Parámetros**.

**Cadena de conexión:** en la base **AbastixDB → Cadenas de conexión → JDBC**. Para Render se usa sin `user=` ni `password=` (van en variables aparte):

```
jdbc:sqlserver://abastix-main.database.windows.net:1433;database=AbastixDB;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
```

---

## Paso 2: abrir el firewall y cargar el script SQL

El servidor bloquea todas las conexiones hasta que agregues reglas de firewall; sin ellas, ni VS Code ni Render pueden entrar.

**Firewall** (en el recurso del **servidor** `abastix-main`, no en la base):

1. Ve a **Seguridad → Redes**.
2. En **Acceso a la red pública**, elige **Redes seleccionadas**.
3. Clic en **+ Agregar la dirección IPv4 del cliente** (tu PC, para VS Code).
4. Clic en **+ Agregar una regla de firewall**: nombre `Render`, inicio `0.0.0.0`, fin `255.255.255.255`.
5. **Guardar.**

La regla `Render` abre el servidor a cualquier IP; la contraseña sigue protegiendo la base. Para algo más cerrado, usa solo las IP de salida de Render (botón **Connect → Outbound** de tu servicio).

**Script de datos de ejemplo** (opcional, pero hazlo antes del primer deploy):

1. En VS Code instala la extensión **SQL Server (mssql)**.
2. Nueva conexión: servidor `abastix-main.database.windows.net`, autenticación **SQL Login**, usuario `Abastix-server` con tu contraseña, base `AbastixDB`.
3. Abre [`sql/AbastixDB.sql`](sql/AbastixDB.sql), **selecciona desde la línea 15 hasta el final** y ejecuta solo la selección.
4. Debe terminar sin errores.

No ejecutes las líneas 6 a 13 (`CREATE DATABASE` y `USE`): Azure SQL no las admite y la base ya existe. Si te saltas el script, el backend igual crea las tablas (`ddl-auto=update`) y los usuarios; solo faltarían las categorías, productos y clientes de ejemplo.

---

## Paso 3: desplegar el backend en Render

Crea un **New Web Service** desde el repo `ramirols/abastix` y cámbialo a **Docker**: si ves campos de Build Command y Start Command, todavía está en Node.

| Campo en Render | Valor |
| --- | --- |
| Source Code | `ramirols / abastix` |
| Name | `abastix` (o `abastix-api`) |
| Language | **Docker** |
| Branch | `main` |
| Region | Ohio (US East) |
| Root Directory | vacío |
| Instance Type | Free |
| Advanced → Health Check Path | `/api/auth/csrf` (borra `/healthz`) |
| Advanced → Dockerfile Path | `./backend/Dockerfile` |
| Advanced → Docker Build Context Directory | `.` |
| Advanced → Auto-Deploy | Yes |

**Environment Variables:** en el mismo formulario, con **Add from .env** puedes pegar todo junto. Reemplaza los dos valores en mayúsculas:

```
PORT=8088
SPRING_DATASOURCE_URL=jdbc:sqlserver://abastix-main.database.windows.net:1433;database=AbastixDB;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
SPRING_DATASOURCE_USERNAME=Abastix-server
SPRING_DATASOURCE_PASSWORD=TU_CONTRASEÑA_DE_AZURE
JWT_SECRET=CADENA_LARGA_ALEATORIA
JWT_COOKIE_SECURE=true
JWT_COOKIE_SAME_SITE=Lax
```

- `JWT_SECRET`: genera uno en Git Bash con `openssl rand -base64 48`, o escribe un texto aleatorio de más de 40 caracteres.
- Estas variables van solo en Render, nunca en archivos del proyecto.
- Si el plan Free se queda sin memoria o tarda mucho en arrancar, agrega `JAVA_OPTS=-XX:+UseSerialGC -XX:MaxRAMPercentage=65 -XX:TieredStopAtLevel=1`.

Dale a **Deploy web service**. El primer build tarda de 5 a 10 minutos porque Maven descarga las dependencias. Al terminar, Render te da una URL como `https://abastix.onrender.com`.

---

## Paso 4: desplegar el frontend en Vercel

Vercel debe reenviar `/api` a Render para que frontend y backend queden en el mismo dominio. Si el frontend llama directo a `onrender.com`, el login funciona pero crear, editar o borrar da **403**: el navegador no deja que el JavaScript lea la cookie `XSRF-TOKEN` de otro dominio.

**1. Cambiar [`frontend/vercel.json`](frontend/vercel.json)** (el único cambio de código) con la URL real de Render, y subirlo al repo con commit y push:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://TU-BACKEND.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**2. Crear el proyecto en Vercel:**

1. **Add New → Project** e importa `ramirols/abastix`.
2. **Root Directory:** `frontend`. El preset **Vite** se detecta solo.
3. Variable de entorno `VITE_API_BASE_URL` = la URL del **propio frontend**, por ejemplo `https://TU-PROYECTO.vercel.app` (no la de Render).
4. **Deploy.** Si cambias la variable después, haz **Redeploy**: el valor queda fijo en el build.

Con el frontend en un dominio `*.vercel.app`, no hace falta configurar `CORS_ALLOWED_ORIGINS`: el backend ya acepta ese patrón.

---

## Pruebas y problemas comunes

Prueba en este orden; cada paso confirma una parte antes de pasar a la siguiente.

- [ ] Abre `https://TU-BACKEND.onrender.com/api/auth/csrf`: debe mostrar un JSON con `token` (backend y base funcionando).
- [ ] Abre `https://TU-BACKEND.onrender.com/swagger-ui.html`: debe cargar la documentación de la API.
- [ ] Entra al frontend en Vercel e inicia sesión con `admin@abastix.com` / `123456`.
- [ ] Crea un producto o categoría: si se guarda, el CSRF y el proxy están bien.

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `RequestDisallowedByAzure` al crear el servidor | Región no permitida en Azure for Students | Crear el servidor en otra región (Paso 1) |
| Render muestra Build Command y Start Command | El servicio sigue en Node | Cambiar Language a Docker |
| Logs de Render: `Cannot open server` o `Client with IP address ... is not allowed` | Falta la regla de firewall | Agregar la regla `Render` (Paso 2) |
| Logs de Render: `Login failed for user` | Usuario o contraseña mal escritos | Revisar `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` |
| Primer arranque falla por timeout | La base gratuita estaba pausada y tardó en despertar | Esperar un minuto y hacer **Manual Deploy** de nuevo |
| Login da 504 en Vercel | El backend Free estaba dormido (tarda 1 a 3 minutos en arrancar) | Abrir primero `/api/auth/csrf` en Render y reintentar |
| Login funciona, pero crear o editar da 403 | El frontend llama directo a Render | Revisar `vercel.json` y que `VITE_API_BASE_URL` sea la URL de Vercel |
| Render se reinicia por memoria | 512 MB justos para Spring Boot | Agregar `JAVA_OPTS` (Paso 3) |

**Seguridad:** no compartas capturas con la contraseña de Azure ni el `JWT_SECRET`. Si se filtraron, restablece la contraseña en el servidor de Azure y actualiza `SPRING_DATASOURCE_PASSWORD` en Render.
