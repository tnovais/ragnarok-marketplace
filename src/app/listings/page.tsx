import { getListings } from "@/server/actions/listings";
import Link from "next/link";
import { Search, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
    const listings = await getListings();

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-muted/30 border-b border-border/50 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">Marketplace</h1>
                            <p className="text-muted-foreground">Browse and buy items from trusted sellers</p>
                        </div>
                        <Link
                            href="/create-listing"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105"
                        >
                            Sell Item
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-12 px-4">
                {listings.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
                        <div className="bg-muted/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No listings found</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            The marketplace is currently empty. Be the first to list an item and start earning!
                        </p>
                        <Link
                            href="/create-listing"
                            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
                        >
                            Create First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((item) => (
                            <Link key={item.listing.id} href={`/listings/${item.listing.id}`} className="group">
                                <div className="h-full rounded-2xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden flex flex-col">
                                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                        {/* Placeholder for image */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/50 group-hover:scale-105 transition-transform duration-500">
                                            <Coins className="h-12 w-12 mb-2 opacity-20" />
                                            <span className="text-sm font-medium opacity-50">No Image</span>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold border border-border/50">
                                            {item.server.name}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1" title={item.listing.title}>
                                                {item.listing.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                            {item.listing.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                            <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                                {item.category.name}
                                            </span>
                                            <span className="font-black text-xl text-primary">
                                                R$ {item.listing.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
