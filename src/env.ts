import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    MP_ACCESS_TOKEN: z.string().min(1).optional(), // Optional for dev
    NEXTAUTH_URL: z.string().url().optional().or(z.literal('')),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SOCKET_URL: z.string().url().optional().or(z.literal('')),
    MEILI_HOST: z.string().url().optional().or(z.literal('')),
    MEILI_MASTER_KEY: z.string().optional(),
    REDIS_URL: z.string().url().optional().or(z.literal('')),
    NEXT_PUBLIC_SOCKET_URL: z.string().url().default("http://localhost:3001"),
    ADMIN_EMAIL: z.string().email().default("admin@ragnaroktradehub.com"),
    EMAIL_FROM: z.string().default("Ragnarok TradeHub <noreply@ragnaroktradehub.com>"),
    GOOGLE_CLIENT_ID: z.string().optional().or(z.literal('')),
    GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal('')),
    UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal('')),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal('')),
    MYSQL_ROOT_PASSWORD: z.string().default("password"),
});

export const env = envSchema.parse(process.env);
