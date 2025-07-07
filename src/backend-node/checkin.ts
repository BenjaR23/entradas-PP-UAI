import { Context } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import browser from "npm:@emailjs/browser";

import { PrismaClient } from "../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());



export const checkInOrderItem = async (ctx: Context) => {
  try {
    const {orderId, ticketId} = ctx.params; // Obtenemos los parámetros de la URL, que deberían ser el orderId y el ticketId



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

    console.log(`Checking in order item with Order ID: ${orderId} and Ticket ID: ${ticketId}`); // Debug para ver los IDs que se están utilizando


    const updatedItem = await prisma.orderItem.updateMany({ // Actualizamos el item de la orden
      where: { 
        orderId: parseInt(orderId),
        ticketId: parseInt(ticketId),
      },
      data: { IsCheckedIn: true }, // Tal que IsCheckedIn sea true
    });


    if (updatedItem.count === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "No matching order item found" };
      return;
    }

    console.log("Updated item", updatedItem)

    // Ahora buscamos el evento correspondiente al ticket para hacer el check de aforo
    const correspondingEvent = await prisma.ticket.findUnique({
      where: {id: parseInt(ticketId)}
    })
    const correspondingEventId = correspondingEvent?.eventId

    const event = await prisma.event.findUnique({ // Buscar evento en la base de datos donde el ID coincida con el ID dado del ticket
      where: { id: correspondingEventId },
      include: {
        tickets: true,
        venue: true
      }
    });

    const ticketIds = event?.tickets.map(ticket => ticket.id);


    const checkedIn = await prisma.orderItem.aggregate({ // Para conseguir la cantidad de tickets que han pasado por el check-in hacemos un aggregate
      where: { ticketId: { in: ticketIds }, IsCheckedIn: true }, // Donde el ticketId esté dentro de los IDs de tickets del evento y esté marcado como checked-in
      _sum: {
        quantity: true // Sumamos la cantidad de tickets
      }
    })

    const totalCheckedIn = checkedIn._sum.quantity ?? 0; // Si no hay tickets checked-in, se asigna 0, en otro caso se asigna la cantidad de tickets checked-in


    const totalCapacity = event?.tickets.reduce((sum, ticket) => {
      return sum + ticket.sold + ticket.stock; // Para encontrar la capacidad total, sumamos la cantidad de tickets vendidos y la cantidad de tickets en stock
    }, 0) ?? 0;
    const remainingTickets = totalCapacity ? totalCapacity - totalCheckedIn : 0;
    
    console.log("Total capacity", totalCapacity)
    console.log("Total checked in", totalCheckedIn)
    console.log("Remaining tickets", remainingTickets)
  
    if (remainingTickets == Math.floor(totalCapacity / 2) || remainingTickets == Math.floor(totalCapacity / 4)) {
      console.log("Enviando mail de advertencia a admins...")
      // Enviar correo de advertencia con emailjs en caso de que el aforo esté exactamente a la mitad o a un cuarto
      browser.init({publicKey: Deno.env.get('EMAIL_PUBLIC_KEY') || 'BLANK'}); // Inicializamos el cliente de emailjs con la clave pública
      const data = {
        service_id: Deno.env.get('EMAIL_SERVICE_ID') || 'BLANK', // Le indicamos el ID del servicio
        template_id: Deno.env.get('EMAIL_TEMPLATE_ID') || 'BLANK', // Le indicamos el ID de la plantilla para los correos de aforo
        template_params: {
          'eventname': event?.title, // Le pasamos el nombre del evento para el correo
          'usersRemaining': remainingTickets, // Le pasamos la cantidad de tickets restantes para el correo
        }
      }
      await browser.send(data.service_id, data.template_id, data.template_params); // Enviamos el correo
      console.log("Mail de advertencia enviado") // Debug para ver si se ha enviado el correo
    }
    ctx.response.status = 200;
    ctx.response.body = { success: true, updatedItem }; // Enviamos una respuesta de éxito con el item actualizado
  } catch (error) { // En caso de error, se captura y se envía un mensaje de error
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al hacer check-in del ticket." };
  }
};
