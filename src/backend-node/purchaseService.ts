// src/backend-node/purchaseService.ts
import { PrismaClient } from "../../generated/client/deno/edge.ts";
const prisma = new PrismaClient();

export async function createPurchase(userId: number, cartItems: { ticketId: number; quantity: number; }[]) {
  // 1. Empezamos una transacción
  const purchase = await prisma.$transaction(async (tx) => {
    let total = 0;

    // 2. Revisamos stock y calculamos total
    for (const item of cartItems) {
      const ticket = await tx.ticket.findUnique({
        where: { id: item.ticketId }
      });

      if (!ticket) {
        throw new Error(`Ticket with ID ${item.ticketId} not found`);
      }

      if (ticket.stock < item.quantity) {
        throw new Error(`Not enough stock for ticket ID ${item.ticketId}`);
      }

      total += Number(ticket.price) * item.quantity;
    }

    // 3. Creamos la Order
    const order = await tx.order.create({
      data: {
        userId: userId,
        total: total,
        items: {
          create: cartItems.map(item => ({
            ticketId: item.ticketId,
            quantity: item.quantity,
            priceEach: new prisma.Prisma.Decimal(0), // se setea más abajo
          }))
        }
      },
      include: { items: true },
    });

    // 4. Actualizamos precios en OrderItems y stocks
    for (const item of order.items) {
      const ticket = await tx.ticket.findUnique({ where: { id: item.ticketId } });
      if (ticket) {
        await tx.orderItem.update({
          where: { id: item.id },
          data: { priceEach: ticket.price }
        });

        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            stock: ticket.stock - item.quantity,
            sold: ticket.sold + item.quantity
          }
        });
      }
    }

    return order;
  });

  return purchase;
}
