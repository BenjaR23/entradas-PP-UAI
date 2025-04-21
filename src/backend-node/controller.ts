//route logic
import { PrismaClient } from "../../generated/client/deno/edge.ts"

const prisma = new PrismaClient()

export const getUsers = async (ctx: any) => {
  const users = await prisma.user.findMany()
  ctx.response.body = users
}

export const getEvents = async (ctx: any) => {
  const events = await prisma.event.findMany()
  ctx.response.body = events
}
