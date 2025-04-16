// deno-lint-ignore-file no-explicit-any
import { prisma } from '../client.ts';

export const createUser = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value
    const { name, email, passwordHash, role } = body
  
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
    })
  
    ctx.response.body = user
  }

export const createVenue = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value
    const { name, address, city, country, capacity } = body
  
    const venue = await prisma.venue.create({
      data: { name, address, city, country, capacity },
    })
  
    ctx.response.body = venue
  }

export const createEvent = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value
    const { title, description, venueId, categoryId, category, eventDate, status } = body
  
    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        status: status ?? 'active',
        categoryId,
        category,  // Directly using the string value
        venue: {
          connect: { id: venueId },
        },
      },
      include: {
        venue: true,
      }
    })
  
    ctx.response.body = event
  }
  
  
export const createTicket = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value
    const { eventId, type, price, stock } = body
  
    const ticket = await prisma.ticket.create({
      data: { eventId, type, price, stock },
    })
  
    ctx.response.body = ticket
  }
  
export const createOrder = async (ctx: any) => {
    const body = await ctx.request.body({ type: "json" }).value
    const { userId, items } = body // items: [{ ticketId, quantity, priceEach }]
    
    const total = items.reduce((acc: number, item: any) =>
      acc + item.quantity * parseFloat(item.priceEach), 0)
  
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((item: any) => ({
            ticketId: item.ticketId,
            quantity: item.quantity,
            priceEach: item.priceEach,
          }))
        }
      },
      include: {
        items: true
      }
    })
  
    ctx.response.body = order
  }