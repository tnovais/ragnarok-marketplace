import { db } from "../src/db";
import { categories, servers } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding servers...");

    const serverData = [
        { name: "bRO - Thor", slug: "bro-thor", isActive: true },
        { name: "bRO - Valhalla", slug: "bro-valhalla", isActive: true },
        { name: "ROla - Freya", slug: "rola-freya", isActive: true },
        { name: "ROla - Nidhogg", slug: "rola-nidhogg", isActive: true },
        { name: "ROla - Yggdrasil", slug: "rola-yggdrasil", isActive: true },
    ];

    for (const server of serverData) {
        const existing = await db.select().from(servers).where(eq(servers.slug, server.slug));
        if (existing.length === 0) {
            await db.insert(servers).values(server);
            console.log(`Inserted server: ${server.name}`);
        } else {
            console.log(`Server already exists: ${server.name}`);
        }
    }

    console.log("Seeding categories...");

    const categoryData = [
        { name: "Zeny", slug: "zeny", isActive: true },
        { name: "Weapons", slug: "weapons", isActive: true },
        { name: "Armor", slug: "armor", isActive: true },
        { name: "Cards", slug: "cards", isActive: true },
        { name: "Consumables", slug: "consumables", isActive: true },
        { name: "Costumes", slug: "costumes", isActive: true },
        { name: "Accounts", slug: "accounts", isActive: true },
        { name: "Other", slug: "other", isActive: true },
    ];

    for (const category of categoryData) {
        const existing = await db.select().from(categories).where(eq(categories.slug, category.slug));
        if (existing.length === 0) {
            await db.insert(categories).values(category);
            console.log(`Inserted category: ${category.name}`);
        } else {
            console.log(`Category already exists: ${category.name}`);
        }
    }

    console.log("Seeding complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
