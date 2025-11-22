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
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function register(formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
        redirect("/register?error=Invalid data");
    }

    const { name, email, password } = parsed.data;

    // Check if user exists
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (existingUser) {
        redirect("/register?error=User already exists");
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    await db.insert(users).values({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
    });

    // Send welcome email
    /*
    try {
        await sendEmail({
            to: email,
            subject: "Welcome to Ragnarok TradeHub!",
            html: `<h1>Welcome, ${name}!</h1><p>Thank you for joining Ragnarok TradeHub.</p>`,
        });
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }
    */

    redirect("/login");
}
