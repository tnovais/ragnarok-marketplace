"use client";

import { useState } from "react";
import { requestWithdrawal } from "@/server/actions/withdrawals";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function WithdrawalModal({
    balance,
    userCpf,
    onClose
}: {
    balance: number;
    userCpf?: string | null;
    onClose: () => void
}) {
    const [amount, setAmount] = useState("");
    const [pixKey, setPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("cpf");
    const [cpf, setCpf] = useState(userCpf || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Simple CPF Mask
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setCpf(value);
    };

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        formData.append("pixKeyType", pixKeyType);
        formData.append("pixKey", pixKey);

        // If user already has CPF, we send it to verify match (or backend uses stored)
        // But our action expects 'cpf' field to validate/set.
        if (!formData.get("cpf")) {
            formData.append("cpf", cpf);
        }

        const result = await requestWithdrawal(formData) as any;
        setIsSubmitting(false);

        if (result.success) {
            alert("Withdrawal requested successfully!");
            onClose();
            router.refresh();
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-xl font-bold mb-1">Request Withdrawal</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    Available Balance: <span className="text-primary font-bold">R$ {balance.toFixed(2)}</span>
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-4 py-3 rounded-md mb-6 text-sm">
                    ⚠️ Saques via PIX (exceto CPF) são processados manualmente e podem levar mais tempo.
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (R$)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="10"
                            max={balance}
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-2">
                            <label className="text-sm font-medium">Key Type</label>
                            <select
                                value={pixKeyType}
                                onChange={(e) => setPixKeyType(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                <option value="cpf">CPF</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="random">Random</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">PIX Key</label>
                            <input
                                name="pixKey"
                                type="text"
                                required
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                placeholder={pixKeyType === "email" ? "email@example.com" : "Key"}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">CPF (For Invoice)</label>
                        <input
                            name="cpf"
                            type="text"
                            required
                            value={cpf}
                            onChange={handleCpfChange}
                            readOnly={!!userCpf}
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${userCpf ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || Number(amount) > balance || Number(amount) < 10}
                            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
