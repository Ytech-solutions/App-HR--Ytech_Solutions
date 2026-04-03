import { NextRequest, NextResponse } from "next/server"
import { normalizeRole } from "@/lib/iam"

type SessionPayload = {
  role?: "ADMIN" | "RH" | "EMPLOYE" | "IT" | "CEO"
}

type RateLimitRule = {
  windowMs: number
  maxRequests: number
}

type AccessRule = {
  pathPrefix: string
  methods: Record<string, Array<"ADMIN" | "RH" | "EMPLOYE">>
}

type Bucket = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, Bucket>()

const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/reset-password",
  "/api/auth/session",
]

const RATE_LIMIT_RULES: Array<{ pathPrefix: string; methods?: string[]; rule: RateLimitRule }> = [
  { pathPrefix: "/api/auth/login", methods: ["POST"], rule: { windowMs: 15 * 60 * 1000, maxRequests: 8 } },
  { pathPrefix: "/api/auth/reset-password", methods: ["POST"], rule: { windowMs: 15 * 60 * 1000, maxRequests: 5 } },
  { pathPrefix: "/api/auth/reset-password", methods: ["PUT"], rule: { windowMs: 15 * 60 * 1000, maxRequests: 10 } },
  { pathPrefix: "/api/accounts", rule: { windowMs: 60 * 1000, maxRequests: 60 } },
  { pathPrefix: "/api/employees", rule: { windowMs: 60 * 1000, maxRequests: 120 } },
  { pathPrefix: "/api/departments", rule: { windowMs: 60 * 1000, maxRequests: 120 } },
]

const ACCESS_RULES: AccessRule[] = [
  {
    pathPrefix: "/api/accounts",
    methods: {
      GET: ["ADMIN", "RH"],
      POST: ["ADMIN"],
      PUT: ["ADMIN"],
      PATCH: ["ADMIN"],
      DELETE: ["ADMIN"],
    },
  },
  {
    pathPrefix: "/api/employees",
    methods: {
      GET: ["ADMIN", "RH", "EMPLOYE"],
      POST: ["ADMIN", "RH"],
      PUT: ["ADMIN", "RH"],
      DELETE: ["ADMIN"],
    },
  },
  {
    pathPrefix: "/api/departments",
    methods: {
      GET: ["ADMIN", "RH", "EMPLOYE"],
      POST: ["ADMIN", "RH"],
    },
  },
  {
    pathPrefix: "/api/auth/change-password",
    methods: {
      GET: ["ADMIN", "RH", "EMPLOYE"],
      POST: ["ADMIN", "RH", "EMPLOYE"],
    },
  },
  {
    pathPrefix: "/api/auth/me",
    methods: {
      GET: ["ADMIN", "RH", "EMPLOYE"],
    },
  },
  {
    pathPrefix: "/api/auth/logout",
    methods: {
      POST: ["ADMIN", "RH", "EMPLOYE"],
    },
  },
]

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }
  return request.headers.get("x-real-ip") || "unknown"
}

function getRateLimitRule(pathname: string, method: string): RateLimitRule | null {
  const matched = RATE_LIMIT_RULES.find(
    (entry) =>
      pathname.startsWith(entry.pathPrefix) &&
      (!entry.methods || entry.methods.includes(method))
  )
  return matched?.rule || null
}

function hitRateLimit(key: string, rule: RateLimitRule): { blocked: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs })
    return { blocked: false, retryAfterSeconds: Math.ceil(rule.windowMs / 1000) }
  }

  if (current.count >= rule.maxRequests) {
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  rateLimitStore.set(key, current)
  return { blocked: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function parseSessionRole(request: NextRequest): "ADMIN" | "RH" | "EMPLOYE" | null {
  const raw = request.cookies.get("session")?.value
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as SessionPayload
    return parsed.role ? normalizeRole(parsed.role) : null
  } catch {
    return null
  }
}

function isRoleAuthorized(pathname: string, method: string, role: "ADMIN" | "RH" | "EMPLOYE"): boolean {
  const accessRule = ACCESS_RULES.find((entry) => pathname.startsWith(entry.pathPrefix))
  if (!accessRule) {
    // Secure-by-default for any protected API endpoint not explicitly mapped.
    return role === "ADMIN"
  }

  const allowedRoles = accessRule.methods[method]
  if (!allowedRoles) {
    return false
  }
  return allowedRoles.includes(role)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const rateRule = getRateLimitRule(pathname, method)
  if (rateRule) {
    const rateKey = `${ip}:${method}:${pathname}`
    const hit = hitRateLimit(rateKey, rateRule)
    if (hit.blocked) {
      return NextResponse.json(
        { error: "Trop de requetes. Reessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(hit.retryAfterSeconds) } }
      )
    }
  }

  if (isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  const role = parseSessionRole(request)
  if (!role) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
  }

  if (!isRoleAuthorized(pathname, method, role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
