# ── Stage 1: Build del backend ───────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias (incluyendo devDeps para compilar TS)
COPY package*.json ./
RUN npm ci

# Compilar TypeScript → JavaScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Imagen de producción ────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el JavaScript compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
