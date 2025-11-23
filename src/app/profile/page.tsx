import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileActions } from "@/components/profile-actions";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check and release funds if applicable
    const { checkAndReleaseFunds } = await import("@/server/actions/transactions");
    await checkAndReleaseFunds();

    // Fetch full user data to get CPF
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    const walletBalance = Number(user?.walletBalance || 0);

    // Fetch pending sales
    const { transactions } = await import("@/db/schema");
    const { and } = await import("drizzle-orm");

    const pendingSales = await db
        .select()
        .from(transactions)
        .where(
            and(
                eq(transactions.sellerId, session.user.id),
                eq(transactions.status, "pending")
            )
        );

    const pendingBalance = pendingSales.reduce((acc, tx) => acc + Number(tx.netAmount), 0);

    // Calculate release dates
    const pendingReleases = pendingSales.map(tx => {
        const releaseDate = tx.completedAt
            ? new Date(tx.completedAt.getTime() + 72 * 60 * 60 * 1000) // 72h after completion
            : null; // Not yet confirmed
        return {
            id: tx.id,
            amount: Number(tx.netAmount),
            releaseDate
        };
    });

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Info Card */}
                <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="font-medium text-muted-foreground">Name:</span>
                            <span className="ml-2">{session.user.name || "N/A"}</span>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <span className="ml-2">{session.user.email}</span>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">User ID:</span>
                            <span className="ml-2 text-xs font-mono bg-muted px-2 py-1 rounded">{session.user.id}</span>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">CPF:</span>
                            <span className="ml-2">{user?.cpf || "Not registered"}</span>
                        </div>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Wallet</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Available Balance</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">R$ {walletBalance.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Release</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-muted-foreground">R$ {pendingBalance.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {pendingReleases.length > 0 && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-md">
                            <h3 className="text-sm font-semibold mb-2">Pending Releases</h3>
                            <div className="space-y-2">
                                {pendingReleases.map((release) => (
                                    <div key={release.id} className="flex justify-between text-sm">
                                        <span>R$ {release.amount.toFixed(2)}</span>
                                        <span className="text-muted-foreground">
                                            {release.releaseDate
                                                ? `Available on ${release.releaseDate.toLocaleDateString()} at ${release.releaseDate.toLocaleTimeString()}`
                                                : "Awaiting Buyer Confirmation"
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <ProfileActions balance={walletBalance} userCpf={user?.cpf} />
                </div>
            </div>
        </div>
    );
}
