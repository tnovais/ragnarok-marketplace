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
        await db
            .update(users)
            .set({
                ...parsed.data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { error: "Failed to update profile" };
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
