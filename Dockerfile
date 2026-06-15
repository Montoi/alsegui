# ── Stage 1: Build del frontend ──────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# ── Stage 2: Servidor nginx de producción ────────────────────
FROM nginx:alpine

# Eliminar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar la configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos del build de React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
