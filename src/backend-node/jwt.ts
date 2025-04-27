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

// ✅ Verificar token (CORREGIDO)
export const verifyToken = async (ctx: any) => {
  const authHeader = ctx.request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Authorization header faltante o mal formado");
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, secret);
    ctx.state.user = payload; // opcional si quieres guardarlo en el contexto
    return payload;
  } catch (err) {
    console.error("Error verificando token:", err);
    return null;
  }
};
