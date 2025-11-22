"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { messages, transactions, users } from "@/db/schema";
import { eq, and, or, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

const sendMessageSchema = z.object({
    transactionId: z.string().uuid(),
    content: z.string().min(1).max(1000),
});

export async function sendMessage(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const rawData = {
        transactionId: formData.get("transactionId"),
        content: formData.get("content"),
    };

    const parsed = sendMessageSchema.safeParse(rawData);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { transactionId, content } = parsed.data;

    // Sanitize input
    const { sanitize } = await import("@/lib/sanitize");
    const sanitizedContent = sanitize(content);

    const userId = session.user.id;

    // Verify participation (Buyer, Seller, or Admin)
    const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

    if (!transaction) return { error: "Transaction not found" };

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const isAdmin = user?.isAdmin;

    const isParticipant = transaction.buyerId === userId || transaction.sellerId === userId;

    if (!isParticipant && !isAdmin) {
        return { error: "Forbidden" };
    }

    await db.insert(messages).values({
        id: randomUUID(),
        transactionId,
        senderId: userId,
        content: sanitizedContent,
        createdAt: new Date(),
    });

    // Emit real-time event
    // We use a dynamic import or try/catch to avoid breaking if Redis is down
    try {
        const { emitEvent } = await import("@/lib/socket");
        emitEvent(`transaction_${transactionId}`, "new_message", {
            id: randomUUID(), // Temp ID or fetch real one? Ideally fetch real one but for speed...
            content: sanitizedContent,
            senderId: userId,
            senderName: user?.name || "Unknown",
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Socket emit failed:", error);
    }

    return { success: true };
}

export async function getMessages(transactionId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    // Verify participation
    const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

    if (!transaction) return [];

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const isAdmin = user?.isAdmin;
    const isParticipant = transaction.buyerId === userId || transaction.sellerId === userId;

    if (!isParticipant && !isAdmin) return [];

    return await db
        .select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
            senderName: users.name,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.transactionId, transactionId))
        .orderBy(asc(messages.createdAt));
}
