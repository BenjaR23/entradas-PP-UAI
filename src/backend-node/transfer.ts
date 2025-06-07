import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient, Prisma } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const transferTicketHandler = async (ctx: Context) => {
  try {
    const { orderId, ticketId, userId, price } = await ctx.request.body({ type: "json" }).value;

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
      // --- Código para transferir a otro usuario (igual que antes) ---
      // ...
    } else {
      // Reventa
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

      if (!ticket) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Ticket no encontrado" };
        return;
      }

      const maxPrice = Number(originalOrder.total) * 0.9;
      const resalePrice = price > maxPrice ? maxPrice : price;

      const resaleOrder = await prisma.order.create({
        data: {
          userId: originalOrder.userId,
          total: new Prisma.Decimal(resalePrice),
          status: "reselling",
          items: {
            create: {
              ticketId: ticketId,
              quantity: 1,
              priceEach: new Prisma.Decimal(resalePrice),
              IsCheckedIn: false,
            },
          },
        },
      });

      await prisma.orderItem.delete({
        where: { id: orderItem.id },
      });

      ctx.response.status = 200;
      ctx.response.body = {
        message: "Nueva orden creada para reventa con el ticket seleccionado",
        resaleOrderId: resaleOrder.id,
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
