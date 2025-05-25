import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { 
  getUsers, 
  getEvents, 
  getEventByName,
  getEventById,
  getTicketsbyUserRUN
} from "./controller.ts";
import { compareLogins } from "./logins.ts";
import { verifyToken } from "./jwt.ts";
import { purchaseHandler } from "./purchase.ts";
import { checkInOrderItem } from "./checkin.ts";
import { transferTicketHandler } from   "./transfer.ts";


const router = new Router();

// Definimos cada ruta en líneas separadas (no encadenadas)
router.get("/", (ctx) => {
  ctx.response.body = "API working";
});

router.get("/users", getUsers);

router.get("/events", getEvents);

router.get("/events/id/:id", getEventById); // Primero el ID (más específico)

router.get("/events/:eventname", getEventByName); // Después el nombre

router.post("/login", compareLogins);

router.post("/verify", verifyToken);

router.post("/purchase", purchaseHandler);

router.get("/tickets/RUN/:RUN", getTicketsbyUserRUN);

router.patch("/order-items/:orderId/:ticketId/check-in", checkInOrderItem);

router.patch("/transfer-ticket", transferTicketHandler);

export { router };
