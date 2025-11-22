import Link from "next/link";
import { LayoutDashboard, Wallet, AlertTriangle, Users, Package } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Verify Admin Status
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user?.isAdmin) {
        redirect("/"); // Or show 403 page
    }

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border hidden md:block fixed h-full pt-20">
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-6 px-4">Admin Panel</h2>
                    <nav className="space-y-2">
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Link>
                        <Link href="/admin/withdrawals" className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                            <Wallet className="h-4 w-4" />
                            Withdrawals
                        </Link>
                        <Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                            <AlertTriangle className="h-4 w-4" />
                            Disputes
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                            <Users className="h-4 w-4" />
                            Users
                        </Link>
                        <Link href="/admin/supplier" className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                            <Package className="h-4 w-4" />
                            Suppliers
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-20 p-8">
                {children}
            </main>
        </div>
    );
}
