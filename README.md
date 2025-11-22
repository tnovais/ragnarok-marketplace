# Ragnarok TradeHub 🛡️💰

A modern, secure, and feature-rich marketplace for Ragnarok Online players to trade Zeny, items, and accounts. Built with Next.js 15, Drizzle ORM, and Docker.

## 🚀 Features

-   **Marketplace**: Buy and sell items/zeny with a clean UI.
-   **Secure Transactions**: Escrow system ensures safety for both buyers and sellers.
-   **Real-time Chat**: Instant messaging between parties using Socket.io & Redis.
-   **Advanced Search**: Typo-tolerant instant search powered by Meilisearch.
-   **Dispute System**: Built-in mediation tools for admins.
-   **Supplier Portal**: Dedicated area for verified suppliers.
-   **Authentication**: Secure login via NextAuth.js (Email & Google).

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (App Router), TailwindCSS, Shadcn/UI, Lucide Icons.
-   **Backend**: Next.js Server Actions.
-   **Database**: MySQL 8.0 (managed via Drizzle ORM).
-   **Real-time**: Socket.io, Redis.
-   **Search**: Meilisearch.
-   **Infrastructure**: Docker Compose.

## 📦 Getting Started

### Prerequisites

-   Node.js 18+
-   Docker & Docker Compose

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/ragnarok-tradehub.git
    cd ragnarok-tradehub
    ```

2.  **Setup Environment**:
    Copy `.env.example` to `.env` and fill in your secrets.
    ```bash
    cp .env.example .env
    ```

3.  **Start Infrastructure (DB, Redis, Meilisearch, Socket Server)**:
    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies**:
    ```bash
    npm install
    ```

5.  **Run Migrations**:
    ```bash
    npx drizzle-kit push
    ```

6.  **Start Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

### 🔄 Syncing Search Index

To enable advanced search, you need to sync existing database listings to Meilisearch:

```bash
npx tsx scripts/sync-search.ts
```

## 🛡️ Security & Best Practices

-   **Rate Limiting**: API routes are protected against abuse.
-   **Input Validation**: All inputs are validated using Zod.
-   **Type Safety**: Full TypeScript support across the stack.
-   **No Hardcoded Secrets**: All sensitive data is managed via environment variables.

## 📂 Project Structure

-   `src/app`: Next.js App Router pages.
-   `src/components`: Reusable UI components.
-   `src/db`: Database schema and connection.
-   `src/server/actions`: Server Actions for backend logic.
-   `src/socket-server`: Standalone Socket.io server.
-   `src/lib`: Utility functions (search, socket, utils).

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
