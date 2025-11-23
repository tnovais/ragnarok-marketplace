"use client";

import { useState } from "react";
import { WithdrawalModal } from "@/components/withdrawal-modal";
import { DepositModal } from "@/components/deposit-modal";

export function ProfileActions({ balance, userCpf }: { balance: number; userCpf?: string | null }) {
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);

    return (
        <>
            {isWithdrawOpen && (
                <WithdrawalModal
                    balance={balance}
                    userCpf={userCpf}
                    onClose={() => setIsWithdrawOpen(false)}
                />
            )}
            {isDepositOpen && (
                <DepositModal
                    onClose={() => setIsDepositOpen(false)}
                />
            )}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => setIsDepositOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Deposit
                </button>
                <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                    Withdraw
                </button>
            </div>
        </>
    );
}
