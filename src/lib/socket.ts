import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";
import { env } from "@/env";

// Global client to prevent multiple connections in dev (Next.js hot reload)
const globalForRedis = global as unknown as { redisClient: ReturnType<typeof createClient> | undefined };

const redisClient = globalForRedis.redisClient ?? createClient({ url: env.REDIS_URL });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redisClient = redisClient;
}

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}

const io = new Emitter(redisClient);

export const emitEvent = (room: string, event: string, data: any) => {
    try {
        io.to(room).emit(event, data);
    } catch (error) {
        console.error("Failed to emit socket event:", error);
    }
};
