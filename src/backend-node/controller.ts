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
    const id = parseInt(ctx.params.id); // Obtenemos el ID de la URL y lo convertimos a número
    
    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "ID must be a number" };
      return;
    }


    const event = await prisma.event.findUnique({ // Buscar evento en la base de datos donde el ID coincida con el ID dado
      where: { id },
      include: {
        tickets: true,
        venue: true
      }
    });
    console.log("Event found")
    if (!event) { // En caso de que no se encuentre el evento, se tira un error 404
      ctx.response.status = 404;
      ctx.response.body = {
        error: `Event with ID ${id} not found`,
        suggestion: "Try checking /events to see available events"
      };
      return;
    }

    const ticketIds = event?.tickets.map(ticket => ticket.id); // Obtenemos los IDs de los tickets del evento

    const checkedIn = await prisma.orderItem.aggregate({ // Para conseguir la cantidad de tickets que han pasado por el check-in hacemos un aggregate
      where: { ticketId: { in: ticketIds }, IsCheckedIn: true }, // Donde el ticketId esté dentro de los IDs de tickets del evento y esté marcado como checked-in
      _sum: {
        quantity: true // Sumamos la cantidad de tickets
      }
    })

    const totalCheckedIn = checkedIn._sum.quantity ?? 0; // Si no hay tickets checked-in, se asigna 0, en otro caso se asigna la cantidad de tickets checked-in


    const totalCapacity = event?.tickets.reduce((sum, ticket) => {
      return sum + ticket.sold + ticket.stock; // Para encontrar la capacidad total, sumamos la cantidad de tickets vendidos y la cantidad de tickets en stock
    }, 0);

    ctx.response.body = { // Dado todo esto, actualizamos el body de la respuesta para incluir la información del evento y los diferentes datos asociados al aforo
      ...event,
      stats: {
        totalCapacity,
        totalCheckedIn,
        remainingCapacity: totalCapacity - totalCheckedIn // La capacidad restante se calcula restando la cantidad de tickets checked-in a la capacidad total
      }
    };

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
    const { eventId, tickets } = await ctx.request.body().value;

    for (const ticket of tickets) {
      await prisma.ticket.updateMany({
        where: {
          eventId: eventId,
          type: ticket.type,
          stock: { gte: ticket.quantity }
        },
        data: {
          stock: { decrement: ticket.quantity },
          sold: { increment: ticket.quantity }
        }
      });
    }

    ctx.response.status = 201;
    ctx.response.body = { message: "Purchase successful" };
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error processing purchase", details: error.message };
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
      where: { userId: userID },
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