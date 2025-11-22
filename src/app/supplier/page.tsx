import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSupplierOffers } from "@/server/actions/supplier";
import { SupplierOfferForm } from "@/components/supplier-offer-form";
import { db } from "@/db";
import { servers, categories } from "@/db/schema";
import { format } from "date-fns";

export default async function SupplierPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const serverList = await db.select().from(servers);
    const categoryList = await db.select().from(categories);
    const myOffers = await getSupplierOffers();

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Supplier Portal</h1>
            <p className="text-muted-foreground mb-8">Sell your gold and items directly to us in bulk.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Offer Form */}
                <div className="bg-card border p-6 rounded-xl shadow-sm h-fit">
                    <h2 className="text-xl font-semibold mb-4">Create New Offer</h2>
                    <SupplierOfferForm serverList={serverList} categoryList={categoryList} />
                </div>

                {/* My Offers List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">My Offers</h2>
                    {myOffers.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No offers submitted yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {myOffers.map((offer) => (
                                <div key={offer.id} className="bg-card border p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{offer.itemName}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {offer.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Qty: {offer.quantity} | Price: R$ {offer.unitPrice}</p>
                                        <p>{format(new Date(offer.createdAt!), "PP")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
