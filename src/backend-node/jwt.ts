import { JWTPayload, jwtVerify, SignJWT } from 'https://deno.land/x/jose@v6.0.10/index.ts';
import { createSecretKey } from "node:crypto";
import process from "node:process";

const secret = createSecretKey(process.env.secretKey, 'utf-8');

interface UserPayload {
  userEmail: string;
  userName: string;
  userId: any;
  userRole: string;
  timeGenerated: Date; 
}

// ✅ Generar token
export async function generateToken(payload: UserPayload): Promise<string> {
  const { userEmail, userName, userId, userRole, timeGenerated } = payload;
  if (!userEmail || !userName || !userId || !userRole || !timeGenerated) {
    throw new Error("Missing required user information to generate token.");
  }
  return await new SignJWT({ userEmail, userName, userId, userRole, timeGenerated: timeGenerated.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

// ✅ Verificar token
export const verifyToken = async (ctx: any) => {
  const authHeader = ctx.request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido o no enviado" };
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, secret);
    ctx.state.user = payload; // guardamos el payload por si lo necesitas después
    ctx.response.status = 200;
    ctx.response.body = { items: payload, status: "success" };
  } catch (err) {
    console.error(err);
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido" };
  }
};
