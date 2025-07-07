import { Application, send } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./router.ts";
import { PrismaClient } from "../generated/client/deno/edge.ts";

const frontendOrigin = Deno.env.get("FRONTEND_ORIGIN") || "http://localhost:5173";


const app = new Application();
const prisma = new PrismaClient();

app.use(async (ctx, next) => {
  ctx.state.prisma = prisma;
  await next();
});

// ✅ CORS Middleware
app.use(oakCors({
  origin: frontendOrigin,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"]
}));

// ✅ Static files
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  if (
    !path.startsWith("/api") &&
    !path.startsWith("/users") &&
    !path.startsWith("/events") &&
    !path.startsWith("/login") &&
    !path.startsWith("/verify") &&
    !path.startsWith("/purchase") &&
    !path.startsWith("/register") &&
    !path.startsWith("/tickets") &&
    !path.startsWith("/coupons") &&
    !path.startsWith("/orders")
  ) {
    try {
      await send(ctx, path, {
        root: `${Deno.cwd()}/dist`,
        index: "index.html",
      });
    } catch {
      await next();
    }
  } else {
    await next();
  }
});

// ✅ API Routes
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Backend running");
await app.listen({ port: 8080, hostname: "0.0.0.0" });

