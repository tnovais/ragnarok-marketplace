"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage, getMessages } from "@/server/actions/chat";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { io } from "socket.io-client";

type Message = {
    id: string;
    content: string;
    createdAt: Date | null;
    senderId: string;
    senderName: string | null;
};

type ChatBoxProps = {
    transactionId: string;
    currentUserId: string;
};

export function ChatBox({ transactionId, currentUserId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        getMessages(transactionId).then(setMessages);
    }, [transactionId]);

    // Socket.io Connection
    useEffect(() => {
        // Connect to the socket server
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL!;
        const socket = io(socketUrl);

        socket.on("connect", () => {
            console.log("Connected to chat socket");
            socket.emit("join_room", `transaction_${transactionId}`);
        });

        socket.on("new_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [transactionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        const tempMsg: Message = {
            id: Math.random().toString(),
            content: newMessage,
            createdAt: new Date(),
            senderId: currentUserId,
            senderName: "Me", // Placeholder
        };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage("");

        const formData = new FormData();
        formData.append("transactionId", transactionId);
        formData.append("content", tempMsg.content);

        await sendMessage(formData);
        // No need to fetch messages again, socket will handle it (or our optimistic update did)
        // But if we want to be sure about the ID/Timestamp from DB, we could fetch.
        // For now, let's trust the socket event coming back (which we emit in server action)
    }

    return (
        <div className="flex flex-col h-[400px] border rounded-lg bg-background shadow-sm">
            <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold text-sm">Transaction Chat (Real-time)</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs my-auto">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}>
                                    <p className="font-bold text-xs mb-1 opacity-70">{msg.senderName}</p>
                                    <p>{msg.content}</p>
                                    <span className="text-[10px] opacity-50 block text-right mt-1">
                                        {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : ""}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newMessage.trim()}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}
