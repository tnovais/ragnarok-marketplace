import { db } from "@/db";
import { users, transactions, disputes, withdrawals } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
    // Fetch stats
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [txCount] = await db.select({ count: sql<number>`count(*)` }).from(transactions);
    const [pendingWithdrawals] = await db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(sql`${withdrawals.status} = 'pending'`);
    const [openDisputes] = await db.select({ count: sql<number>`count(*)` }).from(disputes).where(sql`${disputes.status} = 'open'`);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{userCount.count}</p>
                </div>
                <div className="p-6 rounded-xl border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
                    <p className="text-3xl font-bold mt-2">{txCount.count}</p>
                </div>
                <div className="p-6 rounded-xl border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Pending Withdrawals</h3>
                    <p className="text-3xl font-bold mt-2 text-yellow-500">{pendingWithdrawals.count}</p>
                </div>
                <div className="p-6 rounded-xl border bg-card shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Open Disputes</h3>
                    <p className="text-3xl font-bold mt-2 text-destructive">{openDisputes.count}</p>
                </div>
            </div>
        </div>
    );
}
