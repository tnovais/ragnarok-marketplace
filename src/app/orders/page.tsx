import { getUserOrders } from "@/server/actions/orders";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { format } from "date-fns";
import Link from "next/link";
import { ChatBox } from "@/components/chat-box";

export default async function OrdersPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { purchases, sales } = await getUserOrders();
    const userId = session.user.id!;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            <div className="space-y-8">
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
                                <div key={transaction.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border bg-card shadow-sm gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground shrink-0">
                                            IMG
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{listing.title}</h3>
                                            <p className="text-sm text-muted-foreground">Seller: {seller.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.createdAt!), "PPP")}
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
                                            <button className="text-sm font-medium text-primary hover:underline">
                                                Review
                                            </button>
                                        )}
                                        {transaction.status === 'pending' && (
                                            <a
                                                href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${transaction.paymentId}`}
                                                target="_blank"
                                                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                            >
                                                Pay Now
                                            </a>
                                        )}
                                    </div>

                                    <div className="w-full mt-4 border-t pt-4">
                                        <ChatBox transactionId={transaction.id} currentUserId={userId} />
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
                                <div key={transaction.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border bg-card shadow-sm gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground shrink-0">
                                            IMG
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{listing.title}</h3>
                                            <p className="text-sm text-muted-foreground">Buyer: {buyer.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.createdAt!), "PPP")}
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
            </div >
        </div >
    );
}
