# ============================================================
# ETAPA 1: Compilacion del Frontend con Node.js y pnpm
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm compatible con el lockfile del monorepo
RUN corepack enable && corepack prepare pnpm@11.15.1 --activate

# Copiar manifiestos y lockfile del monorepo para optimizar cache de capas
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Instalar dependencias respetando el lockfile
RUN pnpm install --frozen-lockfile

# Copiar codigo fuente del frontend
COPY frontend/ ./frontend/

# Variable de entorno para build: vacio "" para usar proxy relativo /api en Nginx
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Compilar paquete de produccion
RUN pnpm --filter frontend build

# ============================================================
# ETAPA 2: Servidor Web Nginx para Produccion
# ============================================================
FROM nginx:1.27-alpine AS runner

# Copiar configuracion optimizada de Nginx con SPA fallback y reverse proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los artefactos estaticos compilados desde la etapa anterior
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Exponer el puerto configurado en Nginx
EXPOSE 5173

# Healthcheck interno del contenedor
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5173/ || exit 1

# Comando de inicio del servidor web
CMD ["nginx", "-g", "daemon off;"]
