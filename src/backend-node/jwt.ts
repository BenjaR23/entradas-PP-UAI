import {
  JWTPayload,
  jwtVerify,
  SignJWT,
} from "https://deno.land/x/jose@v6.0.10/index.ts";

import process from "node:process";

// ⚡️ Usa TextEncoder en lugar de createSecretKey
function getSecretKey(): Uint8Array {
  const raw = process.env.secretKey;
  if (!raw) throw new Error("Missing secretKey in environment variables.");
  return new TextEncoder().encode(raw);
}

const secret = getSecretKey();

interface UserPayload {
  userEmail: string;
  userName: string;
  userId: any;
  userRole: string;
  timeGenerated: Date;
  userRUN: string;
}

export async function generateToken(payload: UserPayload): Promise<string> {
  const {
    userEmail,
    userName,
    userId,
    userRole,
    timeGenerated,
    userRUN,
  } = payload;

  if (
    !userEmail ||
    !userName ||
    !userId ||
    !userRole ||
    !timeGenerated ||
    !userRUN
  ) {
    throw new Error("Missing required user information to generate token.");
  }

  return await new SignJWT({
    userEmail,
    userName,
    userId,
    userRole,
    timeGenerated: timeGenerated.toISOString(),
    userRUN,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret); // ✅ Ahora es un Uint8Array compatible
}

export const verifyToken = async (ctx: any) => {
  const tokenbody = await ctx.request.body().value;
  const tokenstring = tokenbody.token;

  // ✅ jose espera un Uint8Array
  const { payload } = await jwtVerify(tokenstring, secret, {
    algorithms: ["HS256"], // Buen hábito: siempre especificar el algoritmo
  });

  ctx.response.body = { items: payload, status: "success" };
  ctx.response.status = 200;
  ctx.response.message = "Token is valid";
};
