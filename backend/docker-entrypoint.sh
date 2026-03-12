#!/bin/sh
# backend/docker-entrypoint.sh

# backend/docker-entrypoint.sh

# ... (al inicio)

echo "🔧 Ajustando permisos de carpetas críticas..."
# Asignar ownership a www-data y permisos seguros
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 1. Instalar dependencias si no existen
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependencias de Composer..."
    composer install --no-interaction --optimize-autoloader
fi

# 2. Copiar .env si no existe (Opcional, pero muy útil para desarrollo)
if [ ! -f ".env" ]; then
    echo "📄 Creando archivo .env desde ejemplo..."
    cp .env.example .env
fi

# 3. Generar la clave de aplicación si no está puesta
if ! grep -q "APP_KEY=base64" .env; then
    echo "🔑 Generando App Key..."
    php artisan key:generate
fi

# 4. Esperar a que la base de datos arranque (A veces el contenedor de DB tarda más)
echo "⏳ Esperando a la base de datos..."

# Cargar variables del .env para que getenv() funcione en el health check
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep -v '^\s*$' | sed 's/\s*$//' | xargs)
fi

MAX_RETRIES=20
RETRY_COUNT=0
until php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'Conectado'; } catch (PDOException \$e) { exit(1); }" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: No se pudo conectar a MySQL tras $MAX_RETRIES intentos."
    exit 1
  fi
  echo "zzz... MySQL aún no está listo. Reintentando en 3 segundos... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 3
done

# 5. Correr migraciones (Crea las tablas automáticamente)
echo "🚀 Ejecutando migraciones..."
php artisan migrate --force

# 5.5. Crear symlink storage (para avatares subidos)
php artisan storage:link --force 2>/dev/null || true

# 6. Arrancar el servidor de Laravel
echo "🏁 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=8000