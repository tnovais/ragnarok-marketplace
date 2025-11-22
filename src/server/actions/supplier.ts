"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { supplierOffers, servers, categories, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";

const offerSchema = z.object({
    itemName: z.string().min(3),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0.01),
    description: z.string().min(10),
    categoryId: z.number(),
    serverId: z.number(),
});

export async function createSupplierOffer(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const rawData = {
        itemName: formData.get("itemName"),
        quantity: Number(formData.get("quantity")),
        unitPrice: Number(formData.get("unitPrice")),
        description: formData.get("description"),
        categoryId: Number(formData.get("categoryId")),
        serverId: Number(formData.get("serverId")),
    };

    const parsed = offerSchema.safeParse(rawData);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const { itemName, quantity, unitPrice, description, categoryId, serverId } = parsed.data;

    await db.insert(supplierOffers).values({
        id: randomUUID(),
        supplierId: session.user.id,
        itemName,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        description,
        categoryId,
        serverId,
        status: "pending",
        createdAt: new Date(),
    });

    revalidatePath("/supplier");
    return { success: true };
}

export async function getSupplierOffers() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // If admin, return all. If user, return theirs.
    // For now, let's just return user's offers for the user page.
    return await db
        .select()
        .from(supplierOffers)
        .where(eq(supplierOffers.supplierId, session.user.id))
        .orderBy(desc(supplierOffers.createdAt));
}

export async function getAllSupplierOffers() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user?.isAdmin) return [];

    return await db
        .select({
            offer: supplierOffers,
            supplier: users,
            server: servers,
            category: categories,
        })
        .from(supplierOffers)
        .innerJoin(users, eq(supplierOffers.supplierId, users.id))
        .innerJoin(servers, eq(supplierOffers.serverId, servers.id))
        .innerJoin(categories, eq(supplierOffers.categoryId, categories.id))
        .orderBy(desc(supplierOffers.createdAt));
}
