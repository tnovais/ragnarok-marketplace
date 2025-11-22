"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const withdrawalSchema = z.object({
    amount: z.number().min(10, "Minimum withdrawal is R$ 10.00"),
    pixKey: z.string().min(5, "Invalid PIX key"),
    pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, "Invalid CPF format (000.000.000-00)"),
});

export async function requestWithdrawal(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        amount: Number(formData.get("amount")),
        pixKey: formData.get("pixKey"),
        pixKeyType: formData.get("pixKeyType"),
        cpf: formData.get("cpf"),
    };

    const parsed = withdrawalSchema.safeParse(rawData);
    if (!parsed.success) {
        return { error: parsed.error.errors[0].message };
    }

    const { amount, pixKey, pixKeyType, cpf } = parsed.data;

    const userId = session.user.id;

    return await db.transaction(async (tx) => {
        // 1. Fetch User with lock (if possible, but here just fetch)
        const [user] = await tx
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) return { error: "User not found" };

        // 2. CPF Validation / Locking Logic
        if (user.cpf) {
            // User already has a CPF registered.
            // We must ensure the provided CPF matches the registered one.
            if (user.cpf !== cpf) {
                return { error: "The provided CPF does not match the registered CPF for this account." };
            }
        } else {
            // First time withdrawal: Lock the account to this CPF.
            // Check if this CPF is already used by another account (Unique constraint handles this, but good to check)
            const [existingCpf] = await tx
                .select()
                .from(users)
                .where(eq(users.cpf, cpf));

            if (existingCpf) {
                return { error: "This CPF is already linked to another account." };
            }

            await tx
                .update(users)
                .set({ cpf: cpf })
                .where(eq(users.id, user.id));

            // Send CPF Registration Notification
            try {
                const { sendEmail } = await import("@/lib/mail");
                if (user.email) {
                    await sendEmail({
                        to: user.email,
                        subject: "Security Alert: CPF Registered",
                        html: `<h1>CPF Registered</h1><p>A CPF (${cpf}) was just linked to your account.</p><p>If this wasn't you, please contact support immediately.</p>`
                    });
                }
            } catch (emailError) {
                console.error("Failed to send CPF notification:", emailError);
            }
        }

        // 3. Check Balance
        const currentBalance = Number(user.walletBalance);
        if (currentBalance < amount) {
            return { error: "Insufficient funds" };
        }

        // 4. Create Withdrawal Request
        await tx.insert(withdrawals).values({
            id: randomUUID(),
            userId: user.id,
            amount: amount.toFixed(2),
            bankAccount: "PIX", // Simplified for now
            pixKey: pixKey,
            status: "pending",
            createdAt: new Date(),
        });

        // 5. Deduct Balance
        await tx
            .update(users)
            .set({
                walletBalance: sql`${users.walletBalance} - ${amount.toFixed(2)}`,
            })
            .where(eq(users.id, user.id));

        // 6. Send Email
        try {
            const { sendEmail } = await import("@/lib/mail");
            if (user.email) {
                await sendEmail({
                    to: user.email,
                    subject: "Withdrawal Request Received",
                    html: `<h1>Withdrawal Requested</h1><p>Amount: R$ ${amount.toFixed(2)}</p><p>PIX Key: ${pixKey}</p><p>We will process this shortly.</p>`
                });
            }
        } catch (emailError) {
            console.error("Failed to send withdrawal email:", emailError);
        }

        revalidatePath("/profile");
        return { success: true };
    });
}
