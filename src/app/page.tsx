import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, Coins, Lock, Search } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative py-32 lg:py-48 overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

                    <div className="container px-4 md:px-6 relative z-10 mx-auto">
                        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                                The #1 RMT Marketplace for Ragnarok Online
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                Trade Zeny & Items <br />
                                <span className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                    Securely & Instantly
                                </span>
                            </h1>

                            <p className="text-muted-foreground text-xl md:text-2xl max-w-[700px] leading-relaxed">
                                Join thousands of players trading on the most secure platform.
                                Escrow protection, instant delivery, and 24/7 support.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                                <Link
                                    href="/listings"
                                    className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40"
                                >
                                    <Search className="mr-2 h-5 w-5" />
                                    Browse Marketplace
                                </Link>
                                <Link
                                    href="/create-listing"
                                    className="inline-flex h-14 items-center justify-center rounded-full border border-input bg-background/50 px-8 text-lg font-bold backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105"
                                >
                                    Start Selling
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 border-y border-border/50 bg-muted/20 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-foreground">10K+</h3>
                                <p className="text-muted-foreground font-medium">Active Users</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-foreground">$2M+</h3>
                                <p className="text-muted-foreground font-medium">Traded Volume</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-foreground">50+</h3>
                                <p className="text-muted-foreground font-medium">Supported Servers</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-foreground">4.9/5</h3>
                                <p className="text-muted-foreground font-medium">TrustPilot Score</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-32 relative">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose RagnarokTradeHub?</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                We built the safest platform for trading digital assets, so you can focus on the game.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group relative p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative z-10">
                                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        <Shield className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Bank-Grade Security</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Every transaction is protected by our secure escrow system.
                                        Sellers only get paid when you confirm receipt.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative z-10">
                                    <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                        <Zap className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Our automated delivery systems and active seller notifications ensure
                                        you get your items in minutes, not hours.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative p-8 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative z-10">
                                    <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                                        <Globe className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Global Coverage</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Whether you play on iRO, bRO, or private servers like NovaRO or Shining Moon,
                                        we have a marketplace for you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 bg-muted/10">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 font-bold text-xl mb-4">
                                <Coins className="h-6 w-6 text-primary" />
                                <span>RagnarokTradeHub</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm">
                                The world's most trusted marketplace for Ragnarok Online virtual assets.
                                Safe, fast, and secure.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/listings" className="hover:text-primary">Browse Listings</Link></li>
                                <li><Link href="/sell" className="hover:text-primary">Sell Items</Link></li>
                                <li><Link href="/servers" className="hover:text-primary">Servers List</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
                                <li><Link href="/safety" className="hover:text-primary">Safety Guide</Link></li>
                                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© 2024 Ragnarok TradeHub. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
