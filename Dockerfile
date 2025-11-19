# =============================
# 1. Base Image: PHP + Apache
# =============================
FROM php:8.2-apache

# Install tools required for build
RUN apt-get update && apt-get install -y wget unzip nodejs npm

# Enable MySQLi extension for PHP
RUN docker-php-ext-install mysqli


# =========================================
# 2. Cloud SQL Proxy (Secure SQL Access)
# =========================================
# Download Cloud SQL Proxy (latest)
RUN wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /cloud_sql_proxy \
    && chmod +x /cloud_sql_proxy

# Enable mod_rewrite and allow .htaccess override
RUN a2enmod rewrite
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# =========================================
# 3. Make Apache listen on Cloud Run PORT
# =========================================
ENV PORT=8080

# Update Apache config to listen on port 8080 (Cloud Run requirement)
RUN sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
RUN sed -i "s/:80/:${PORT}/" /etc/apache2/sites-available/000-default.conf


# ================================
# 4. Copy Backend PHP Files
# ================================
COPY backend/ /var/www/html/backend/


# ================================
# 5. Build React App
# ================================
COPY frontend/ /frontend/
WORKDIR /frontend
RUN npm install
RUN npm run build

# Copy built React frontend → Apache public folder
RUN cp -r build/* /var/www/html/


# ================================
# 6. Expose Cloud Run port
# ================================
EXPOSE 8080


# ================================
# 7. Start Cloud SQL Proxy + Apache
# ================================
CMD /cloud_sql_proxy -instances="rehoozdb:us-east4:rehooz2025"=tcp:3306 & apache2-foreground
