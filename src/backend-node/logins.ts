import { PrismaClient } from "../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import { generateToken } from "./jwt.ts";
import crypto from "node:crypto";

const prisma = new PrismaClient().$extends(withAccelerate());

export const compareLogins = async (ctx: any) => {
  const { username, password } = await ctx.request.body().value;

  // Verificar si el usuario existe en la base de datos
  const user = await prisma.user.findFirst({
    where: {
      email: username,
    },
  });

  // Si el usuario no existe
  if (!user) {
    ctx.response.status = 404;
    ctx.response.body = {
      status: "error",
      message: "User not found",
    };
    return;
  }

  // Generar el hash de la contraseña con la sal
  const saltedPass = password + user.passwordSalt;
  const hashedPass = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(saltedPass));
  const hashedPassHex = Array.from(new Uint8Array(hashedPass))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Verificar si la contraseña coincide
  if (hashedPassHex === user.passwordHash) {
    // Si la contraseña es válida, generar un token
    const token = await generateToken({
      userEmail: user.email,
      userName: user.name,
      userId: user.id,
      userRole: user.role,
      timeGenerated: new Date(),
      userRUN: user.RUN
    });

    // Responder con éxito y el token
    ctx.response.status = 200;
    ctx.response.body = {
      status: "success",
      message: "Login successful",
      userId: user.id,
      UserFullName: user.name,
      userToken: token,
    };
  } else {
    // Si la contraseña es incorrecta
    ctx.response.status = 401;
    ctx.response.body = {
      status: "error",
      message: "Invalid password",
    };
  }
};
