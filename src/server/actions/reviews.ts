"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { reviews, transactions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const reviewSchema = z.object({
    transactionId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(3).max(500),
});

export async function createReview(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        transactionId: formData.get("transactionId"),
        rating: Number(formData.get("rating")),
        comment: formData.get("comment"),
    };

    const parsed = reviewSchema.safeParse(rawData);
    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    const { transactionId, rating, comment } = parsed.data;

    // Verify transaction ownership and status
    const [transaction] = await db
        .select()
        .from(transactions)
        .where(
            and(
                eq(transactions.id, transactionId),
                eq(transactions.buyerId, session.user.id)
            )
        );

    if (!transaction) {
        return { error: "Transaction not found or access denied" };
    }

    // Check if already reviewed
    const [existingReview] = await db
        .select()
        .from(reviews)
        .where(
            and(
                eq(reviews.transactionId, transactionId),
                eq(reviews.reviewerId, session.user.id)
            )
        );

    if (existingReview) {
        return { error: "You have already reviewed this transaction" };
    }

    // Create Review
    await db.insert(reviews).values({
        id: randomUUID(),
        transactionId,
        reviewerId: session.user.id,
        revieweeId: transaction.sellerId,
        rating,
        comment,
    });

    // Update Seller Reputation (Simple Average)
    // In a real app, this would be a background job or optimized query
    const sellerReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.revieweeId, transaction.sellerId));

    const totalRating = sellerReviews.reduce((acc, r) => acc + r.rating, 0);
    const newReputation = totalRating / sellerReviews.length;

    await db
        .update(users)
        .set({ reputation: newReputation.toFixed(2) })
        .where(eq(users.id, transaction.sellerId));

    revalidatePath("/orders");
    return { success: true };
}
