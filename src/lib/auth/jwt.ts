import { SignJWT, jwtVerify } from 'jose'

import { env } from '@/lib/env'
import type { JWTPayload } from './types'

const secret = new TextEncoder().encode(env.JWT_SECRET)

/**
 * Sign a JWT token with 1 hour expiration
 */
export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Token expires in 1 hour
    .sign(secret)
}

/**
 * Verify and decode a JWT token
 * @throws Error if token is invalid or expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
