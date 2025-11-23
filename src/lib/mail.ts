import { Resend } from 'resend';
import { env } from '@/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
    react,
}: {
    to: string;
    subject: string;
    html?: string;
    react?: React.ReactNode;
}) {
    if (env.NODE_ENV === 'development' && !env.RESEND_API_KEY?.startsWith('re_')) {
        console.log("📧 [DEV] Email Mock:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`HTML: ${html}`);
        return { success: true };
    }

    try {
        const data = await resend.emails.send({
            from: env.EMAIL_FROM,
            to,
            subject,
            html: html || '',
            react,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { success: false, error };
    }
}
