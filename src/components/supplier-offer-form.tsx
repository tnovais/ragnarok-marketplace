"use client";

import { useState } from "react";
import { createSupplierOffer } from "@/server/actions/supplier";
import { useRouter } from "next/navigation";

type Props = {
    serverList: { id: number; name: string }[];
    categoryList: { id: number; name: string }[];
};

export function SupplierOfferForm({ serverList, categoryList }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const result = await createSupplierOffer(formData);
        setIsSubmitting(false);

        if (result?.success) {
            alert("Offer submitted successfully!");
            router.refresh();
            // Optional: Reset form
        } else if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Server</label>
                    <select name="serverId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                        <option value="">Select Server</option>
                        {serverList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select name="categoryId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                        <option value="">Select Category</option>
                        {categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Item Name / Currency</label>
                <input name="itemName" placeholder="e.g., Zeny, MVP Card" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <input name="quantity" type="number" min="1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Price (R$)</label>
                    <input name="unitPrice" type="number" step="0.01" min="0.01" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Details about delivery, availability..." required />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
            >
                {isSubmitting ? "Submitting..." : "Submit Offer"}
            </button>
        </form>
    );
}
