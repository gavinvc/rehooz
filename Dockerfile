FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM php:8.2-apache

RUN a2enmod rewrite

ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/build/ /var/www/html/

COPY backend/ /var/www/html/backend/

RUN chown -R www-data:www-data /var/www/html

CMD ["bash", "-c", "sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && apache2-foreground"]

