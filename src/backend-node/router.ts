//route definition
import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts"
import { getUsers, getEvents, getEventByName } from "./controller.ts"
import { compareLogins } from "./logins.ts"
import { verifyToken } from "./jwt.ts"
import { purchaseHandler } from "./purchase.ts";

router.post("/purchase", purchaseHandler);


const router = new Router()

router
  .get("/", (ctx) => {
    ctx.response.body = " API working"
  })
  .get("/users", getUsers)
  .get("/events", getEvents)
  .get("/events/:eventname", getEventByName)
  .post("/login", compareLogins)
  .post("/verify", verifyToken)

export { router }
