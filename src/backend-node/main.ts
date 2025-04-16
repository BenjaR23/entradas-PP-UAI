import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts"
import { router } from "./router.ts"

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

console.log("Backend http://localhost:8080")
await app.listen({ port: 8080 })

