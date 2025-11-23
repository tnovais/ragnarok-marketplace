"use client";

import { updateProfile, updatePassword } from "@/server/actions/user";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, User, Lock } from "lucide-react";
import { useSession } from "next-auth/react";

function SubmitButton({ text }: { text: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {text}
        </button>
    );
}

interface ProfileState {
    error?: string | null;
    success?: boolean;
}

interface PasswordState {
    error?: {
        currentPassword?: string[];
        newPassword?: string[];
        root?: string[];
    };
    success?: boolean;
}

const initialProfileState: ProfileState = { error: null, success: false };
const initialPasswordState: PasswordState = { error: {}, success: false };

export default function SettingsPage() {
    const { data: session } = useSession();
    const [profileState, profileAction] = useFormState(updateProfile as any, initialProfileState);
    const [passwordState, passwordAction] = useFormState(updatePassword as any, initialPasswordState);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        if (profileState?.success) {
            toast.success("Profile updated successfully!");
        }
        if (profileState?.error) {
            toast.error(profileState.error);
        }
    }, [profileState]);

    useEffect(() => {
        if (passwordState?.success) {
            toast.success("Password updated successfully!");
        }
        if (passwordState?.error?.root) {
            toast.error(passwordState.error.root[0]);
        }
    }, [passwordState]);

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "profile"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "security"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                            }`}
                    >
                        <Lock className="h-4 w-4" />
                        Security
                    </button>
                </aside>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === "profile" && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                            <form action={profileAction} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        name="name"
                                        defaultValue={session?.user?.name || ""}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        disabled
                                        value={session?.user?.email || ""}
                                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                </div>
                                <SubmitButton text="Save Changes" />
                            </form>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                            <form action={passwordAction} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    />
                                    {passwordState?.error?.currentPassword && (
                                        <p className="text-xs text-destructive">{passwordState.error.currentPassword[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    />
                                    <p className="text-xs text-muted-foreground">Min 8 chars, 1 upper, 1 lower, 1 number</p>
                                    {passwordState?.error?.newPassword && (
                                        <div className="text-xs text-destructive space-y-1">
                                            {passwordState.error.newPassword.map((err: string, i: number) => (
                                                <p key={i}>{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <SubmitButton text="Update Password" />
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
