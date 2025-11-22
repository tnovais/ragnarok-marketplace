import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for demonstration/local dev
// In production, use Redis (e.g., Upstash)
const rateLimit = new Map();

export function middleware(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = 100; // Requests per minute
    const windowMs = 60 * 1000;

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 0, startTime: Date.now() });
    }

    const data = rateLimit.get(ip);
    const now = Date.now();

    if (now - data.startTime > windowMs) {
        data.count = 0;
        data.startTime = now;
    }

    data.count++;

    if (data.count > limit) {
        return new NextResponse("Too Many Requests", { status: 429 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
