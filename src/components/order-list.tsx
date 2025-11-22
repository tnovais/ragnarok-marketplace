"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ReviewModal } from "@/components/review-modal";
import { getPaymentUrl } from "@/lib/payment";

type OrderListProps = {
    purchases: any[];
    sales: any[];
};

export function OrderList({ purchases, sales }: OrderListProps) {
    const [reviewTransactionId, setReviewTransactionId] = useState<string | null>(null);

    return (
        <div className="space-y-8">
            {reviewTransactionId && (
                <ReviewModal
                    transactionId={reviewTransactionId}
                    onClose={() => setReviewTransactionId(null)}
                />
            )}

            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Purchases
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {purchases.length}
                    </span>
                </h2>
                {purchases.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/5">
                        <p className="text-muted-foreground">You haven't bought anything yet.</p>
                        <Link href="/listings" className="text-primary hover:underline text-sm mt-2 inline-block">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {purchases.map(({ transaction, listing, seller }) => (
                            <div key={transaction.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border bg-card shadow-sm gap-4 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground shrink-0 overflow-hidden">
                                        {listing.screenshots && listing.screenshots.length > 0 ? (
                                            <img src={listing.screenshots[0]} alt={listing.title} className="h-full w-full object-cover" />
                                        ) : (
                                            "IMG"
                                        )}
                                    </div>
                                    <div>
                                        <Link href={`/listings/${listing.id}`} className="font-bold hover:text-primary transition-colors">
                                            {listing.title}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">Seller: {seller.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {transaction.createdAt ? format(new Date(transaction.createdAt), "PPP") : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="font-bold text-lg">R$ {transaction.amount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${transaction.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                    {transaction.status === 'completed' && (
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/disputes/create/${transaction.id}`}
                                                className="text-sm font-medium text-destructive hover:underline"
                                            >
                                                Report Issue
                                            </Link>
                                            <button
                                                onClick={() => setReviewTransactionId(transaction.id)}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    )}
                                    {transaction.status === 'pending' && (
                                        <a
                                            href={getPaymentUrl(transaction.paymentId!)}
                                            target="_blank"
                                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                        >
                                            Pay Now
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Sales
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {sales.length}
                    </span>
                </h2>
                {sales.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/5">
                        <p className="text-muted-foreground">You haven't sold anything yet.</p>
                        <Link href="/create-listing" className="text-primary hover:underline text-sm mt-2 inline-block">
                            Start Selling
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sales.map(({ transaction, listing, buyer }) => (
                            <div key={transaction.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border bg-card shadow-sm gap-4 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground shrink-0 overflow-hidden">
                                        {listing.screenshots && listing.screenshots.length > 0 ? (
                                            <img src={listing.screenshots[0]} alt={listing.title} className="h-full w-full object-cover" />
                                        ) : (
                                            "IMG"
                                        )}
                                    </div>
                                    <div>
                                        <Link href={`/listings/${listing.id}`} className="font-bold hover:text-primary transition-colors">
                                            {listing.title}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">Buyer: {buyer.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {transaction.createdAt ? format(new Date(transaction.createdAt), "PPP") : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-green-500">+ R$ {transaction.netAmount}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${transaction.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
