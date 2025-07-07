import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient, Prisma } from "../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const transferTicketHandler = async (ctx: Context) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    let { orderId, ticketId, userId, price } = body;

    // Convertir IDs a número para evitar errores de tipo en Prisma
    orderId = Number(orderId);
    ticketId = Number(ticketId);
    price = Number(price);
    if (userId !== undefined) {
      userId = Number(userId);
    }

    if (!orderId || !ticketId || price === undefined || isNaN(orderId) || isNaN(ticketId) || isNaN(price) || (userId !== undefined && isNaN(userId))) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Faltan campos obligatorios o valores inválidos" };
      return;
    }
    // Encontrar la orden original y el ticket asociado
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });
    // Si no se encuentra la orden original, retornar error
    if (!originalOrder) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }
    // Verificar que el ticket esté asociado a la orden original
    const orderItem = originalOrder.items.find(item => item.ticketId === ticketId);
    //
    if (!orderItem) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El ticket no está asociado a esa orden" };
      return;
    }

    if (userId) {
      // Validar que el usuario destino exista
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Usuario destino no encontrado" };
        return;
      }
    
      // Crear nueva orden para el usuario destino con el ticket transferido
      const transferOrder = await prisma.order.create({
        data: {
          userId: userId,
          total: new Prisma.Decimal(orderItem.priceEach.toString()),
          status: "completed",
          items: {
            create: {
              ticketId: ticketId,
              quantity: orderItem.quantity,
              priceEach: orderItem.priceEach,
              IsCheckedIn: false,
            },
          },
        },
      });
    
      // Eliminar el ticket de la orden original para evitar duplicados
      await prisma.orderItem.delete({
        where: { id: orderItem.id },
      });

      // Verificar si la orden original quedó sin items
      const remainingItems = await prisma.orderItem.findMany({
        where: { orderId: originalOrder.id },
      });

      if (remainingItems.length === 0) {
        // Si no quedan items, eliminar la orden original
        await prisma.order.delete({
          where: { id: originalOrder.id },
        });
      }
      // Retornar respuesta exitosa
      ctx.response.status = 200;
      ctx.response.body = {
        message: "Ticket transferido correctamente a otro usuario",
        transferOrderId: transferOrder.id,
      };

    } else {
      // Para la reventa, buscamos el ticket por ID
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      // Si no se encuentra el ticket, retornar error
      if (!ticket) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Ticket no encontrado" };
        return;
      }
      // Verificamos que el precio de reventa no supere el 90% del precio original, y si lo supera, ajustarlo para que sea el 90%
      const maxPrice = Number(originalOrder.total) * 0.9;
      const resalePrice = price > maxPrice ? maxPrice : price;
      // Creamos una nueva orden para la reventa del ticket
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
      // Eliminar el ticket de la orden original para evitar duplicados
      await prisma.orderItem.delete({
        where: { id: orderItem.id },
      });
      
      // Verificar si la orden original quedó sin items
      const remainingItems = await prisma.orderItem.findMany({
        where: { orderId: originalOrder.id },
      });
      
      if (remainingItems.length === 0) {
        // Si no quedan items, eliminar la orden original
        await prisma.order.delete({
          where: { id: originalOrder.id },
        });
      }
      // Retornar respuesta exitosa
      ctx.response.status = 200;
      ctx.response.body = {
        message: "Nueva orden creada para reventa con el ticket seleccionado",
        resaleOrderId: resaleOrder.id,
        adjustedPrice: resalePrice,
      };
    }
  } catch (error) {
    // Si ocurre un error, capturarlo y retornar un mensaje genérico
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error en transferTicketHandler:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno del servidor", details: err.message };
  }
};
