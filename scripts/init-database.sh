#!/usr/bin/env bash
# ============================================================
# ABASTIX — SCRIPT DE INICIALIZACION SEGURA DE BASE DE DATOS
# Espera a SQL Server, comprueba idempotencia y aplica esquema.
# ============================================================

set -e

MSSQL_HOST="${MSSQL_HOST:-sqlserver}"
MSSQL_PORT="${MSSQL_PORT:-1433}"
MSSQL_SA_PASSWORD="${MSSQL_SA_PASSWORD:-${SPRING_DATASOURCE_PASSWORD:-YourStrongPassword2026!}}"
APP_DB_USER="${APP_DB_USER:-${SPRING_DATASOURCE_USERNAME:-sa}}"
APP_DB_PASSWORD="${APP_DB_PASSWORD:-${SPRING_DATASOURCE_PASSWORD:-YourStrongPassword2026!}}"

# Localizar binario de sqlcmd en la imagen
SQLCMD=""
if [ -x "/opt/mssql-tools18/bin/sqlcmd" ]; then
    SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
    SQLCMD_FLAGS="-C"
elif [ -x "/opt/mssql-tools/bin/sqlcmd" ]; then
    SQLCMD="/opt/mssql-tools/bin/sqlcmd"
    SQLCMD_FLAGS=""
elif command -v sqlcmd >/dev/null 2>&1; then
    SQLCMD="sqlcmd"
    SQLCMD_FLAGS="-C"
else
    echo "[db-init] ERROR: No se encontro el comando sqlcmd."
    exit 1
fi

echo "[db-init] Utilizando cliente SQL: $SQLCMD (flags: $SQLCMD_FLAGS)"
echo "[db-init] Esperando a que Microsoft SQL Server en $MSSQL_HOST:$MSSQL_PORT este disponible..."

MAX_ATTEMPTS=45
ATTEMPT=1
READY=0

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if $SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -Q "SELECT 1;" >/dev/null 2>&1; then
        READY=1
        break
    fi
    echo "[db-init] Intento $ATTEMPT/$MAX_ATTEMPTS: SQL Server aun no responde. Reintentando en 2 segundos..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $READY -ne 1 ]; then
    echo "[db-init] ERROR CRITICO: SQL Server no estuvo disponible tras $((MAX_ATTEMPTS * 2)) segundos."
    exit 1
fi

echo "[db-init] SQL Server esta en linea y aceptando conexiones autenticadas."

# Comprobar si la base de datos AbastixDB ya existe
DB_EXISTS=$($SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.databases WHERE name = 'AbastixDB';" 2>/dev/null | tr -d '[:space:]')

if [ "$DB_EXISTS" = "1" ]; then
    echo "[db-init] Base de datos AbastixDB encontrada. Verificando integridad de tablas..."
    
    TABLE_COUNT=$($SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -d AbastixDB -h -1 -W -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.tables WHERE name IN ('roles', 'users', 'categories', 'products', 'customers', 'orders', 'order_details', 'inventory_movements', 'notifications', 'audit_logs');" 2>/dev/null | tr -d '[:space:]')
    
    if [ "$TABLE_COUNT" = "10" ]; then
        echo "[db-init] Base de datos AbastixDB y sus 10 tablas requeridas ya existen. No se requiere inicializacion ni siembra. Conservando datos existentes."
    else
        echo "[db-init] ATENCION: AbastixDB existe pero contiene solo $TABLE_COUNT de 10 tablas esperadas. Aplicando migracion segura..."
        $SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -i /sql/AbastixDB.sql
        echo "[db-init] Migracion segura aplicada."
    fi
else
    echo "[db-init] Base de datos AbastixDB no existe. Ejecutando script de inicializacion /sql/AbastixDB.sql..."
    if ! $SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -i /sql/AbastixDB.sql; then
        echo "[db-init] ERROR CRITICO: Fallo al ejecutar el script /sql/AbastixDB.sql."
        exit 1
    fi
    echo "[db-init] Esquema y datos semilla creados exitosamente."
fi

# Configurar usuario de aplicacion dedicado si no es sa
if [ "$APP_DB_USER" != "sa" ] && [ -n "$APP_DB_USER" ]; then
    echo "[db-init] Verificando login y usuario para: $APP_DB_USER..."
    $SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -Q "
    IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = '$APP_DB_USER')
    BEGIN
        CREATE LOGIN [$APP_DB_USER] WITH PASSWORD = '$APP_DB_PASSWORD', CHECK_POLICY = OFF;
    END;
    " >/dev/null 2>&1
    
    $SQLCMD -S "$MSSQL_HOST,$MSSQL_PORT" -U sa -P "$MSSQL_SA_PASSWORD" $SQLCMD_FLAGS -d AbastixDB -Q "
    IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = '$APP_DB_USER')
    BEGIN
        CREATE USER [$APP_DB_USER] FOR LOGIN [$APP_DB_USER];
        ALTER ROLE db_owner ADD MEMBER [$APP_DB_USER];
    END;
    " >/dev/null 2>&1
    echo "[db-init] Usuario $APP_DB_USER configurado con permisos sobre AbastixDB."
fi

echo "[db-init] Proceso de inicializacion finalizado exitosamente."
exit 0
