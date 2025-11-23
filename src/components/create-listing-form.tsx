"use client";

import { createListing } from "@/server/actions/listings";
import { useState } from "react";

type Props = {
    serverList: { id: number; name: string }[];
    categoryList: { id: number; name: string }[];
};

export function CreateListingForm({ serverList, categoryList }: Props) {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    return (
        <form action={createListing} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">
                        Listing Type
                    </label>
                    <select
                        name="type"
                        id="type"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => {
                            const label = document.getElementById("itemNameLabel");
                            if (label) {
                                if (e.target.value === "zeny") label.innerText = "Amount (Zeny)";
                                else if (e.target.value === "account") label.innerText = "Account Level/Class";
                                else label.innerText = "Item Name";
                            }
                        }}
                    >
                        <option value="item">Item</option>
                        <option value="zeny">Zeny</option>
                        <option value="account">Account</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Listing Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div>
                    <label htmlFor="itemName" id="itemNameLabel" className="block text-sm font-medium mb-1">
                        Item Name
                    </label>
                    <input
                        type="text"
                        name="itemName"
                        id="itemName"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                        Price (R$)
                    </label>
                    <input
                        type="number"
                        name="price"
                        id="price"
                        step="0.01"
                        min="0"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div>
                    <label htmlFor="serverId" className="block text-sm font-medium mb-1">
                        Server
                    </label>
                    <select
                        name="serverId"
                        id="serverId"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {serverList.map((server) => (
                            <option key={server.id} value={server.id}>
                                {server.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                    Category
                </label>
                <select
                    name="categoryId"
                    id="categoryId"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {categoryList.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
            </div>

            <div>
                <label htmlFor="screenshots" className="block text-sm font-medium mb-1">
                    Screenshots (Upload Image)
                </label>
                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        disabled={uploading}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploading(true);
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                const res = await fetch("/api/upload", {
                                    method: "POST",
                                    body: formData,
                                });
                                const data = await res.json();
                                if (data.success) {
                                    setImageUrl(data.url);
                                    alert("Image uploaded successfully!");
                                } else {
                                    alert("Upload failed: " + data.error);
                                }
                            } catch (err) {
                                alert("Upload error");
                            } finally {
                                setUploading(false);
                            }
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <input type="hidden" name="screenshots" id="screenshots" value={imageUrl} />
                {imageUrl && (
                    <p className="text-xs text-green-600 mt-1">
                        Image uploaded: {imageUrl.split('/').pop()}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    Upload an image of the item.
                </p>
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
            >
                {uploading ? "Uploading..." : "Create Listing"}
            </button>
        </form>
    );
}
