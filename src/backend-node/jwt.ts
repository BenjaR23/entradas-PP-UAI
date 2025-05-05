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
  userRUN: string;
}

// ✅ Generar token
export async function generateToken(payload: UserPayload): Promise<string> {
  const { userEmail, userName, userId, userRole, timeGenerated, userRUN } = payload;
  if (!userEmail || !userName || !userId || !userRole || !timeGenerated || !userRUN) {
    throw new Error("Missing required user information to generate token.");
  }
  return await new SignJWT({ userEmail, userName, userId, userRole, timeGenerated: timeGenerated.toISOString(), userRUN })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export const verifyToken = async (ctx: any) =>{

  const tokenbody = await ctx.request.body().value;
  const tokenstring = tokenbody.token;
  const { payload } = await jwtVerify(tokenstring, secret);
  ctx.response.body = {items: payload, status: "success"};
  ctx.response.status = 200;
  ctx.response.message = "Token is valid";
}
