FROM denoland/deno:1.44.0

WORKDIR /app

COPY . .

# Eliminar lockfile incompatible (si aplica)
RUN rm -f deno.lock

# Compilar frontend con Vite (usando Deno)
RUN deno task build

# Exponer puerto
EXPOSE 8080

# Ejecutar servidor Deno
CMD ["run", "-A", "--env=.env", "src/backend-node/main.ts"]
