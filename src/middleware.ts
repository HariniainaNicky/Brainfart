import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const postRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  prefix: "ratelimit:post",
});

const getRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "ratelimit:get",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";

  try {
    if (request.method === "POST" && pathname.startsWith("/api/")) {
      if (
        pathname.startsWith("/api/auth/") ||
        pathname.startsWith("/api/creation/") ||
        pathname.startsWith("/api/daily/") ||
        pathname.startsWith("/api/rooms") ||
        pathname.startsWith("/api/notifications")
      ) {
        const { success, limit, remaining, reset } = await postRatelimit.limit(ip);
        if (!success) {
          return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          });
        }
      }
    }

    if (request.method === "GET" && pathname.startsWith("/api/questions")) {
      const { success, limit, remaining, reset } = await getRatelimit.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    }
  } catch {
    // Fail open if Redis is down
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
