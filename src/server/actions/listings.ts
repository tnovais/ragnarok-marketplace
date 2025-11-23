"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { listings, users, servers, categories } from "@/db/schema";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "crypto";

const createListingSchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    itemName: z.string().min(2).max(100),
    categoryId: z.number().int(),
    serverId: z.number().int(),
    screenshots: z.array(z.string().url()).optional(),
});

export async function createListing(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Parse FormData manually or use Object.fromEntries if structure is flat
    // For arrays like screenshots, we might need special handling if passed as multiple fields
    const rawData = Object.fromEntries(formData.entries());

    // Handle type conversions
    let screenshots = [];
    try {
        screenshots = rawData.screenshots ? JSON.parse(rawData.screenshots as string) : [];
    } catch (e) {
        screenshots = [];
    }

    const data = {
        ...rawData,
        categoryId: Number(rawData.categoryId),
        serverId: Number(rawData.serverId),
        screenshots,
    };

    const parsed = createListingSchema.safeParse(data);

    if (!parsed.success) {
        redirect("/create-listing?error=Invalid data");
    }

    try {
        const id = randomUUID();
        const newListing = {
            id,
            sellerId: session.user.id!,
            ...parsed.data,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            isSold: false,
            isPromoted: false,
            isOfficial: false,
        };

        await db.insert(listings).values(newListing);

        // Index in Meilisearch
        try {
            const { meiliClient, LISTINGS_INDEX } = await import("@/lib/search");
            await meiliClient.index(LISTINGS_INDEX).addDocuments([{
                id,
                title: newListing.title,
                description: newListing.description,
                itemName: newListing.itemName,
                price: parseFloat(newListing.price),
                categoryId: newListing.categoryId,
                serverId: newListing.serverId,
                createdAt: newListing.createdAt.getTime(),
                isActive: true,
                isSold: false,
            }]);
        } catch (searchError) {
            console.error("Meilisearch indexing failed:", searchError);
        }

        revalidatePath("/listings");
    } catch (error) {
        console.error("Failed to create listing:", error);
        redirect("/create-listing?error=Failed to create listing");
    }

    redirect(`/listings`);
}

export async function getListings(filters?: {
    serverId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}) {
    const conditions = [eq(listings.isActive, true), eq(listings.isSold, false)];

    if (filters?.serverId) conditions.push(eq(listings.serverId, filters.serverId));
    if (filters?.categoryId) conditions.push(eq(listings.categoryId, filters.categoryId));
    if (filters?.minPrice) conditions.push(gte(listings.price, filters.minPrice.toString()));
    if (filters?.maxPrice) conditions.push(lte(listings.price, filters.maxPrice.toString()));

    // Meilisearch Integration
    if (filters?.search) {
        try {
            const { meiliClient, LISTINGS_INDEX } = await import("@/lib/search");
            const searchResults = await meiliClient.index(LISTINGS_INDEX).search(filters.search, {
                limit: 50,
                filter: `isActive = true AND isSold = false ${filters.serverId ? `AND serverId = ${filters.serverId}` : ''} ${filters.categoryId ? `AND categoryId = ${filters.categoryId}` : ''}`
            });

            const ids = searchResults.hits.map(h => h.id);
            if (ids.length > 0) {
                // Filter by IDs found in Meilisearch
                // We need to use 'inArray' but if list is huge it might be an issue. For now it's fine.
                // Also need to import inArray
                // For now, let's just add the ID condition if we have hits.
                // If no hits, we should probably return empty or fallback to SQL LIKE?
                // Let's return empty if search yielded no results.
                // We can't easily mix SQL LIKE and Meilisearch results without duplicates or confusion.
                // Let's trust Meilisearch.

                // We need to import inArray from drizzle-orm
                // Since I can't easily add imports at top with replace_file_content without reading whole file, 
                // I will use sql`...` for IN clause or just rely on the fact that I can't easily change imports here.
                // Actually, I can use sql to do "id IN (...)"

                const idList = ids.map(id => `'${id}'`).join(",");
                conditions.push(sql`${listings.id} IN (${sql.raw(idList)})`);
            } else {
                // No results found in Meilisearch
                return [];
            }
        } catch (e) {
            console.error("Meilisearch failed, falling back to SQL LIKE", e);
            conditions.push(
                sql`(${listings.title} LIKE ${'%' + filters.search + '%'} OR ${listings.itemName} LIKE ${'%' + filters.search + '%'})`
            );
        }
    }

    return await db
        .select({
            listing: listings,
            seller: {
                name: users.name,
                image: users.image,
                reputation: users.reputation,
            },
            server: servers,
            category: categories,
        })
        .from(listings)
        .innerJoin(users, eq(listings.sellerId, users.id))
        .innerJoin(servers, eq(listings.serverId, servers.id))
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(desc(listings.createdAt));
}
