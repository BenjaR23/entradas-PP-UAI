# backend/Dockerfile
FROM denoland/deno:1.44.0

WORKDIR /app

# Copiar backend
COPY src/backend-node ./backend-node
COPY prisma ./prisma
COPY generated ./generated
COPY src/backend-node/client.ts ./client.ts
COPY .env ./
# Copiar config.js desde la raíz del proyecto
COPY config.js ./config.js


RUN rm -f deno.lock

EXPOSE 8080

CMD ["run", "-A", "--env=.env", "backend-node/main.ts"]
