import { getAllSupplierOffers } from "@/server/actions/supplier";
import { format } from "date-fns";

export default async function AdminSupplierPage() {
    const offers = await getAllSupplierOffers();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Supplier Offers</h1>

            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">Server</th>
                            <th className="px-6 py-4">Qty</th>
                            <th className="px-6 py-4">Unit Price</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {offers.map(({ offer, supplier, server }) => (
                            <tr key={offer.id} className="hover:bg-muted/5">
                                <td className="px-6 py-4">{format(new Date(offer.createdAt!), "PP")}</td>
                                <td className="px-6 py-4">{supplier.name}</td>
                                <td className="px-6 py-4 font-medium">{offer.itemName}</td>
                                <td className="px-6 py-4">{server.name}</td>
                                <td className="px-6 py-4">{offer.quantity}</td>
                                <td className="px-6 py-4">R$ {offer.unitPrice}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {offer.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
