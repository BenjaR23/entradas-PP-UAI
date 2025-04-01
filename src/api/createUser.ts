import { prisma } from '../client.ts';

export async function createUser(email: string, name?: string) {
  return await prisma.user.create({
    data: {
      email,
      name,
    },
  });
}