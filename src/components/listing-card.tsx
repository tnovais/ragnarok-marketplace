"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Clock } from "lucide-react";

interface ListingCardProps {
    listing: {
        id: string;
        title: string;
        price: number;
        itemName: string;
        type: string;
        server: { name: string; slug: string };
        category: { name: string; slug: string };
        seller: {
            name: string | null;
            image: string | null;
            reputation: number;
            isVerified: boolean;
        };
        isOfficial?: boolean | null;
        createdAt: Date | null;
        screenshots?: string[] | null;
    };
}

export function ListingCard({ listing }: ListingCardProps) {
    return (
        <Link href={`/listings/${listing.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {listing.screenshots && listing.screenshots.length > 0 ? (
                        <Image
                            src={listing.screenshots[0]}
                            alt={listing.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-primary/5 text-primary/20">
                            <span className="text-4xl font-bold">RTH</span>
                        </div>
                    )}
                    {listing.isOfficial && (
                        <div className="absolute top-2 right-2">
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Official
                            </Badge>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                        <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0 backdrop-blur-md">
                            {listing.server.name}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20 backdrop-blur-md">
                            {listing.category.name}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {listing.title}
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {listing.itemName}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={listing.seller.image || undefined} />
                                <AvatarFallback>{listing.seller.name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {listing.seller.name}
                            </span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "Recently"}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto bg-muted/20">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Price</span>
                        <span className="text-lg font-bold text-primary">
                            {formatCurrency(listing.price)}
                        </span>
                    </div>
                    <Badge variant={listing.type === "zeny" ? "default" : "secondary"}>
                        {listing.type.toUpperCase()}
                    </Badge>
                </CardFooter>
            </Card>
        </Link>
    );
}
