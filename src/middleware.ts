import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis and Ratelimit only if env vars are present
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// Create a new ratelimiter, that allows 20 requests per 10 seconds
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "10 s"),
        analytics: true,
    })
    : null;

export async function middleware(request: NextRequest) {
    // Skip rate limiting if Redis is not configured (e.g. local dev without env vars)
    if (!ratelimit) {
        return NextResponse.next();
    }

    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new NextResponse("Too Many Requests", { status: 429 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
