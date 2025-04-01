import { prisma } from '../client.ts';

export async function createTicket(userId: string, event: string, price: number) {
  return await prisma.ticket.create({
    data: {
      event,
      price,
      user: {
        connect: { id: userId },
      },
    },
  });
}