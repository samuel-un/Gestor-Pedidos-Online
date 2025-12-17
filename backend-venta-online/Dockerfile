FROM php:8.2-apache

# Instalar extensiones necesarias para Laravel y Postgres
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Habilitar mod_rewrite para Laravel
RUN a2enmod rewrite

# Copiar archivos del proyecto
COPY . /var/www/html

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Cambiar el DocumentRoot de Apache a la carpeta /public de Laravel
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Instalar dependencias de PHP
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar: migraciones + seeder profesional + servidor
CMD php artisan migrate:fresh --seed --force && apache2-foreground