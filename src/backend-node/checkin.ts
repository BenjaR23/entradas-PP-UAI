import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { prisma } from "../client.ts";

export const checkInOrderItem = async (ctx: Context) => {
  try {
    const id = ctx.params.id;

    const updatedItem = await prisma.orderItem.update({
      where: { id: parseInt(id) },
      data: { IsCheckedIn: true },
    });

    ctx.response.status = 200;
    ctx.response.body = { success: true, updatedItem };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al hacer check-in del ticket." };
  }
};
