import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { verifyToken } from "./jwt.ts"; // Importa tu función de verificar

const prisma = new PrismaClient().$extends(withAccelerate());

export const purchaseHandler = async (ctx: Context) => {
  console.log("LLEGÓ PETICIÓN A /purchase");

  // Get token from header
  const authHeader = ctx.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Authorization header missing or invalid" };
    return;
  }

  const token = authHeader.split(' ')[1];
  
  // Verify token
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload || !payload.userId) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid token" };
      return;
    }

    console.log("Token payload:", payload);

    // Process purchase
    const { value } = await ctx.request.body({ type: "json" });
    const { eventId, tickets } = await value;
    
    console.log("Datos recibidos:", { eventId, tickets });

    if (!eventId || !tickets || !Array.isArray(tickets)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid request body" };
      return;
    }

    // Rest of your purchase logic...
    const ticketRecords = await prisma.ticket.findMany({
      where: {
        eventId: eventId,
        type: { in: tickets.map(t => t.type) }
      }
    });

    // Continue with your existing purchase processing...
    
  } catch (error) {
    console.error(error);
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token or request" };
  }
};