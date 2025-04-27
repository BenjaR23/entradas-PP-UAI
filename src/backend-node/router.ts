import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { 
  getUsers, 
  getEvents, 
  getEventByName,
  getEventById 
} from "./controller.ts";
import { compareLogins } from "./logins.ts";
import { verifyToken } from "./jwt.ts";
import { purchaseHandler } from "./purchase.ts";

const router = new Router();

router
  .get("/", (ctx) => {
    ctx.response.body = "API working";
  })
  .get("/users", getUsers)
  .get("/events", getEvents)
  .get("/events/id/:id", getEventById) // This should come first
  .get("/events/:eventname", getEventByName) // This comes second
  .post("/login", compareLogins)
  .post("/verify", verifyToken)
  .post("/purchase", purchaseHandler);

export { router };