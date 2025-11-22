"use client";

import { useState } from "react";
import { approveWithdrawal, rejectWithdrawal } from "@/server/actions/admin";
import { Check, X } from "lucide-react";

export function ProcessWithdrawalButton({ withdrawalId, amount, pixKey }: { withdrawalId: string, amount: string, pixKey: string }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleApprove() {
        if (!confirm(`Confirm transfer of R$ ${amount} to PIX Key: ${pixKey}?`)) return;

        setIsLoading(true);
        const result = await approveWithdrawal(withdrawalId);
        setIsLoading(false);

        if (!result.success) alert(result.error);
    }

    async function handleReject() {
        if (!confirm("Reject this withdrawal and refund the user?")) return;

        setIsLoading(true);
        const result = await rejectWithdrawal(withdrawalId);
        setIsLoading(false);

        if (!result.success) alert(result.error);
    }

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleApprove}
                disabled={isLoading}
                className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                title="Approve & Mark Paid"
            >
                <Check className="h-4 w-4" />
            </button>
            <button
                onClick={handleReject}
                disabled={isLoading}
                className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                title="Reject & Refund"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
