import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type Bucket = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, Bucket>()

const emailSchema = z.string().email().max(320).transform((value) => value.trim().toLowerCase())
const loginPasswordSchema = z.string().min(1).max(128)
const passwordSchema = z.string().min(8).max(128)
const resetTokenSchema = z.string().min(32).max(256).regex(/^[a-fA-F0-9]+$/)

export const loginBodySchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
})

export const resetPasswordConfirmSchema = z.object({
  token: resetTokenSchema,
  newPassword: passwordSchema,
})

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

export function checkRateLimit(key: string, windowMs: number, maxAttempts: number): RateLimitResult {
  const now = Date.now()
  const bucket = rateLimitStore.get(key)

  if (!bucket || now > bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) }
  }

  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  rateLimitStore.set(key, bucket)

  return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
}

export function tooManyRequestsResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Trop de tentatives. Réessayez plus tard." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  )
}
