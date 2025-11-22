"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/server/actions/reviews";
import { useRouter } from "next/navigation";

export function ReviewModal({ transactionId, onClose }: { transactionId: string; onClose: () => void }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        formData.append("transactionId", transactionId);
        formData.append("rating", rating.toString());

        const result = await createReview(formData);
        setIsSubmitting(false);

        if (result.success) {
            onClose();
            router.refresh();
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4">Rate your experience</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    How was your transaction? Your feedback helps others trust this seller.
                </p>

                <form action={handleSubmit} className="space-y-4">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= (hover || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium">Comment</label>
                        <textarea
                            id="comment"
                            name="comment"
                            required
                            rows={3}
                            placeholder="Fast delivery, great seller!"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
