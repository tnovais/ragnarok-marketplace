import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { ProcessWithdrawalButton } from "@/components/admin/process-withdrawal-button";

export default async function AdminWithdrawalsPage() {
    const requests = await db
        .select({
            withdrawal: withdrawals,
            user: users,
        })
        .from(withdrawals)
        .innerJoin(users, eq(withdrawals.userId, users.id))
        .orderBy(desc(withdrawals.createdAt));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Withdrawal Requests</h1>

            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">CPF (Registered)</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">PIX Key</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.map(({ withdrawal, user }) => (
                            <tr key={withdrawal.id} className="hover:bg-muted/5">
                                <td className="px-6 py-4">
                                    {format(new Date(withdrawal.createdAt!), "PP p")}
                                </td>
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4 font-mono">{user.cpf}</td>
                                <td className="px-6 py-4 font-bold">R$ {withdrawal.amount}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono">{withdrawal.pixKey}</span>
                                        {withdrawal.pixKey !== user.cpf && (
                                            <span className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded w-fit mt-1">
                                                Verify Owner!
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {withdrawal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {withdrawal.status === 'pending' && (
                                        <ProcessWithdrawalButton
                                            withdrawalId={withdrawal.id}
                                            amount={withdrawal.amount}
                                            pixKey={withdrawal.pixKey}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
