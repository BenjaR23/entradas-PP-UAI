/// <reference lib="deno.ns" />
import {
    assert,
    assertMatch,
    assertRejects,
  } from "https://deno.land/std@0.224.0/assert/mod.ts";
  import { generateToken } from "./jwt.ts";
  
  Deno.test("generateToken returns a valid JWT string", async () => {
    const mockPayload = {
      userEmail: "test@example.com",
      userName: "Test User",
      userId: "123",
      userRole: "attendee",
      timeGenerated: new Date(),
      userRUN: "12345678-9",
    };
  
    const token = await generateToken(mockPayload);
  
    // Verifica que el token fue generado
    assert(token);
  
    // Verifica que tiene formato de JWT (tres bloques separados por punto)
    assertMatch(
      token,
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      "Token does not match JWT format",
    );
  
    // Verifica que el token tenga una longitud considerable
    assert(token.length > 100, "Token should be longer than 100 characters");
  });
  
  Deno.test("generateToken throws error if payload is incomplete", async () => {
    const incompletePayload = {
      userEmail: "test@example.com",
      userName: "Test User",
      // Falta userId, userRole, timeGenerated, userRUN
    } as any;
  
    await assertRejects(
      () => generateToken(incompletePayload),
      Error,
      "Missing required user information to generate token.",
    );
  });
  

