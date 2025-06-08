import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { 
  getUsers, 
  getEvents, 
  getEventByName,
  getEventById,
  getTicketsbyUserRUN,
  getCouponsbyUserRUN
} from "./controller.ts";
import { compareLogins } from "./logins.ts";
import { verifyToken } from "./jwt.ts";
import { purchaseHandler } from "./purchase.ts";
import { checkInOrderItem } from "./checkin.ts";
import { transferTicketHandler } from   "./transfer.ts";
import { getResellingOrders } from "./controller.ts";
import { resellPurchaseOrder } from "./controller.ts";


const router = new Router(); // Creamos una instancia del router de Oak

// Definimos cada ruta en líneas separadas (no encadenadas)
router.get("/", (ctx) => {
  ctx.response.body = "API working";
});

router.get("/users", getUsers); // Link para obtener todos los usuarios

router.get("/events", getEvents); // Link para obtener todos los eventos

router.get("/events/id/:id", getEventById); // Link para obtener un evento por ID

router.get("/events/:eventname", getEventByName); // Link para obtener un evento por nombre

router.post("/login", compareLogins); // Link para iniciar sesión y obtener un token

router.post("/verify", verifyToken); // Link para verificar el token

router.post("/purchase", purchaseHandler); // Link para procesar una compra

router.get("/tickets/RUN/:RUN", getTicketsbyUserRUN); // Link para obtener tickets por RUN de usuario

router.get("/coupons/:RUN", getCouponsbyUserRUN) // Link para obtener cupones por RUN de usuario

router.patch("/order-items/:orderId/:ticketId/check-in", checkInOrderItem); // Link para hacer check-in de un ticket en una orden

router.patch("/transfer-ticket", transferTicketHandler); // Link para transferir un ticket a otro usuario

router.get("/orders/reselling", getResellingOrders); // Link para obtener los tickets en reventa

router.post("/orders/resell-purchase", resellPurchaseOrder); // Link para procesar una compra de reventa

export { router };
