import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { verifyToken } from "./jwt.ts"; // Importa tu función de verificar

const prisma = new PrismaClient().$extends(withAccelerate());

export const purchaseHandler = async (ctx: Context) => {

  console.log("LLEGÓ PETICIÓN A /purchase"); // 🛑

  const payload = await verifyToken(ctx);
  if (!payload) {
    console.log("Token inválido o no enviado"); // 🛑
    return;
  }

  console.log("Token payload:", payload); // 🛑

  const { value } = await ctx.request.body({ type: "json" });
  const { eventId, tickets } = await value;
  
  console.log("Datos recibidos:", { eventId, tickets }); // 🛑




  try {
    const authHeader = ctx.request.headers.get('Authorization');
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Authorization header missing" };
      return;
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid token" };
      return;
    }

    const body = await ctx.request.body({ type: "json" }).value;
    const { eventId, tickets } = body;

    if (!eventId || !tickets || !Array.isArray(tickets)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request body" };
      return;
    }

    const ticketRecords = await prisma.ticket.findMany({
      where: {
        eventId: eventId,
        type: { in: tickets.map(t => t.type) }
      }
    });

    if (ticketRecords.length !== tickets.length) {
      ctx.response.status = 400;
      ctx.response.body = { error: "One or more ticket types are invalid." };
      return;
    }

    let totalPrice = 0;
    for (const selected of tickets) {
      const foundTicket = ticketRecords.find(t => t.type === selected.type);
      if (foundTicket) {
        totalPrice += parseInt(foundTicket.price) * selected.quantity;
      }
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: payload.userId, // 🚀 Aquí usamos el userId del token
        total: totalPrice.toString(),
        status: "pending",
        items: {
          create: tickets.map(t => ({
            type: t.type,
            quantity: t.quantity
          }))
        }
      }
    });

    ctx.response.status = 201;
    ctx.response.body = { message: "Purchase successful", purchase };
    
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
};
