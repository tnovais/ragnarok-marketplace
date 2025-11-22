import { db } from "../src/db";
import { users } from "../src/db/schema";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";

async function main() {
    console.log("🌱 Seeding database...");

    const password = await hash("123456", 10);

    const adminUser = {
        id: nanoid(),
        name: "Admin User",
        email: "admin@ragnarok.com",
        password,
        isAdmin: true,
        isSupplier: true,
        walletBalance: "1000.00",
        reputation: "5.00",
        emailVerified: new Date(),
    };

    const normalUser1 = {
        id: nanoid(),
        name: "User One",
        email: "user1@ragnarok.com",
        password,
        isAdmin: false,
        walletBalance: "100.00",
        reputation: "4.50",
        emailVerified: new Date(),
    };

    const normalUser2 = {
        id: nanoid(),
        name: "User Two",
        email: "user2@ragnarok.com",
        password,
        isAdmin: false,
        walletBalance: "50.00",
        reputation: "3.00",
        emailVerified: new Date(),
    };

    try {
        await db.insert(users).values([adminUser, normalUser1, normalUser2]);
        console.log("✅ Users created successfully!");
        console.log("--------------------------------");
        console.log("Admin: admin@ragnarok.com / 123456");
        console.log("User 1: user1@ragnarok.com / 123456");
        console.log("User 2: user2@ragnarok.com / 123456");
        console.log("--------------------------------");
    } catch (error) {
        console.error("❌ Error seeding users:", error);
    }

    process.exit(0);
}

main();
