import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./router.ts";
import { prisma } from "../client.ts"; // Importamos prisma correctamente

const app = new Application();

// Agregar prisma al state de Oak
app.use(async (ctx, next) => {
  ctx.state.prisma = prisma;
  await next();
});

// Usar CORS para permitir peticiones externas
app.use(oakCors());

// Usar las rutas
app.use(router.routes());
app.use(router.allowedMethods());

// Levantar el servidor
console.log("Backend running on http://localhost:8080");
await app.listen({ port: 8080 });
