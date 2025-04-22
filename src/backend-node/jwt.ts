import { JWTPayload, jwtVerify, SignJWT } from 'https://deno.land/x/jose@v6.0.10/index.ts';
import { createSecretKey } from "node:crypto";
import process from "node:process";

const secret = createSecretKey(process.env.secretKey, 'utf-8');

interface UserPayload {
  userEmail: string;
  userPassword: string;
}


export async function generateToken({userEmail, userPassword}: UserPayload): Promise<string> {
  return await new SignJWT({userEmail, userPassword })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      console.log("JWT is valid:", payload);
      return payload;
    } catch (error) {
      console.error("Invalid JWT:", error);
      return null;
    }
  };