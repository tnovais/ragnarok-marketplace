import { auth } from "@/auth";
import { db } from "@/db";
import { listings, users, servers, categories } from "@/db/schema";
import { createTransaction } from "@/server/actions/transactions";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const [item] = await db
        .select({
            title: listings.title,
            description: listings.description,
            itemName: listings.itemName,
            price: listings.price,
            server: servers.name,
        })
        .from(listings)
        .innerJoin(servers, eq(listings.serverId, servers.id))
        .where(eq(listings.id, params.id));

    if (!item) {
        return {
            title: "Item Not Found",
        };
    }

    return {
        title: `${item.title} | Ragnarok TradeHub`,
        description: `Buy ${item.itemName} on ${item.server} for R$ ${item.price}. ${item.description.substring(0, 100)}...`,
        openGraph: {
            title: item.title,
            description: `Buy ${item.itemName} on ${item.server} for R$ ${item.price}`,
            images: ["/og-image.png"], // Placeholder or dynamic image if available
        },
    };
}

export default async function ListingDetailsPage({ params }: { params: { id: string } }) {
    const session = await auth();

    const [item] = await db
        .select({
            listing: listings,
            seller: {
                id: users.id,
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
        .where(eq(listings.id, params.id));

    if (!item) {
        notFound();
    }

    async function handlePurchase() {
        "use server";
        if (!session) redirect("/login");

        const result = await createTransaction(params.id);
        if ('error' in result) {
            console.error(result.error);
        } else if (result.url) {
            redirect(result.url);
        } else {
            redirect("/profile");
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image / Gallery */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    No Image Available
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{item.listing.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="bg-secondary px-2 py-1 rounded text-secondary-foreground">
                                {item.server.name}
                            </span>
                            <span>•</span>
                            <span>{item.category.name}</span>
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                        R$ {item.listing.price}
                    </div>

                    <div className="prose max-w-none text-muted-foreground">
                        <p>{item.listing.description}</p>
                    </div>

                    {/* Seller Info */}
                    <div className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold mb-2">Seller Information</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {item.seller.name?.[0] || "?"}
                            </div>
                            <div>
                                <div className="font-medium">{item.seller.name || "Anonymous"}</div>
                                <div className="text-xs text-muted-foreground">
                                    Reputation: {item.seller.reputation} / 5.0
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <form action={handlePurchase}>
                        <button
                            type="submit"
                            disabled={item.listing.isSold || item.listing.sellerId === session?.user?.id}
                            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
                        >
                            {item.listing.isSold
                                ? "Sold Out"
                                : item.listing.sellerId === session?.user?.id
                                    ? "You Own This Item"
                                    : "Buy Now"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
