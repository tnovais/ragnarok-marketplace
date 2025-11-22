# 🚀 Deployment Guide - Ragnarok TradeHub

This guide explains how to deploy the Ragnarok TradeHub application to production.

## 📋 Prerequisites

-   **Docker & Docker Compose**: For containerized deployment (Recommended).
-   **Node.js 18+**: For manual deployment.
-   **MySQL 8.0+**: Database.
-   **Redis**: For session/socket management.
-   **Meilisearch**: For search engine.

---

## 🐳 Option 1: Docker Deployment (Recommended)

This is the easiest way to run the full stack (App, DB, Redis, Search, Socket).

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd ragnarok-tradehub
    ```

2.  **Configure Environment**
    Copy `.env.example` to `.env` and fill in **production** values.
    ```bash
    cp .env.example .env
    ```
    > ⚠️ **IMPORTANT**: Change `NEXTAUTH_SECRET`, `MP_ACCESS_TOKEN`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` to real production values.

3.  **Build and Start**
    ```bash
    docker-compose up -d --build
    ```

4.  **Run Database Migrations**
    ```bash
    npx drizzle-kit push
    ```

5.  **Sync Search Index**
    ```bash
    npx tsx scripts/sync-search.ts
    ```

The app will be available at `http://localhost:3000` (or your server IP).

---

## 🛠️ Option 2: Manual Deployment (Vercel / VPS)

### 1. Database & Services
You need to host these services separately (e.g., on AWS, DigitalOcean, or managed providers like Upstash/PlanetScale):
-   MySQL Database
-   Redis Instance
-   Meilisearch Instance

### 2. Environment Variables
Set all variables from `.env.example` in your hosting provider's dashboard.

### 3. Build & Run
```bash
npm install
npm run build
npm start
```

---

## 🛡️ Security Checklist

-   [ ] **HTTPS**: Ensure your domain has SSL configured (e.g., via Nginx or Cloudflare).
-   [ ] **Secrets**: Never commit `.env` to Git.
-   [ ] **Database**: Use a strong password for MySQL.
-   [ ] **Backups**: Configure automated backups for your MySQL database.

## 🔄 Updates

To update the application:
1.  `git pull`
2.  `docker-compose up -d --build`
3.  `npx drizzle-kit push` (if schema changed)
