import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./router.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts"; // Path to generated client

const app = new Application();
const prisma = new PrismaClient();

// Add prisma to app state
app.use(async (ctx, next) => {
  ctx.state.prisma = prisma;
  await next();
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Backend running on http://localhost:8080");
await app.listen({ port: 8080 });