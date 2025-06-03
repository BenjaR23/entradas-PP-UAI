# Construcción del frontend (React + Vite)
FROM node:18-alpine AS frontend-builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesariosn
COPY package.json package-lock.json ./
RUN npm install

# Copia todo el código
COPY . .

# Levantar el frontend
RUN npm run build


# Etapa 2: Backend con Deno
FROM denoland/deno:alpine-1.40.4

# Directorio de trabajo
WORKDIR /app

# Copiar compilacion del fontend 

COPY --from=frontend-builder /app/dist ./public
COPY . .

# Exponer el puerto del backend
EXPOSE 8080

# Comando de ejecución (ajusta si tu backend tiene otra entrada)
CMD ["run", "-A", "--unstable", "src/backend-node/main.ts"]
