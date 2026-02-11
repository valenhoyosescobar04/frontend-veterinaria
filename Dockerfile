# Multi-stage build para Frontend Vite/React
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Argumento para la URL de la API (se pasa en tiempo de build)
ARG VITE_API_BASE_URL=http://localhost:8081/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar archivos de configuración primero (para cache)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine

# Instalar wget para health check
RUN apk add --no-cache wget

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

