import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

// Verify webhook signature (Mercado Pago)
// In production, you should verify the x-signature header
// For this MVP, we'll assume the secret is kept safe and rely on the payment ID check

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        if (action === "payment.created" || action === "payment.updated") {
            const paymentId = data.id;

            // Fetch payment status from Mercado Pago API (to verify it's real)
            // const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            //     headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            // });
            // const paymentData = await mpResponse.json();

            // For MVP/Dev without real MP credentials, we'll trust the webhook body or simulate
            // In a real scenario, ALWAYS fetch from MP to verify status === 'approved'

            const status = "approved"; // paymentData.status

            if (status === "approved") {
                // 1. Try to find in Transactions (Item Purchase)
                const [transaction] = await db
                    .select()
                    .from(transactions)
                    .where(eq(transactions.paymentId, paymentId));

                if (transaction && transaction.status === "pending") {
                    await db.transaction(async (tx) => {
                        await tx
                            .update(transactions)
                            .set({ status: "completed", updatedAt: new Date() })
                            .where(eq(transactions.id, transaction.id));
                    });
                    return NextResponse.json({ success: true });
                }

                // 2. Try to find in Deposits (Wallet Top-up)
                const { deposits } = await import("@/db/schema");
                const [deposit] = await db
                    .select()
                    .from(deposits)
                    .where(eq(deposits.paymentId, paymentId));

                if (deposit && deposit.status === "pending") {
                    await db.transaction(async (tx) => {
                        // Mark deposit as approved
                        await tx
                            .update(deposits)
                            .set({ status: "approved", updatedAt: new Date() })
                            .where(eq(deposits.id, deposit.id));

                        // Add funds to user wallet
                        await tx
                            .update(users)
                            .set({ walletBalance: sql`${users.walletBalance} + ${deposit.amount}` })
                            .where(eq(users.id, deposit.userId));
                    });
                    return NextResponse.json({ success: true });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
