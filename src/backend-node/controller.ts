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
    // Verifica si el usuario ya tiene 4 tickets o más
    if (totalOwned + totalRequested > 4) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Solo se pueden comprar 4 tickets por usuario.",
        owned: totalOwned,
        tryingToBuy: totalRequested,
      };
      return;
    }
    // Verifica si el evento existe
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
    // Crea la orden
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
  };
};

export const getCouponsbyUserRUN = async (ctx: Context) => {
try {
    const userRUN = ctx.params.RUN; // Tomamos el RUN del usuario de los parámetros de la URL
    const parsedRUN = formatRUN(userRUN); // Usamos la función para tener el RUN en el formato correcto
    console.log("RUN:", parsedRUN); // Agregamos esto para asegurar que el RUN se está formateando correctamente

    if (!parsedRUN) { // Si el RUN no es válido, devolvemos un error
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid RUN format" };
      return;
    }
    console.log("Searching for the user's coupons...");

    const user = await prisma.user.findFirst({ // Buscamos al usuario en la base de datos ocupando el RUN
      where: { RUN: parsedRUN }});
    const userID = user?.id; // Setteamos el ID del usuario encontrado
    const userName = user?.name; // Guardamos el nombre del usuario para luego generar el codigo "único" del cupon
    const orders = await prisma.order.findMany({ // Buscamos las órdenes del usuario
      where: { userId: userID, status: "completed" }, // Solo buscamos órdenes completadas
      include: {
        items: { where: { IsCheckedIn: true } }, // Donde se haya hecho el check-in
      }
    })
    const ticketIds = orders.flatMap(order => order.items.map(item => item.ticketId)); // Obtenemos los IDs de los tickets de las órdenes del usuario
    console.log("Ticket IDs:", ticketIds); // Agregamos esto para ver los IDs de los tickets
    const coupons = await prisma.coupon.findMany({ // Buscamos los cupones asociados a los tickets que tiene el usuario
      where: { ticketId: { in: ticketIds }},
      include: {
        event: {
          select: { title: true, eventDate: true }}
        }
      }); // Donde el ticketId esté dentro de los IDs de tickets del usuario
    
    if (!coupons || coupons.length === 0) { // Si no se encuentran cupones, devolvemos un error 404
      ctx.response.status = 404;
      ctx.response.body = { 
        error: `Coupons for the user with RUN ${parsedRUN} have not found`,
      };
      return;
    }

    ctx.response.status = 200; // Si se encuentran cupones, devolvemos un 200 OK
    console.log("Coupons found:", coupons);  // Agregamos esto para ver los cupones encontrados
    
    for (const coupon of coupons) { // Iteramos sobre los cupones encontrados
      const couponCode = `${coupon.code}_${userName}`
      const encryptedCode = btoa(couponCode); // Usamos btoa para encriptar el código del cupón en base64
      coupon.code = encryptedCode; // Asignamos el código encriptado al cupón
    };

    // Debido a que no podemos saber realisticamente como todos los sistemas de cupones para cada uno de los recintos funcionaran (e.j uno puede pedir codigo QR, otro puede pedir un código escrito), y que generar cupones verdaderamente únicos es un proceso
    // que requeriría trabajar con estos recintos para que ellos tengan todos los codigos guardados en sus bases de datos para verificarlos de su parte y esto no se nos pide dentro del alcance actual del proyecto, lo que vamos a asumir es que cada recinto va a darnos un código 'base' para cada evento con una cantidad de usos maximos que ellos manejen y verifiquen,
    // de tal forma que nosotros no vamos a tener que verificar los cupones o cuantos usos de estos quedan, sino que simplemente vamos a generar un código único para cada usuario (código base + nombre usuario), y encriptarlo en base64 para que no se vea el código base del cupón.
    // De ahí el usuario va a poder presentar este cupón en el recinto, y el recinto va a primero descifrar el base64 del codigo, y luego verificar que el código base del cupón exista en su base de datos, registrando el nombre de la persona
    // que lo presentó para evitar que se use el mismo cupón varias veces, también reduciendo la cantidad de usos restantes del código base.
    
    // Esta es la solución en la que podemos pensar en un sistema de cupones únicos para cada usuario dadas las instrucciones y el alcance del proyecto, incluso si entendemos que en casos reales esta tendría que tomar en cuenta más cosas.
    
    ctx.response.body = coupons; // Devolvemos una respuesta con los cupones encontrados
  } catch (error) {
    console.error("Error fetching coupons:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Server error",
      details: error.message
    };
  };

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