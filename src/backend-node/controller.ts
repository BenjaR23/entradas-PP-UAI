import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const prisma = new PrismaClient().$extends(withAccelerate());

// Get all users
export const getUsers = async (ctx: Context) => {
  try {
    const users = await prisma.user.findMany();
    ctx.response.body = users;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Failed to fetch users",
      details: error.message 
    };
  }
};

// Get all events with their tickets
export const getEvents = async (ctx: Context) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        tickets: true,
        venue: true
      }
    });
    ctx.response.body = events;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch events",
      details: error.message
    };
  }
};

// Get event by ID (numeric)
export const getEventById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "ID must be a number" };
      return;
    }

    console.log("Searching for event with ID:", id); // Agregar para depurar

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        tickets: true,
        venue: true
      }
    });

    if (!event) {
      ctx.response.status = 404;
      ctx.response.body = { 
        error: `Event with ID ${id} not found`,
        suggestion: "Try checking /events to see available events"
      };
      return;
    }

    ctx.response.body = event;
  } catch (error) {
    console.error("Error fetching event:", error); // Agregar para depurar
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Server error",
      details: error.message
    };
  }
};


// Get event by name
export const getEventByName = async (ctx: Context) => {
  try {
    const eventname = ctx.params.eventname;
    const event = await prisma.event.findFirst({
      where: { 
        title: { 
          contains: eventname,
          mode: 'insensitive' // Case insensitive search
        } 
      },
      include: {
        tickets: true,
        venue: true
      }
    });

    if (!event) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Event not found" };
      return;
    }

    ctx.response.body = event;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch event",
      details: error.message
    };
  }
};


//  createPurchase (nuevo)
export const createPurchase = async (ctx: Context) => {
  try {
    const { eventId, tickets, userId } = await ctx.request.body().value;

    // Chequea cantidad
  
    const existingTickets = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          status: "paid",
        },
        ticket: {
          eventId,
        },
      },
    });

    const totalOwned = existingTickets.reduce((sum, item) => sum + item.quantity, 0);
    const totalRequested = tickets.reduce((sum, item) => sum + item.quantity, 0);

    if (totalOwned + totalRequested > 4) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Solo se pueden comprar 4 tickets por usuario.",
        owned: totalOwned,
        tryingToBuy: totalRequested,
      };
      return;
    }

    for (const ticket of tickets) {
      await prisma.ticket.updateMany({
        where: {
          eventId: eventId,
          type: ticket.type,
          stock: { gte: ticket.quantity },
        },
        data: {
          stock: { decrement: ticket.quantity },
          sold: { increment: ticket.quantity },
        },
      });
    }

    ctx.response.status = 201;
    ctx.response.body = { message: "Purchase successful" };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Error processing purchase",
      details: error.message,
    };
  }
};

function formatRUN(rawRun: string): string | null {
  // Remove all non-digit and non-'kK' characters
  const clean = rawRun.replace(/[^0-9kK]/g, '');

  // Ensure minimum length of 2 (1 digit + check digit)
  if (clean.length < 2) return null;

  const numberPart = clean.slice(0, -1);
  const checkDigit = clean.slice(-1).toUpperCase();

  // Add thousands separator
  const reversed = numberPart.split('').reverse();
  const chunks = [];
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  const formattedNumber = chunks.reverse().join('.');

  return `${formattedNumber}-${checkDigit}`;
}

export const getTicketsbyUserRUN = async (ctx: Context) => {
  try {
    const userRUN = ctx.params.RUN;
    const parsedRUN = formatRUN(userRUN);
    console.log("RUN:", parsedRUN);

    if (!parsedRUN) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid RUN format" };
      return;
    }

    console.log("Searching for the tickets of the user with RUN:", parsedRUN); // Agregar para depurar
    
    const user = await prisma.user.findFirst({
      where: { RUN: parsedRUN }});
    const userID = user?.id;
    const orders = await prisma.order.findMany({
      where: {
        userId: userID,
        NOT: {
          status: {
            in: ["pending", "reselling"] // Exclude pending and reselling orders
          }
        }
      },
      include: {
        items: {
          include: {
            ticket: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!orders) {
      ctx.response.status = 404;
      ctx.response.body = { 
        error: `Tickets for the user with RUN ${parsedRUN} have not found`,
      };
      return;
    }

    ctx.response.body = orders;
  } catch (error) {
    console.error("Error fetching order list:", error); // Agregar para depurar
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Server error",
      details: error.message
    };
  }
};

export const getResellingOrders = async (ctx: Context) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "reselling" },
      include: {
        user: true,
        items: {
          include: {
            ticket: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "No reselling orders found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = orders.map(order => ({
      orderId: order.id,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        RUN: order.user.RUN,
      },
      items: order.items.map(item => ({
        quantity: item.quantity,
        priceEach: item.priceEach,
        ticket: {
          id: item.ticket.id,
          type: item.ticket.type,
          price: item.ticket.price,
          event: {
            id: item.ticket.event.id,
            title: item.ticket.event.title,
            eventDate: item.ticket.event.eventDate,
          },
        },
      })),
    }));
  } catch (error) {
    console.error("Error fetching reselling orders:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Failed to fetch reselling orders", 
      details: error.message 
    };
  }
};

export const resellPurchaseOrder = async (ctx: Context) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const { orderId, userId, total } = await body.value;


    if (!orderId || !userId || !total) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Faltan campos requeridos: orderId, userId o total" };
      return;
    }

    // Actualiza la orden con el nuevo comprador
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        userId: parseInt(userId),
        total: total,
        status: "completed", // asegúrate que este estado exista
      },
    });

    ctx.response.status = 200;
    ctx.response.body = updatedOrder;
  } catch (err) {
    console.error("Error en resellPurchaseOrder:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno al procesar la compra de reventa" };
  }
};