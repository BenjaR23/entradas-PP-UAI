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