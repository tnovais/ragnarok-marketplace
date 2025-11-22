import { MeiliSearch } from 'meilisearch';
import { env } from '@/env';

// Global client to prevent multiple connections in dev
const globalForMeili = global as unknown as { meiliClient: MeiliSearch | undefined };

export const meiliClient = globalForMeili.meiliClient ?? new MeiliSearch({
    host: env.MEILI_HOST || 'http://localhost:7700',
    apiKey: env.MEILI_MASTER_KEY,
});

if (process.env.NODE_ENV !== 'production') {
    globalForMeili.meiliClient = meiliClient;
}

export const LISTINGS_INDEX = 'listings';

// Ensure index exists and set settings (can be called on app start or via script)
export async function setupMeili() {
    try {
        const index = meiliClient.index(LISTINGS_INDEX);
        await index.updateFilterableAttributes(['serverId', 'categoryId', 'price', 'isActive', 'isSold']);
        await index.updateSortableAttributes(['createdAt', 'price']);
        await index.updateSearchableAttributes(['title', 'itemName', 'description']);
        console.log("Meilisearch settings updated");
    } catch (error) {
        console.error("Meilisearch setup failed:", error);
    }
}
