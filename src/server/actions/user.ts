"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    image: z.string().url().optional(),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, "Invalid CPF format").optional(),
});

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateUserSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    try {
        const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

        if (!user) return { error: "User not found" };

        const updateData: any = {
            name: parsed.data.name,
            image: parsed.data.image,
            updatedAt: new Date(),
        };

        // CPF Logic: Write-once
        if (parsed.data.cpf) {
            if (user.cpf) {
                // User already has CPF, prevent update
                if (user.cpf !== parsed.data.cpf) {
                    return { error: "CPF cannot be changed once registered." };
                }
            } else {
                // First time registration
                // Check uniqueness
                const [existing] = await db.select().from(users).where(eq(users.cpf, parsed.data.cpf));
                if (existing) {
                    return { error: "CPF already in use." };
                }
                updateData.cpf = parsed.data.cpf;
            }
        }

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, session.user.id));

        revalidatePath("/profile");
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { error: "Failed to update profile" };
    }
}

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: { root: ["Unauthorized"] } };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updatePasswordSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id));

        if (!user || !user.password) {
            return { error: { root: ["User not found or no password set"] } };
        }

        // Verify current password
        const { compare, hash } = await import("bcryptjs");
        const isValid = await compare(currentPassword, user.password);

        if (!isValid) {
            return { error: { currentPassword: ["Incorrect password"] } };
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        return { error: { root: ["Failed to update password"] } };
    }
}

export async function getUserWallet() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const [user] = await db
        .select({ walletBalance: users.walletBalance })
        .from(users)
        .where(eq(users.id, session.user.id));

    return user?.walletBalance || "0.00";
}
