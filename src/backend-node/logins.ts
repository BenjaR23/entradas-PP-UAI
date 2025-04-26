import { PrismaClient } from "../../generated/client/deno/edge.ts"
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { generateToken } from "./jwt.ts";
import crypto from "node:crypto";

const prisma = new PrismaClient().$extends(withAccelerate())

export const compareLogins = async (ctx: any) => {
    const { username, password } = await ctx.request.body().value;
    const user = await prisma.user.findFirst({
        where: {
            email: username,
        }
    })
    if (user) {
        const saltedPass = password + user.passwordSalt;
        const hashedPass = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(saltedPass));
        const hashedPassHex = Array.from(new Uint8Array(hashedPass)).map(b => b.toString(16).padStart(2, '0')).join('');
        if (hashedPassHex === user.passwordHash) {
            const token = await generateToken({ userEmail: user.email, userName: user.name, userId: user.id, userRole: user.role, timeGenerated: new Date() });
            ctx.response.body = {
                status: "success",
                message: "Login successful",
                UserFullName: user.name,
                userToken: token,
            };
        }
        else {
            ctx.response.body = {
                status: "error",
                message: "Invalid password",
            };
        }
    }
    else {
        ctx.response.body = {
            status: "error",
            message: "User not found",
        };
    }
}