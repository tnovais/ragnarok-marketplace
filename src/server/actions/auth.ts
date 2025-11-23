"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/mail";
import { WelcomeEmail } from "@/emails/welcome";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export interface RegisterState {
    success: boolean;
    error?: {
        root?: string[];
        name?: string[];
        email?: string[];
        password?: string[];
        [key: string]: string[] | undefined;
    };
}

export async function register(prevState: any, formData: FormData): Promise<RegisterState> {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        return {
            error: { ...fieldErrors, root: undefined },
            success: false
        };
    }

    const { name, email, password } = parsed.data;

    try {
        // Check if user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (existingUser) {
            return { error: { email: ["Email already registered"] }, success: false };
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user
        await db.insert(users).values({
            id: randomUUID(),
            name,
            email,
            password: hashedPassword,
            emailVerified: null, // Explicitly null until verified
        });

        // TODO: Send verification email here

        return { success: true, error: {} };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: { root: ["Failed to create account. Please try again."] }, success: false };
    }
}
