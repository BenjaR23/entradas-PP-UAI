import { JWTPayload, jwtVerify, SignJWT } from 'https://deno.land/x/jose@v6.0.10/index.ts'; // Importamos las funciones de jose necesarias para manejar la creación y verificación de JWT
import { createSecretKey } from "node:crypto"; // Importamos createSecretKey para manejar la clave secreta de forma segura
import process from "node:process"; // Importamos process para acceder a las variables de entorno

const secret = createSecretKey(process.env.secretKey, 'utf-8'); // Creamos una clave secreta a partir de la variable de entorno

// Definimos la interfaz para el payload del token
interface UserPayload {
  userEmail: string;
  userName: string;
  userId: any;
  userRole: string;
  timeGenerated: Date; 
  userRUN: string;
}

// Generamos el token JWT a partir del payload proporcionado
// Esta función toma un objeto que contiene la información del usuario en el payload UserPayload y genera un token JWT firmado con la clave secreta
export async function generateToken(payload: UserPayload): Promise<string> {
  const { userEmail, userName, userId, userRole, timeGenerated, userRUN } = payload;
  if (!userEmail || !userName || !userId || !userRole || !timeGenerated || !userRUN) {
    throw new Error("Missing required user information to generate token."); // Si falta algún campo requerido, lanzamos un error
  }
  return await new SignJWT({ userEmail, userName, userId, userRole, timeGenerated: timeGenerated.toISOString(), userRUN }) // Creamos un nuevo JWT con el payload proporcionado
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Establecemos el tiempo de expiración del token a 2 horas
    .sign(secret); // Firmamos el token con la clave secreta
}

export const verifyToken = async (ctx: any) =>{
  // Verificamos el token JWT recibido en la solicitud
  const tokenbody = await ctx.request.body().value; // Obtenemos el cuerpo de la solicitud, que debe contener el token
  const tokenstring = tokenbody.token; // Extraemos el token del cuerpo de la solicitud
  const { payload } = await jwtVerify(tokenstring, secret); // Verificamos el token usando la clave secreta y obtenemos el payload
  ctx.response.body = {items: payload, status: "success"}; // Devolvemos el payload con los datos del token como respuesta
  ctx.response.status = 200;
  ctx.response.message = "Token is valid"; // Mensaje de éxito indicando que el token es válido
}
