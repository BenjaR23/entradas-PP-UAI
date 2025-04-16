import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts"
import { createUser, createVenue, createEvent, createTicket, createOrder } from "./creators.ts"
import { getUsers } from "./controller.ts"

const router = new Router()

router
  .get("/", (ctx) => {
    ctx.response.body = "Welcome to API"
  })
  .get("/users", getUsers)
  .post("/users", createUser)
  .post("/venues", createVenue)
  .post("/events", createEvent)
  .post("/tickets", createTicket)
  .post("/orders", createOrder)

export { router }

