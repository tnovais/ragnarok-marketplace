"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { deposits, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createPreference } from "@/lib/payment";
import { z } from "zod";

const depositSchema = z.object({
    amount: z.number().min(5, "Minimum deposit is R$ 5.00"),
});

export async function createDeposit(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const rawAmount = formData.get("amount");
    const amount = Number(rawAmount);

    const parsed = depositSchema.safeParse({ amount });

    if (!parsed.success) {
        return { error: parsed.error.errors[0].message };
    }

    try {
        // 1. Check if user has CPF
        const [user] = await db.select({ cpf: users.cpf }).from(users).where(eq(users.id, session.user.id));
        if (!user?.cpf) {
            return { error: "You must register your CPF in Settings before depositing." };
        }

        // 2. Create Mercado Pago Preference
        const transactionId = randomUUID();
        const payment = await createPreference({
            id: transactionId,
            title: "Wallet Deposit - Ragnarok TradeHub",
            price: amount,
        });

        // 3. Create Deposit Record
        await db.insert(deposits).values({
            id: transactionId,
            userId: session.user.id,
            amount: amount.toFixed(2),
            status: "pending",
            paymentId: payment.id,
            qrCode: payment.init_point, // Storing URL here for simplicity, or fetch QR later
            createdAt: new Date(),
        });

        return { success: true, url: payment.init_point };
    } catch (error) {
        console.error("Deposit failed:", error);
        return { error: "Failed to create deposit" };
    }
}
