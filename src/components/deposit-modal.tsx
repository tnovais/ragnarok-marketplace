"use client";

import { useState } from "react";
import { createDeposit } from "@/server/actions/deposits";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DepositModal({
    onClose
}: {
    onClose: () => void
}) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            const result = await createDeposit(formData) as any;

            if (result.success && result.url) {
                toast.success("Redirecting to payment...");
                window.location.href = result.url;
            } else {
                toast.error(result.error?.root?.[0] || "Failed to create deposit");
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-xl font-bold mb-1">Add Funds</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    Deposit funds to your wallet via Pix.
                </p>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (R$)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !amount || Number(amount) < 1}
                            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSubmitting ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
