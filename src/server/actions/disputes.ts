"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { disputes, transactions, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const createDisputeSchema = z.object({
    transactionId: z.string().uuid(),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export async function createDispute(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const rawData = {
        transactionId: formData.get("transactionId"),
        reason: formData.get("reason"),
    };

    const parsed = createDisputeSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    const { transactionId, reason } = parsed.data;
    const userId = session.user.id;

    return await db.transaction(async (tx) => {
        // 1. Verify Transaction
        const [transaction] = await tx
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.id, transactionId),
                    eq(transactions.buyerId, userId)
                )
            );

        if (!transaction) return { success: false, error: "Transaction not found" };

        if (transaction.status === 'disputed') return { success: false, error: "Already disputed" };

        // 2. Create Dispute
        const newDispute: typeof disputes.$inferInsert = {
            id: randomUUID(),
            transactionId,
            reporterId: userId,
            reason,
            status: "open",
            createdAt: new Date(),
        };
        await tx.insert(disputes).values(newDispute);

        // 3. Update Transaction Status
        await tx
            .update(transactions)
            .set({ status: "disputed" })
            .where(eq(transactions.id, transactionId));

        // 4. Send Emails
        try {
            const { sendEmail } = await import("@/lib/mail");
            const { env } = await import("@/env");

            // Notify Admin
            await sendEmail({
                to: env.ADMIN_EMAIL,
                subject: `New Dispute: Transaction ${transactionId}`,
                html: `<h1>Dispute Opened</h1><p>Reason: ${reason}</p><p>Reporter: ${userId}</p>`
            });

            // Notify Seller
            const [seller] = await tx.select().from(users).where(eq(users.id, transaction.sellerId));
            if (seller && seller.email) {
                await sendEmail({
                    to: seller.email,
                    subject: "Dispute Opened on your Transaction",
                    html: `<h1>Action Required</h1><p>A dispute has been opened for transaction ${transactionId}.</p><p>Reason: ${reason}</p><p>Please check the dispute center.</p>`
                });
            }
        } catch (emailError) {
            console.error("Failed to send dispute emails:", emailError);
        }

        revalidatePath("/orders");
        revalidatePath("/disputes");
        return { success: true };
    });
}

export async function resolveDispute(disputeId: string, resolution: "refund_buyer" | "release_seller") {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Verify Admin
    const [admin] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!admin?.isAdmin) return { success: false, error: "Forbidden" };

    const adminId = admin.id;

    return await db.transaction(async (tx) => {
        const [dispute] = await tx
            .select()
            .from(disputes)
            .where(eq(disputes.id, disputeId));

        if (!dispute || dispute.status !== "open") return { success: false, error: "Invalid dispute" };

        const [transaction] = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, dispute.transactionId));

        if (!transaction) return { success: false, error: "Transaction not found" };

        if (resolution === "refund_buyer") {
            // Refund Buyer Logic
            // 1. Return money to buyer wallet
            await tx
                .update(users)
                .set({
                    walletBalance: sql`${users.walletBalance} + ${transaction.amount}` // Full amount? Or Net? Usually full amount to buyer.
                })
                .where(eq(users.id, transaction.buyerId));

            // 2. Update Transaction
            await tx
                .update(transactions)
                .set({ status: "refunded" })
                .where(eq(transactions.id, transaction.id));

        } else {
            // Release to Seller Logic
            // 1. Money goes to seller wallet (Net Amount)
            await tx
                .update(users)
                .set({
                    walletBalance: sql`${users.walletBalance} + ${transaction.netAmount}`
                })
                .where(eq(users.id, transaction.sellerId));

            // 2. Update Transaction
            await tx
                .update(transactions)
                .set({ status: "completed" }) // Finalized
                .where(eq(transactions.id, transaction.id));
        }

        // Close Dispute
        await tx
            .update(disputes)
            .set({
                status: "resolved",
                resolution: resolution,
                resolvedBy: adminId,
                resolvedAt: new Date(),
            })
            .where(eq(disputes.id, disputeId));

        // Send Resolution Emails
        try {
            const { sendEmail } = await import("@/lib/mail");
            const [buyer] = await tx.select().from(users).where(eq(users.id, transaction.buyerId));
            const [seller] = await tx.select().from(users).where(eq(users.id, transaction.sellerId));

            const subject = `Dispute Resolved: Transaction ${transaction.id}`;
            const message = `The dispute has been resolved with decision: <b>${resolution}</b>.`;

            if (buyer && buyer.email) {
                await sendEmail({ to: buyer.email, subject, html: `<h1>Dispute Resolved</h1><p>${message}</p>` });
            }
            if (seller && seller.email) {
                await sendEmail({ to: seller.email, subject, html: `<h1>Dispute Resolved</h1><p>${message}</p>` });
            }
        } catch (emailError) {
            console.error("Failed to send resolution emails:", emailError);
        }

        revalidatePath("/admin/disputes");
        return { success: true };
    });
}
