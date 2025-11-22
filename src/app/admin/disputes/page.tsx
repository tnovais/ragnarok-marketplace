import { db } from "@/db";
import { disputes, transactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { ResolveDisputeButtons } from "@/components/admin/resolve-dispute-buttons";
import { ChatBox } from "@/components/chat-box";
import { auth } from "@/auth";

export default async function AdminDisputesPage() {
    const session = await auth();
    const disputeList = await db
        .select({
            dispute: disputes,
            transaction: transactions,
            reporter: users,
        })
        .from(disputes)
        .innerJoin(transactions, eq(disputes.transactionId, transactions.id))
        .innerJoin(users, eq(disputes.reporterId, users.id))
        .orderBy(desc(disputes.createdAt));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dispute Management</h1>

            <div className="grid gap-6">
                {disputeList.map(({ dispute, transaction, reporter }) => (
                    <div key={dispute.id} className="bg-card border rounded-lg shadow-sm p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${dispute.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {dispute.status}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(dispute.createdAt!), "PP p")}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg">Dispute #{dispute.id.slice(0, 8)}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Transaction: <span className="font-mono">{transaction.id}</span> | Amount: <strong>R$ {transaction.amount}</strong>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Reporter: {reporter.name} ({reporter.email})
                                </p>
                            </div>

                            {dispute.status === 'open' && (
                                <ResolveDisputeButtons disputeId={dispute.id} />
                            )}
                        </div>

                        <div className="bg-muted/30 p-4 rounded-md mb-4">
                            <h4 className="text-sm font-bold mb-1">Reason:</h4>
                            <p className="text-sm">{dispute.reason}</p>
                        </div>

                        {dispute.resolution && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-md">
                                <h4 className="text-sm font-bold text-green-700 mb-1">Resolution:</h4>
                                <p className="text-sm text-green-800 capitalize">
                                    {dispute.resolution.replace('_', ' ')}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 border-t pt-6">
                            <h4 className="text-sm font-bold mb-2">Transaction Chat Log</h4>
                            <ChatBox transactionId={transaction.id} currentUserId={session?.user?.id!} />
                        </div>
                    </div>
                ))}

                {disputeList.length === 0 && (
                    <p className="text-muted-foreground text-center py-12">No disputes found.</p>
                )}
            </div>
        </div>
    );
}
