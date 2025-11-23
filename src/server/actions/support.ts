"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/mail";
import { env } from "@/env";

const supportSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    subject: z.string().min(5, "Subject is required"),
    message: z.string().min(10, "Message is too short"),
});

export async function sendSupportMessage(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    const parsed = supportSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { name, email, subject, message } = parsed.data;

    try {
        // Send email to admin/support
        await sendEmail({
            to: env.EMAIL_FROM || "support@ragnaroktradehub.com", // Fallback or config
            subject: `[Support] ${subject}`,
            html: `
                <h3>New Support Message</h3>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p>${message.replace(/\n/g, "<br>")}</p>
            `,
        });

        // Send confirmation to user
        await sendEmail({
            to: email,
            subject: "We received your message - Ragnarok TradeHub",
            html: `
                <h3>Hello ${name},</h3>
                <p>We have received your support request regarding "<strong>${subject}</strong>".</p>
                <p>Our team will get back to you as soon as possible.</p>
                <br />
                <p>Best regards,</p>
                <p>Ragnarok TradeHub Team</p>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Support message failed:", error);
        return { error: { root: ["Failed to send message. Please try again later."] } };
    }
}
