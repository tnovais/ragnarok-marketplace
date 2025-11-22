import Link from "next/link";
import { Coins } from "lucide-react";
import { auth } from "@/auth";
import { UserMenu } from "./user-menu";

export async function Header() {
    const session = await auth();

    return (
        <header className="px-6 lg:px-8 h-20 flex items-center border-b border-border/10 backdrop-blur-md fixed w-full z-50 bg-background/60">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <span>
                        Ragnarok<span className="text-primary">TradeHub</span>
                    </span>
                </Link>
                <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="/listings" className="hover:text-primary transition-colors">
                        Marketplace
                    </Link>
                    <Link href="/sell" className="hover:text-primary transition-colors">
                        Sell Gold/Items
                    </Link>
                    <Link href="/support" className="hover:text-primary transition-colors">
                        Support
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <UserMenu user={session.user} />
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
