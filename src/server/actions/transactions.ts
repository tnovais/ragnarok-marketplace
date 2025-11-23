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
        // 1. Fetch Listing first (Read-only)
        const [listing] = await db
            .select()
            .from(listings)
            .where(eq(listings.id, listingId));

        if (!listing) throw new Error("Listing not found");
        if (listing.isSold) throw new Error("Item already sold");
        if (listing.sellerId === userId) throw new Error("Cannot buy your own item");

        // 1.5 Check if Buyer has CPF
        const [buyer] = await db.select({ cpf: users.cpf }).from(users).where(eq(users.id, userId));
        if (!buyer?.cpf) {
            throw new Error("You must register your CPF in Settings before buying.");
        }

        // 2. Calculate Fees
        const price = parseFloat(listing.price as string);
        const feeRate = listing.isPromoted ? 0.06 : (price >= 200 ? 0.10 : 0.15);
        const fee = price * feeRate;
        const netAmount = price - fee;

        // 3. Create Mercado Pago Preference (External Call - Outside DB Transaction)
        const transactionId = randomUUID();
        const payment = await createPreference({
            id: transactionId,
            title: listing.title,
            price: price,
        });

        // 4. Database Transaction
        await db.transaction(async (tx) => {
            // Re-check status inside transaction to prevent race conditions
            const [currentListing] = await tx
                .select({ isSold: listings.isSold })
                .from(listings)
                .where(eq(listings.id, listingId));

            if (!currentListing || currentListing.isSold) {
                throw new Error("Item was just sold to someone else");
            }

            // Insert Transaction
            await tx.insert(transactions).values({
                id: transactionId,
                listingId,
                buyerId: userId,
                sellerId: listing.sellerId,
                amount: price.toFixed(2),
                fee: fee.toFixed(2),
                netAmount: netAmount.toFixed(2),
                paymentMethod,
                paymentId: payment.id,
                status: "pending",
                createdAt: new Date(),
            });

            // Mark Listing as Sold
            await tx
                .update(listings)
                .set({ isSold: true })
                .where(eq(listings.id, listingId));
        });

        revalidatePath("/listings");
        revalidatePath(`/listings/${listingId}`);

        // 5. Send Emails (Fire and forget / Async)
        (async () => {
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

                // Email to Seller
                const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId));
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
        })();

        return { success: true, transactionId: transactionId, url: payment.init_point };

    } catch (error: any) {
        console.error("Transaction failed:", error);
        return { error: error.message || "Transaction failed" };
    }
}

export async function confirmTransaction(transactionId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    return await db.transaction(async (tx) => {
        const [transaction] = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId));

        if (!transaction) return { error: "Transaction not found" };
        if (transaction.buyerId !== session?.user?.id) return { error: "Only buyer can confirm" };
        if (transaction.status !== "pending") return { error: "Transaction already processed" };

        await tx
            .update(transactions)
            .set({
                status: "completed",
                buyerConfirmed: true,
                completedAt: new Date(),
            })
            .where(eq(transactions.id, transactionId));

        revalidatePath("/profile");
        return { success: true };
    });
}

export async function checkAndReleaseFunds() {
    const session = await auth();
    if (!session?.user?.id) return { released: 0 };

    const userId = session.user.id;

    // Calculate 3 business days ago
    const getThreeBusinessDaysAgo = () => {
        let date = new Date();
        let businessDays = 0;
        while (businessDays < 3) {
            date.setDate(date.getDate() - 1);
            const day = date.getDay();
            if (day !== 0 && day !== 6) { // 0 = Sun, 6 = Sat
                businessDays++;
            }
        }
        return date;
    };

    const cutoffDate = getThreeBusinessDaysAgo();

    const { and, lte } = await import("drizzle-orm");

    return await db.transaction(async (tx) => {
        const releasableTransactions = await tx
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.sellerId, userId),
                    eq(transactions.status, "completed"),
                    lte(transactions.completedAt, cutoffDate)
                )
            );

        if (releasableTransactions.length === 0) return { released: 0 };

        let totalReleased = 0;

        for (const txData of releasableTransactions) {
            // Update seller balance
            await tx
                .update(users)
                .set({
                    walletBalance: sql`${users.walletBalance} + ${txData.netAmount}`,
                })
                .where(eq(users.id, userId));

            // Update transaction status
            await tx
                .update(transactions)
                .set({ status: "released" })
                .where(eq(transactions.id, txData.id));

            totalReleased += Number(txData.netAmount);
        }

        return { released: totalReleased };
    });
}
