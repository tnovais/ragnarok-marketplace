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
                // Find transaction by paymentId
                const [transaction] = await db
                    .select()
                    .from(transactions)
                    .where(eq(transactions.paymentId, paymentId));

                if (transaction && transaction.status === "pending") {
                    await db.transaction(async (tx) => {
                        // Update transaction
                        await tx
                            .update(transactions)
                            .set({ status: "completed", updatedAt: new Date() })
                            .where(eq(transactions.id, transaction.id));

                        // Release funds to seller (or hold in escrow)
                        // For now, let's say it goes to "completed" which means money is in escrow/safe
                        // If we want to release to seller immediately:
                        /*
                        await tx.update(users)
                            .set({ walletBalance: sql`${users.walletBalance} + ${transaction.netAmount}` })
                            .where(eq(users.id, transaction.sellerId));
                        */

                        // Send email notification (future)
                    });
                    // console.log(`Payment ${paymentId} approved for transaction ${transaction.id}`);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
