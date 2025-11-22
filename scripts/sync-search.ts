import { db } from "@/db";
import { listings } from "@/db/schema";
import { meiliClient, LISTINGS_INDEX, setupMeili } from "@/lib/search";
import { eq } from "drizzle-orm";

async function sync() {
    console.log("Starting sync...");
    await setupMeili();

    const allListings = await db.select().from(listings);
    console.log(`Found ${allListings.length} listings to sync.`);

    const documents = allListings.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        itemName: l.itemName,
        price: parseFloat(l.price),
        categoryId: l.categoryId,
        serverId: l.serverId,
        createdAt: l.createdAt?.getTime(),
        isActive: l.isActive,
        isSold: l.isSold,
    }));

    if (documents.length > 0) {
        await meiliClient.index(LISTINGS_INDEX).addDocuments(documents);
        console.log("Documents added to Meilisearch.");
    } else {
        console.log("No documents to sync.");
    }

    console.log("Sync complete.");
    process.exit(0);
}

sync().catch(console.error);
