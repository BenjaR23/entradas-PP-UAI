import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const prisma = new PrismaClient().$extends(withAccelerate());

// Función para obtener todos los usuarios
export const getUsers = async (ctx: Context) => {
  try {
    const users = await prisma.user.findMany(); // Usamos Prisma para retornar todos los usuarios en la base de datos (en la tabla de usuarios)
    ctx.response.body = users;
  } catch (error) { // Si hay un error al obtener los usuarios, se captura y se devuelve un error 500
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Failed to fetch users",
      details: error.message 
    };
  }
};

// Obtener todos los eventos, tickets asociados y recintos
export const getEvents = async (ctx: Context) => {
  try {
    const events = await prisma.event.findMany({ // Usamos Prisma para retornar todos los eventos en la base de datos (en la tabla de eventos)
      include: {
        tickets: true, // Incluimos los tickets asociados a cada evento
        venue: true // Incluimos el recinto asociado a cada evento
      }
    });
    ctx.response.body = events; // Devolvemos los eventos encontrados en el cuerpo de la respuesta
  } catch (error) { // Si hay un error al obtener los eventos, se captura y se devuelve un error 500
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch events",
      details: error.message
    };
  }
};

// Obtener un evento por ID
export const getEventById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id); // Obtenemos el ID que está en el URL y lo convertimos a número
    
    if (isNaN(id)) { // Si el ID no es un número, devolvemos un error 400 con el mensaje de que el ID debe ser un número
      ctx.response.status = 400;
      ctx.response.body = { error: "ID must be a number" };
      return;
    }


    const event = await prisma.event.findUnique({ // Buscamos el evento en la base de datos usando Prisma (en la tabla de eventos)
      where: { id }, // Donde el ID del evento sea igual al ID que recibimos en el URL
      include: {
        tickets: true, // Incluimos los tickets asociados a este evento
        venue: true // Incluimos el recinto asociado a este evento
      }
    });
    console.log("Event found") // Para hacer debug, imprimimos que se encontró el evento
    if (!event) { // En caso de que no se encuentre el evento, se tira un error 404
      ctx.response.status = 404;
      ctx.response.body = {
        error: `Event with ID ${id} not found`,
        suggestion: "Try checking /events to see available events" // Sugerimos al usuario que revise la lista de eventos disponibles
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
    console.error("Error fetching event:", error); // Debug para ver si hay algún error al buscar el evento
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Server error",
      details: error.message
    };
  }
};


// Buscar un evento por nombre
export const getEventByName = async (ctx: Context) => {
  try {
    const eventname = ctx.params.eventname; // Obtenemos el nombre del evento desde los parámetros de la URL
    const event = await prisma.event.findFirst({
      where: { 
        title: { 
          contains: eventname, // Buscamos eventos cuyo título contenga el nombre del evento proporcionado
          mode: 'insensitive' // Hacemos la búsqueda insensible a mayúsculas y minúsculas
        } 
      },
      include: {
        tickets: true, // Incluimos los tickets asociados al evento
        venue: true // Incluimos el recinto asociado al evento
      }
    });

    if (!event) { // Si no se encuentra el evento, devolvemos un error 404 y un mensaje de que no se encontró
      ctx.response.status = 404;
      ctx.response.body = { error: "Event not found" };
      return;
    }

    ctx.response.body = event; // Si se encuentra, devolvemos los datos del evento en el cuerpo de la respuesta
  } catch (error) { // Si hay un error al buscar el evento, se captura y se devuelve un error 500
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Failed to fetch event",
      details: error.message
    };
  }
};

