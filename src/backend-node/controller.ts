//route logic
import { PrismaClient } from "../../generated/client/deno/edge.ts"
import { withAccelerate } from "npm:@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate())

export const getUsers = async (ctx: any) => {
  const users = await prisma.user.findMany()
  ctx.response.body = users
}

export const getEvents = async (ctx: any) => {
  const events = await prisma.event.findMany()
  ctx.response.body = events
}
