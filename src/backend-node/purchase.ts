import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { JWTPayload, jwtVerify } from 'https://deno.land/x/jose@v6.0.10/index.ts';
import { createSecretKey } from "node:crypto";
import process from "node:process";

interface UserPayload {
  userEmail: string;
  userName: string;
  userId: number;
  userRole: string;
  timeGenerated: string;
  userRUN: string;
}

const secret = createSecretKey(process.env.secretKey, 'utf-8');

const prisma = new PrismaClient().$extends(withAccelerate());

export const purchaseHandler = async (ctx: Context) => {
  console.log("LLEGÓ PETICIÓN A /purchase");

  // 1. Verify token
  const tokenheader = ctx.request.headers.get("Authorization")
  if (!tokenheader || !tokenheader.startsWith('Bearer ')) {
    console.log("Authorization header faltante o mal formado");
    return null;
  }
  const token = tokenheader.split(' ')[1];
  const { payload } = await jwtVerify(token, secret);
  const userPayload = payload as unknown as UserPayload;
  if (!payload) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido o no presente" };
    return;
  }
  console.log("Token verificado:", payload);
  // 2. Parse request body
  let eventId: number;
  let tickets: Array<{ ticketId: number; quantity: number }>;

  try {
    const { value } = await ctx.request.body({ type: "json" });
    const body = await value;
    console.log("Request body parseado:", body);

    if (!body.eventId || !Array.isArray(body.tickets)) {
      throw new Error("Missing eventId or tickets array");
    }

    eventId = Number(body.eventId);

    tickets = body.tickets.map((t: any) => ({
      ticketId: Number(t.ticketId),
      quantity: Number(t.quantity),
    }));

    if (tickets.some(t => isNaN(t.ticketId) || isNaN(t.quantity))) {
      throw new Error("Invalid ticketId or quantity format");
    }

  } catch (error) {
    console.error("Error parseando el request:", error);
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request body" };
    return;
  }

  // 3. Validate required fields
  if (!eventId || !tickets.length) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Missing eventId or tickets" };
    return;
  }

  // 4. Transaction
  try {
    const order = await prisma.$transaction(async (tx) => {
      console.log("Dentro de la transacción");

      let total = 0;
      const ticketUpdates = [];
      const orderItemsData = [];

      for (const item of tickets) {
        const ticket = await tx.ticket.findUnique({
          where: { id: item.ticketId },
          include: { event: true },
        });

        if (!ticket) throw new Error(`Ticket ${item.ticketId} not found`);
        if (ticket.event.id !== eventId) throw new Error(`Ticket ${item.ticketId} doesn't belong to event ${eventId}`);
        if (ticket.stock < item.quantity) throw new Error(`Not enough stock for ticket ${item.ticketId}`);

        const itemTotal = ticket.price * item.quantity;
        total += itemTotal;

        ticketUpdates.push(
          tx.ticket.update({
            where: { id: item.ticketId },
            data: {
              stock: { decrement: item.quantity },
              sold: { increment: item.quantity },
            },
          })
        );

        orderItemsData.push({
          ticketId: item.ticketId,
          quantity: item.quantity,
          priceEach: ticket.price,
        });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId: userPayload.userId,
          total: total,
          status: "completed",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Execute ticket updates
      await Promise.all(ticketUpdates);

      return order;
    });

    ctx.response.status = 201;
    ctx.response.body = {
      message: "Purchase successful",
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: order.items.map((item) => ({
          ticketId: item.ticketId,
          quantity: item.quantity,
          priceEach: item.priceEach,
        })),
      },
    };

  } catch (error) {
    console.error("Error durante purchase:", error);
    ctx.response.status = 400;
    ctx.response.body = {
      error: error.message,
      details: error.stack?.split('\n'),
    };
  }
};
