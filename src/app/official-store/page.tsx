import { db } from "@/db";
import { listings, users, servers, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ListingCard } from "@/components/listing-card";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OfficialStorePage() {
    const officialListings = await db
        .select({
            listing: listings,
            seller: {
                name: users.name,
                image: users.image,
                reputation: users.reputation,
                isVerified: users.emailVerified,
            },
            server: {
                name: servers.name,
                slug: servers.slug,
            },
            category: {
                name: categories.name,
                slug: categories.slug,
            },
        })
        .from(listings)
        .innerJoin(users, eq(listings.sellerId, users.id))
        .innerJoin(servers, eq(listings.serverId, servers.id))
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .where(
            and(
                eq(listings.isActive, true),
                eq(listings.isSold, false),
                eq(listings.isOfficial, true)
            )
        )
        .orderBy(desc(listings.createdAt));

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col items-center mb-12 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-2">Official Store</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Verified items directly from Ragnarok TradeHub partners.
                    Guaranteed delivery and premium support.
                </p>
            </div>

            {officialListings.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground">No official listings available at the moment.</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {officialListings.map(({ listing, seller, server, category }) => (
                        <ListingCard
                            key={listing.id}
                            listing={{
                                ...listing,
                                price: Number(listing.price),
                                seller: {
                                    name: seller.name,
                                    image: seller.image,
                                    reputation: Number(seller.reputation),
                                    isVerified: !!seller.isVerified,
                                },
                                server,
                                category,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
