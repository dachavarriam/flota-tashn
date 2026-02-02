# frontend/flota-tas/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# npm ci es perfecto para builds limpios
RUN npm ci 
COPY . .

# --- CAMBIO AQUÍ ---
# Usamos una ruta relativa. El navegador completará el dominio automáticamente.
# Al compilar, React sabrá que la API vive en "/api" del mismo servidor.
ENV VITE_API_URL=/api

RUN npm run build

# --- Servidor Web Nginx ---
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]