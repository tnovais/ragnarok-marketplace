import MercadoPagoConfig, { Preference } from "mercadopago";
import { env } from "@/env";

// Initialize client
const client = new MercadoPagoConfig({
    accessToken: env.MP_ACCESS_TOKEN || "TEST-00000000-0000-0000-0000-000000000000",
});

export const getPaymentUrl = (preferenceId: string) => `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;

export async function createPreference({
    id,
    title,
    price,
    quantity = 1,
}: {
    id: string;
    title: string;
    price: number;
    quantity?: number;
}) {
    const preference = new Preference(client);

    try {
        const result = await preference.create({
            body: {
                items: [
                    {
                        id,
                        title,
                        unit_price: price,
                        quantity,
                        currency_id: "BRL",
                    },
                ],
                back_urls: {
                    success: `${env.NEXTAUTH_URL}/profile`,
                    failure: `${env.NEXTAUTH_URL}/listings/${id}`,
                    pending: `${env.NEXTAUTH_URL}/profile`,
                },
                auto_return: "approved",
                notification_url: `${env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
                payment_methods: {
                    excluded_payment_types: [],
                    excluded_payment_methods: [],
                    installments: 1
                },
                external_reference: id,
            },
        });

        return {
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
        };
    } catch (error) {
        console.error("Mercado Pago Preference Error:", error);
        throw error;
    }
}
