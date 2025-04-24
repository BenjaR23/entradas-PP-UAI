//route definition
import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts"
import { getUsers, getEvents, getEventByName } from "./controller.ts"

const router = new Router()

router
  .get("/", (ctx) => {
    ctx.response.body = " API working"
  })
  .get("/users", getUsers)
  .get("/events", getEvents)
  .get("/events/:eventname", getEventByName)

export { router }