// Formatear el RUN para que tenga el formato correcto
function formatRUN(rawRun: string): string | null {
  // Quitar espacios y caracteres no numéricos, excepto 'k' o 'K'
  const clean = rawRun.replace(/[^0-9kK]/g, '');

  // Asegurarse de que el RUN tenga al menos 2 caracteres (número + dígito verificador)
  if (clean.length < 2) return null;

  const numberPart = clean.slice(0, -1); // Extraemos la parte numérica del RUN (todo menos el último carácter)
  const checkDigit = clean.slice(-1).toUpperCase(); // Extraemos el dígito verificador y lo convertimos a mayúsculas

  const reversed = numberPart.split('').reverse(); // Invertimos la parte numérica del RUN para formatearlo
  const chunks = []; // Creamos un array para almacenar los chunks de 3 dígitos
  for (let i = 0; i < reversed.length; i += 3) { // Iteramos sobre la parte numérica del RUN en pasos de 3
    // Tomamos 3 dígitos a la vez, los invertimos y los unimos para formar un chunk
    chunks.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  const formattedNumber = chunks.reverse().join('.'); // Unimos los chunks de 3 dígitos con un punto (.) para formar el número formateado

  return `${formattedNumber}-${checkDigit}`; // Retornamos el RUN formateado con el número y el dígito verificador
  // Ejemplo: "12345678-9" se convierte en "12.345.678-9"
}
// Obtener los tickets de un usuario por su RUN
export const getTicketsbyUserRUN = async (ctx: Context) => {
  try {
    const userRUN = ctx.params.RUN; // Tomamos el RUN del usuario de los parámetros de la URL
    const parsedRUN = formatRUN(userRUN); // Usamos la función para tener el RUN en el formato correcto
    console.log("RUN:", parsedRUN); // Para debugear, imprimimos el RUN formateado

    if (!parsedRUN) { // Si el RUN no es válido, devolvemos un error 400
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid RUN format" };
      return;
    }

    console.log("Searching for the tickets of the user with RUN:", parsedRUN); // Debug para ver que estamos buscando los tickets del usuario con el RUN correcto
    
    const user = await prisma.user.findFirst({ // Buscamos al usuario en la base de datos ocupando el RUN
      where: { RUN: parsedRUN }});
    const userID = user?.id; // Setteamos el ID del usuario encontrado
    const orders = await prisma.order.findMany({ // Buscamos las órdenes del usuario y ecluimos las órdenes que están pendientes o en reventa
      where: {
        userId: userID,
        NOT: {
          status: {
            in: ["pending", "reselling"]
          }
        }
      },
      include: { // Incluimos los items de la orden y los tickets asociados a cada item (y los datos del evento asociado a cada ticket)
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

    if (!orders) { // Si no se encuentran órdenes, devolvemos un error 404 con un mensaje de que no se encontraron tickets para el usuario con ese RUN
      ctx.response.status = 404;
      ctx.response.body = { 
        error: `Tickets for the user with RUN ${parsedRUN} have not found`,
      };
      return;
    }

    ctx.response.body = orders; // Si se encuentran órdenes, devolvemos las órdenes encontradas en el cuerpo de la respuesta
  } catch (error) { // Si hay un error al buscar los tickets, se captura y se devuelve un error 500
    console.error("Error fetching order list:", error); // Debug para ver si hay algún error al buscar los tickets
    ctx.response.status = 500;
    ctx.response.body = { // Devolvemos un error 500 con un mensaje de que hubo un error en el servidor
      error: "Server error",
      details: error.message
    };
  };
};
// Obtener los cupones de un usuario por su RUN
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
// Obtener los tickets en reventa
export const getResellingOrders = async (ctx: Context) => {
  try {
    const orders = await prisma.order.findMany({ // Buscamos las órdenes en la base de datos con el estado "reselling" y incluimos los datos del usuario y los items de la orden
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
    // Si no se encuentran órdenes, devolvemos un error 404 con un mensaje de que no se encontraron órdenes de reventa
    if (!orders || orders.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { message: "No reselling orders found" };
      return;
    }

    ctx.response.status = 200;
    // Mapeamos las órdenes para devolver solo la información necesaria, que sería el ID de la orden, los usuarios de los datos vendiendola, y los tickets de la orden con sus respectivos precios y cantidades
    // También incluimos los datos del evento asociado a cada ticket
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
  } catch (error) { // En caso de que haya un error al buscar las órdenes de reventa, se captura y se devuelve un error 500
    console.error("Error fetching reselling orders:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Failed to fetch reselling orders", 
      details: error.message 
    };
  }
};
// Procesar una compra de reventa
export const resellPurchaseOrder = async (ctx: Context) => {
  try {
    const body = ctx.request.body({ type: "json" }); // Obtenemos el cuerpo de la solicitud como JSON
    const { orderId, userId, total } = await body.value; // Desestructuramos el cuerpo para obtener los campos orderId, userId y total

    // Si algunos de los campos requeridos no están presentes, devolvemos un error 400
    if (!orderId || !userId || !total) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Faltan campos requeridos: orderId, userId o total" };
      return;
    }

    // Actualizamos la orden con el nuevo comprador
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        userId: parseInt(userId), // Aseguramos que el userId sea un número entero y lo seteamos
        total: total, // Seteamos el total de la orden
        status: "completed", // Seteamos el estado de la orden a "completed" indicando que la compra se ha completado
      },
    });

    ctx.response.status = 200;
    ctx.response.body = updatedOrder; // Devolvemos la orden actualizada en el cuerpo de la respuesta
  } catch (err) { // Si hay un error al procesar la compra de reventa, se captura y se devuelve un error 500
    console.error("Error en resellPurchaseOrder:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error interno al procesar la compra de reventa" };
  }
};