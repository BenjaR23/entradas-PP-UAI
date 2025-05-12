import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { prisma } from "../client.ts";

export const checkInOrderItem = async (ctx: Context) => {
  try {
    const {orderId, ticketId} = ctx.params;



    if (!orderId || !ticketId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing orderId or ticketId" };
      return;
    }



    // Validar si los parámetros son válidos
    if (isNaN(parseInt(orderId)) || isNaN(parseInt(ticketId))) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid orderId or ticketId" };
      return;
    }

    console.log(`Checking in order item with Order ID: ${orderId} and Ticket ID: ${ticketId}`);


    const updatedItem = await prisma.orderItem.updateMany({
      where: { 
        orderId: parseInt(orderId),
        ticketId: parseInt(ticketId),
      },
      data: { IsCheckedIn: true },
    });


    if (updatedItem.count === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "No matching order item found" };
      return;
    }

    console.log("Updated item", updatedItem)

    ctx.response.status = 200;
    ctx.response.body = { success: true, updatedItem };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al hacer check-in del ticket." };
  }
};
