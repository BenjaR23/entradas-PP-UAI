import { prisma } from "../client.ts";  

export const getUsers = async (ctx: any) => {
    try {
        const users = await prisma.user.findMany();
        ctx.response.status = 200;
        ctx.response.body = users;  
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch users" };
    }
};

    


