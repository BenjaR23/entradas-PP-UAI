import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { verifyToken } from "./jwt.ts"; // Import your existing verifyToken function

const prisma = new PrismaClient().$extends(withAccelerate());

export const purchaseHandler = async (ctx: Context) => {
  console.log("LLEGÓ PETICIÓN A /purchase");

  // 1. Verify token using existing function
  const payload = await verifyToken(ctx);
  if (!payload) {
    // verifyToken already sets the response, just return
    return;
  }

  // 2. Parse request body
  let eventId: string;
  let tickets: Array<{ type: string; quantity: number }>;
  
  try {
    const { value } = await ctx.request.body({ type: "json" });
    ({ eventId, tickets } = await value);
    console.log("Datos recibidos:", { eventId, tickets });
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request body" };
    return;
  }

  // 3. Validate required fields
  if (!eventId || !tickets || !Array.isArray(tickets)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Missing eventId or tickets" };
    return;
  }

  // 4. Process purchase
  try {
    // Check ticket availability
    const ticketRecords = await prisma.ticket.findMany({
      where: {
        eventId: eventId,
        type: { in: tickets.map(t => t.type) }
      }
    });

    if (ticketRecords.length !== tickets.length) {
      ctx.response.status = 400;
      ctx.response.body = { error: "One or more ticket types are invalid" };
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    for (const selected of tickets) {
      const foundTicket = ticketRecords.find(t => t.type === selected.type);
      if (foundTicket) {
        totalPrice += parseInt(foundTicket.price) * selected.quantity;
      }
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: payload.userId, // From verified token
        total: totalPrice.toString(),
        status: "completed",
        items: {
          create: tickets.map(t => ({
            type: t.type,
            quantity: t.quantity
          }))
        }
      }
    });

    ctx.response.status = 201;
    ctx.response.body = { 
      message: "Purchase successful", 
      purchase: {
        id: purchase.id,
        total: purchase.total,
        status: purchase.status,
        items: tickets
      }
    };

  } catch (error) {
    console.error("Purchase error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
};