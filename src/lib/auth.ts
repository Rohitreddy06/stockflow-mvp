import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "stockflow_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export interface SessionUser {
  userId: string;
  email: string;
  orgId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a value at least 32 characters long.");
  }
  return secret;
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const verified: string | JwtPayload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof verified === "string" ||
      typeof verified.userId !== "string" ||
      typeof verified.email !== "string" ||
      typeof verified.orgId !== "string"
    ) {
      return null;
    }

    return {
      userId: verified.userId,
      email: verified.email,
      orgId: verified.orgId,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
}
