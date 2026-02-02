# backend/Dockerfile
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

COPY . .

# Generar cliente de Prisma y Compilar el código (Build)
RUN npx prisma generate
RUN npm run build

# --- Imagen de Producción (Más ligera) ---
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && apt-get clean

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copiar carpeta de uploads para que no se pierdan las fotos iniciales (opcional)
COPY --from=builder /app/uploads ./uploads

# Exponer puerto
EXPOSE 3000

# Iniciar la app en modo producción
CMD ["node", "dist/src/main"]