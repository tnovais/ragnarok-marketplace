"use client";

import { sendSupportMessage } from "@/server/actions/support";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Loader2, Send, Mail, MessageSquare } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
        >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Message
        </button>
    );
}

interface SupportState {
    error?: {
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
        root?: string[];
    };
    success?: boolean;
}

const initialState: SupportState = { error: {}, success: false };

export default function SupportPage() {
    const [state, formAction] = useFormState(sendSupportMessage as any, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            toast.success("Message sent successfully! We'll be in touch.");
            formRef.current?.reset();
        }
        if (state.error?.root) {
            toast.error(state.error.root[0]);
        }
    }, [state]);

    return (
        <div className="container mx-auto py-16 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Have a question, issue, or feedback? Fill out the form below and our team will get back to you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Email Us</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Directly send us an email for general inquiries.
                        </p>
                        <a href="mailto:support@ragnaroktradehub.com" className="text-primary text-sm font-medium hover:underline">
                            support@ragnaroktradehub.com
                        </a>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Live Chat</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Chat with our support team in real-time (when available).
                        </p>
                        <button disabled className="text-muted-foreground text-sm font-medium cursor-not-allowed">
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2">
                    <div className="bg-card border rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                        <form ref={formRef} action={formAction} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        placeholder="Your name"
                                    />
                                    {state?.error?.name && <p className="text-xs text-destructive">{state.error.name[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        placeholder="your@email.com"
                                    />
                                    {state?.error?.email && <p className="text-xs text-destructive">{state.error.email[0]}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                <input
                                    id="subject"
                                    name="subject"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    placeholder="What is this regarding?"
                                />
                                {state?.error?.subject && <p className="text-xs text-destructive">{state.error.subject[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    required
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="How can we help you?"
                                />
                                {state?.error?.message && <p className="text-xs text-destructive">{state.error.message[0]}</p>}
                            </div>

                            <SubmitButton />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
