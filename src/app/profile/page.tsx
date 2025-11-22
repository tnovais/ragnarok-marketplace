import { auth } from "@/auth";
import { getUserWallet } from "@/server/actions/user";
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

    // Fetch full user data to get CPF
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    const walletBalance = Number(user?.walletBalance || 0);

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
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">R$ {walletBalance.toFixed(2)}</span>
                        <span className="text-muted-foreground">BRL</span>
                    </div>
                    <ProfileActions balance={walletBalance} userCpf={user?.cpf} />
                </div>
            </div>
        </div>
    );
}
