"use client";

import { useState, use } from "react";
import { createDispute } from "@/server/actions/disputes";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function CreateDisputePage({ params }: { params: Promise<{ id: string }> }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { id: transactionId } = use(params);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        formData.append("transactionId", transactionId);

        const result = await createDispute(formData);
        setIsSubmitting(false);

        if (result.success) {
            alert("Dispute opened successfully. An admin will review it shortly.");
            router.push("/orders");
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <div className="bg-card border border-border p-8 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-6 text-destructive">
                    <AlertTriangle className="h-8 w-8" />
                    <h1 className="text-2xl font-bold">Open Dispute</h1>
                </div>

                <p className="text-muted-foreground mb-8">
                    Please describe the issue with your transaction. Providing clear evidence helps us resolve the issue faster.
                    The transaction amount will be held until the dispute is resolved.
                </p>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="reason" className="text-sm font-medium">Reason for Dispute</label>
                        <textarea
                            id="reason"
                            name="reason"
                            required
                            rows={5}
                            minLength={10}
                            placeholder="Describe what happened (e.g., Item not received, Item different from description)..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow transition-colors hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? "Opening Dispute..." : "Submit Dispute"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
