"use client";

import { register } from "@/server/actions/auth";
import Link from "next/link";
import { Coins, ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Account
        </button>
    );
}

const initialState = {
    error: {},
    success: false,
};

export default function RegisterPage() {
    const [state, formAction] = useFormState(register, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast.success("Account created successfully! Please sign in.");
            router.push("/login");
        }
        if (state.error?.root) {
            toast.error(state.error.root[0]);
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/20 p-3 rounded-xl">
                            <UserPlus className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join the marketplace and start trading</p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm">
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground/80">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                            {state.error?.name && <p className="text-xs text-destructive">{state.error.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                            {state.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            />
                            <p className="text-xs text-muted-foreground">Min 8 chars, 1 upper, 1 lower, 1 number</p>
                            {state.error?.password && (
                                <div className="text-xs text-destructive space-y-1">
                                    {state.error.password.map((err: string, i: number) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                        <SubmitButton />
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
