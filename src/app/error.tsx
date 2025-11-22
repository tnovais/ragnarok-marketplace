"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
            <div className="bg-destructive/10 p-6 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error. Please try again later.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Try again
                </button>
                <button
                    onClick={() => (window.location.href = "/")}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
