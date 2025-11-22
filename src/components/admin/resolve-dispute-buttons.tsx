"use client";

import { useState } from "react";
import { resolveDispute } from "@/server/actions/disputes";

export function ResolveDisputeButtons({ disputeId }: { disputeId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleResolve(resolution: "refund_buyer" | "release_seller") {
        const action = resolution === "refund_buyer" ? "Refund Buyer" : "Release to Seller";
        if (!confirm(`Are you sure you want to ${action}? This action is irreversible.`)) return;

        setIsLoading(true);
        const result = await resolveDispute(disputeId, resolution);
        setIsLoading(false);

        if (!result.success) alert(result.error);
    }

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => handleResolve("refund_buyer")}
                disabled={isLoading}
                className="px-4 py-2 rounded-md bg-red-100 text-red-700 font-medium hover:bg-red-200 disabled:opacity-50 text-sm"
            >
                Refund Buyer
            </button>
            <button
                onClick={() => handleResolve("release_seller")}
                disabled={isLoading}
                className="px-4 py-2 rounded-md bg-green-100 text-green-700 font-medium hover:bg-green-200 disabled:opacity-50 text-sm"
            >
                Release to Seller
            </button>
        </div>
    );
}
