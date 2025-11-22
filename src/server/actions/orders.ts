"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { transactions, listings, users } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";

export async function getUserOrders() {
    const session = await auth();
    if (!session?.user?.id) {
        return { purchases: [], sales: [] };
    }

    const userId = session.user.id;

    // Fetch Purchases
    const purchases = await db
        .select({
            transaction: transactions,
            listing: listings,
            seller: users,
        })
        .from(transactions)
        .innerJoin(listings, eq(transactions.listingId, listings.id))
        .innerJoin(users, eq(transactions.sellerId, users.id))
        .where(eq(transactions.buyerId, userId))
        .orderBy(desc(transactions.createdAt));

    // Fetch Sales
    const sales = await db
        .select({
            transaction: transactions,
            listing: listings,
            buyer: users,
        })
        .from(transactions)
        .innerJoin(listings, eq(transactions.listingId, listings.id))
        .innerJoin(users, eq(transactions.buyerId, users.id))
        .where(eq(transactions.sellerId, userId))
        .orderBy(desc(transactions.createdAt));

    return { purchases, sales };
}
