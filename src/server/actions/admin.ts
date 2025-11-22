"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Middleware check helper (in real app use middleware or HOC)
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user?.isAdmin) throw new Error("Forbidden");

    return user;
}

export async function approveWithdrawal(withdrawalId: string) {
    try {
        await checkAdmin();

        await db
            .update(withdrawals)
            .set({
                status: "completed",
                processedAt: new Date()
            })
            .where(eq(withdrawals.id, withdrawalId));

        revalidatePath("/admin/withdrawals");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function rejectWithdrawal(withdrawalId: string) {
    try {
        await checkAdmin();

        // Transaction to refund balance and mark rejected
        await db.transaction(async (tx) => {
            const [withdrawal] = await tx
                .select()
                .from(withdrawals)
                .where(eq(withdrawals.id, withdrawalId));

            if (!withdrawal || withdrawal.status !== "pending") {
                throw new Error("Invalid withdrawal");
            }

            // Refund user
            await tx
                .update(users)
                .set({
                    walletBalance: sql`${users.walletBalance} + ${withdrawal.amount}`
                })
                .where(eq(users.id, withdrawal.userId));

            // Mark rejected
            await tx
                .update(withdrawals)
                .set({
                    status: "rejected",
                    processedAt: new Date()
                })
                .where(eq(withdrawals.id, withdrawalId));
        });

        revalidatePath("/admin/withdrawals");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
