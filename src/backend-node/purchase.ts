// src/backend-node/purchase.ts
import { createPurchase } from "./purchaseService.ts";

export async function purchaseHandler(ctx: any) {
  try {
    const body = await ctx.request.body({ type: "json" }).value;

    const { userId, cartItems } = body;

    const order = await createPurchase(userId, cartItems);

    ctx.response.status = 200;
    ctx.response.body = { success: true, order };
  } catch (error) {
    console.error("Purchase error:", error);
    ctx.response.status = 400;
    ctx.response.body = { success: false, message: error.message };
  }
}
