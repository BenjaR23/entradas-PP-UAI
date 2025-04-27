import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { verifyToken } from "./jwt.ts";

const prisma = new PrismaClient().$extends(withAccelerate());

export const purchaseHandler = async (ctx: Context) => {
  console.log("LLEGÓ PETICIÓN A /purchase");

  // 1. Verificar token
  const payload = await verifyToken(ctx);
  if (!payload) return;

  // 2. Parsear el cuerpo de la solicitud
  let eventId: number;
  let tickets: Array<{ ticketId: number; quantity: number }>;

  try {
    const { value } = await ctx.request.body({ type: "json" });
    const body = await value;
    eventId = parseInt(body.eventId);
    tickets = body.tickets.map((t: any) => ({
      ticketId: parseInt(t.ticketId),
      quantity: parseInt(t.quantity)
    }));
    console.log("Datos recibidos:", { eventId, tickets });
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid request body" };
    return;
  }

  // 3. Validar campos requeridos
  if (!eventId || !tickets || !Array.isArray(tickets)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Missing eventId or tickets" };
    return;
  }

  // 4. Procesar la compra en una transacción
  try {
    const order = await prisma.$transaction(async (tx) => {
      // Verificar disponibilidad de tickets y calcular el total
      let total = 0;
      const ticketUpdates = [];

      for (const item of tickets) {
        const ticket = await tx.ticket.findUnique({
          where: { id: item.ticketId },
          include: { event: true }
        });

        if (!ticket) {
          throw new Error(`Ticket with ID ${item.ticketId} not found`);
        }
        if (ticket.event.id !== eventId) {
          throw new Error(`Ticket ${item.ticketId} doesn't belong to event ${eventId}`);
        }
        if (ticket.stock < item.quantity) {
          throw new Error(`Not enough stock for ticket ID ${item.ticketId}`);
        }

        const itemTotal = Number(ticket.price) * item.quantity;
        total += itemTotal;

        ticketUpdates.push({
          where: { id: item.ticketId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity }
          }
        });
      }

      // Crear orden
      const orderItems = await Promise.all(
        tickets.map(async (item) => {
          const ticket = await tx.ticket.findUnique({
            where: { id: item.ticketId },
            select: { price: true }
          });
          const priceEach = ticket?.price || 0;  // Si no se encuentra, usa 0 como valor predeterminado

          return {
            ticketId: item.ticketId,
            quantity: item.quantity,
            priceEach: priceEach
          };
        })
      );

      // Crear la orden en la base de datos
      const order = await tx.order.create({
        data: {
          userId: payload.userId,
          total: total,
          status: "completed",
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      });

      // Actualizar los tickets
      for (const update of ticketUpdates) {
        await tx.ticket.update(update);
      }

      return order;
    });

    // Respuesta exitosa
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Purchase successful",
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: order.items.map(item => ({
          ticketId: item.ticketId,
          quantity: item.quantity,
          priceEach: item.priceEach
        }))
      }
    };

  } catch (error) {
    console.error("Purchase error:", error);
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
};
