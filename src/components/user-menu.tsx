"use client";

import Link from "next/link";
import { User as UserIcon, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

export function UserMenu({ user }: { user: User }) {
    return (
        <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="relative group">
                <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                    {user.image ? (
                        <img src={user.image || ""} alt={user.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                    )}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                    <div className="p-2 space-y-1">
                        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            My Orders
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <div className="h-px bg-border/50 my-1" />
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
