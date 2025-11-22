"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { transactions, listings, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createPreference } from "@/lib/payment";

export async function createTransaction(listingId: string, paymentMethod: string = "pix") {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    try {
        // Start a transaction (Drizzle MySQL transaction)
        return await db.transaction(async (tx) => {
            // 1. Get Listing
            const [listing] = await tx
                .select()
                .from(listings)
                .where(eq(listings.id, listingId));

            if (!listing) throw new Error("Listing not found");
            if (listing.isSold) throw new Error("Item already sold");
            if (listing.sellerId === userId) throw new Error("Cannot buy your own item");

            // 2. Calculate Fees
            const price = parseFloat(listing.price as string);
            const feeRate = listing.isPromoted ? 0.06 : (price >= 200 ? 0.10 : 0.15);
            const fee = price * feeRate;
            const netAmount = price - fee;

            // 3. Create Transaction
            const transactionId = randomUUID();

            // Create Mercado Pago Preference
            const payment = await createPreference({
                id: transactionId,
                title: listing.title,
                price: price,
            });

            await tx.insert(transactions).values({
                id: transactionId,
                listingId,
                buyerId: userId,
                sellerId: listing.sellerId,
                amount: price.toFixed(2),
                fee: fee.toFixed(2),
                netAmount: netAmount.toFixed(2),
                paymentMethod,
                paymentId: payment.id, // Store MP Preference ID
                status: "pending",
                createdAt: new Date(),
            });

            // 4. Mark Listing as Sold (Optimistic for now, or wait for payment)
            // For this MVP, we assume "pending" reserves the item
            await tx
                .update(listings)
                .set({ isSold: true })
                .where(eq(listings.id, listingId));

            revalidatePath("/listings");
            revalidatePath(`/listings/${listingId}`);

            // 5. Send Emails
            try {
                const { sendEmail } = await import("@/lib/mail");

                // Email to Buyer
                if (userEmail) {
                    await sendEmail({
                        to: userEmail,
                        subject: "Order Confirmation - Ragnarok TradeHub",
                        html: `<h1>Order Placed!</h1><p>You have successfully placed an order for <b>${listing.title}</b>.</p><p>Amount: R$ ${price.toFixed(2)}</p><p>Please complete the payment to finalize.</p>`
                    });
                }

                // Email to Seller (Need to fetch seller email first)
                const [seller] = await tx.select().from(users).where(eq(users.id, listing.sellerId));
                if (seller && seller.email) {
                    await sendEmail({
                        to: seller.email,
                        subject: "New Order Received - Ragnarok TradeHub",
                        html: `<h1>New Order!</h1><p>You have a new order for <b>${listing.title}</b>.</p><p>Buyer: ${userName || "Unknown"}</p><p>Amount: R$ ${netAmount.toFixed(2)}</p><p>Please check your dashboard.</p>`
                    });
                }
            } catch (emailError) {
                console.error("Failed to send transaction emails:", emailError);
            }

            return { success: true, transactionId, url: payment.init_point };
        });
    } catch (error: any) {
        console.error("Transaction failed:", error);
        return { error: error.message || "Transaction failed" };
    }
}
