const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Convenience wrappers
export function rateLimitLogin(ip: string) {
  return rateLimit(`login:${ip}`, 5, 3600_000); // 5 per hour
}

export function rateLimitRegister(ip: string) {
  return rateLimit(`register:${ip}`, 3, 3600_000); // 3 per hour
}

export function rateLimitEmailResend(userId: string) {
  return rateLimit(`email-resend:${userId}`, 1, 300_000); // 1 per 5 min
}

export function rateLimitWithdrawal(userId: string) {
  return rateLimit(`withdrawal:${userId}`, 3, 3600_000); // 3 per hour
}
