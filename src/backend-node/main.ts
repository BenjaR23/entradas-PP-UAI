import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./router.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts"; // Path to generated client

const app = new Application();
const prisma = new PrismaClient();

// Añadimos el cliente Prisma al contexto de la aplicación
app.use(async (ctx, next) => {
  ctx.state.prisma = prisma;
  await next();
});

// Usamos CORS para permitir solicitudes desde el frontend
app.use(oakCors());

// Usamos el router definido en router.ts
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
  try {
    await send (ctx, ctx.request.url.pathname, {
      root : `${Deno.cwd()}/src/backend-node/public`,
      index: "index.html",
    });
  } catch {
    await next();
  }
}); 


// Iniciamos el servidor en el puerto 8080
console.log("Backend running on http://localhost:8080");
await app.listen({ port: 8080 });
