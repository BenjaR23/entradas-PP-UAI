import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { withAccelerate } from "npm:@prisma/extension-accelerate";
import crypto from "node:crypto";
import { generateToken } from "./jwt.ts";

const prisma = new PrismaClient().$extends(withAccelerate());

export const registerUser = async (ctx: any) => {
  const { name, email, password, RUN, role } = await ctx.request.body().value;

  // Verificar si ya existe un usuario con ese email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    ctx.response.status = 409;
    ctx.response.body = {
      status: "error",
      message: "Email already registered",
    };
    return;
  }

  // Generar un salt aleatorio
  const salt = crypto.randomBytes(16).toString("hex");

  // Generar el hash de la contraseña con el salt
  const saltedPass = password + salt;
  const hashedPass = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(saltedPass));
  const hashedPassHex = Array.from(new Uint8Array(hashedPass))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Guardar el nuevo usuario en la base de datos
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      RUN,
      role: role || "user",
      passwordSalt: salt,
      passwordHash: hashedPassHex,
    },
  });

  // Generar token automáticamente
  const token = await generateToken({
    userEmail: newUser.email,
    userName: newUser.name,
    userId: newUser.id,
    userRole: newUser.role,
    timeGenerated: new Date(),
    userRUN: newUser.RUN
  });

  ctx.response.status = 201;
  ctx.response.body = {
    status: "success",
    message: "User registered successfully",
    userId: newUser.id,
    UserFullName: newUser.name,
    userToken: token,
  };
};
