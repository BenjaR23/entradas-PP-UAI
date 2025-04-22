//raising the server
import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts"
import { router } from "./router.ts"
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
const app = new Application()

app.use(oakCors());
app.use(router.routes())
app.use(router.allowedMethods())

console.log("Backend running on http://localhost:8080")
await app.listen({ port: 8080 })
