import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const transferTicketHandler = async (ctx: Context) => {
  try {
    const { orderId, ticketId, userId, price } = await ctx.request.body({ type: "json" }).value;

    // Validación básica
    if (!orderId || !ticketId || price === undefined) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Faltan campos obligatorios" };
      return;
    }

    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!originalOrder) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }

    const orderItem = originalOrder.items.find(item => item.ticketId === ticketId);

    if (!orderItem) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El ticket no está asociado a esa orden" };
      return;
    }

    if (userId) {
      const newUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!newUser) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Usuario destino no encontrado" };
        return;
      }

      if (userId === originalOrder.userId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "El usuario destino es el mismo que el actual" };
        return;
      }

      // Borramos el ticket de la orden original
      await prisma.orderItem.delete({
        where: { id: orderItem.id },
      });

      // Creamos una nueva orden para el nuevo usuario
      const newOrder = await prisma.order.create({
        data: {
          userId,
          total: price,
          status: "completed",
          items: {
            create: {
              ticketId,
              quantity: 1,
              priceEach: price,
            },
          },
        },
      });

      ctx.response.status = 200;
      ctx.response.body = {
        message: "Ticket transferido a otro usuario",
        newOrderId: newOrder.id,
      };
    } else {
      // Reventa 
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

      if (!ticket) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Ticket no encontrado" };
        return;
      }

      const maxPrice = Number(ticket.price) * 0.9;
      const resalePrice = price > maxPrice ? maxPrice : price;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "reselling",
        },
      });

      ctx.response.status = 200;
      ctx.response.body = {
        message: "Orden marcada como reventa",
        adjustedPrice: resalePrice,
      };
    }
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(" Error en transferTicketHandler:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor", details: err.message };
  }
};