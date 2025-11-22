import { auth } from "@/auth";
import { db } from "@/db";
import { categories, servers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateListingForm } from "@/components/create-listing-form";
import { redirect } from "next/navigation";

export default async function CreateListingPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const serverList = await db.select().from(servers).where(eq(servers.isActive, true));
    const categoryList = await db.select().from(categories).where(eq(categories.isActive, true));

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

            {searchParams.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm font-medium">
                    {searchParams.error}
                </div>
            )}

            <CreateListingForm serverList={serverList} categoryList={categoryList} />
        </div>
    );
}
