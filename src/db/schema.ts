import {
    mysqlTable,
    varchar,
    text,
    int,
    decimal,
    boolean,
    timestamp,
    json,
    serial,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Users
export const users = mysqlTable("users", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    email: varchar("email", { length: 255 }).unique(),
    password: varchar("password", { length: 255 }),
    name: varchar("name", { length: 255 }),
    image: varchar("image", { length: 255 }),
    walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
    reputation: decimal("reputation", { precision: 3, scale: 2 }).default("5.00"),
    totalSales: int("total_sales").default(0),
    totalPurchases: int("total_purchases").default(0),
    isActive: boolean("is_active").default(true),
    isSupplier: boolean("is_supplier").default(false),
    isAdmin: boolean("is_admin").default(false),
    cpf: varchar("cpf", { length: 14 }).unique(), // Format: 000.000.000-00
    emailVerified: timestamp("email_verified"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Accounts (for NextAuth providers)
export const accounts = mysqlTable("accounts", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
});

// Servers
export const servers = mysqlTable("servers", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    isActive: boolean("is_active").default(true),
});

// Categories
export const categories = mysqlTable("categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
});

// Listings
export const listings = mysqlTable("listings", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    sellerId: varchar("seller_id", { length: 255 }).notNull().references(() => users.id),
    categoryId: int("category_id").notNull().references(() => categories.id),
    serverId: int("server_id").notNull().references(() => servers.id),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    type: varchar("type", { length: 50 }).notNull().default("item"), // item, zeny, account
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    itemName: varchar("item_name", { length: 100 }).notNull(),
    screenshots: json("screenshots").$type<string[]>().default([]),
    isPromoted: boolean("is_promoted").default(false),
    isOfficial: boolean("is_official").default(false),
    isActive: boolean("is_active").default(true),
    isSold: boolean("is_sold").default(false),
    promotedUntil: timestamp("promoted_until"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Transactions
export const transactions = mysqlTable("transactions", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    listingId: varchar("listing_id", { length: 36 }).notNull().references(() => listings.id),
    buyerId: varchar("buyer_id", { length: 255 }).notNull().references(() => users.id),
    sellerId: varchar("seller_id", { length: 255 }).notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
    netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    paymentMethod: varchar("payment_method", { length: 50 }).default("pix"),
    paymentId: varchar("payment_id", { length: 255 }),
    buyerEvidence: json("buyer_evidence").$type<string[]>().default([]),
    sellerEvidence: json("seller_evidence").$type<string[]>().default([]),
    buyerConfirmed: boolean("buyer_confirmed").default(false),
    sellerConfirmed: boolean("seller_confirmed").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Disputes
export const disputes = mysqlTable("disputes", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    transactionId: varchar("transaction_id", { length: 36 }).notNull().references(() => transactions.id),
    reporterId: varchar("reporter_id", { length: 255 }).notNull().references(() => users.id),
    reason: text("reason").notNull(),
    evidence: json("evidence").$type<string[]>().default([]),
    status: varchar("status", { length: 50 }).notNull().default("open"),
    resolution: text("resolution"),
    resolvedBy: varchar("resolved_by", { length: 255 }),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = mysqlTable("reviews", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    transactionId: varchar("transaction_id", { length: 36 }).notNull().references(() => transactions.id),
    reviewerId: varchar("reviewer_id", { length: 255 }).notNull().references(() => users.id),
    revieweeId: varchar("reviewee_id", { length: 255 }).notNull().references(() => users.id),
    rating: int("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawals
export const withdrawals = mysqlTable("withdrawals", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    bankAccount: varchar("bank_account", { length: 255 }).notNull(),
    pixKey: varchar("pix_key", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Deposits
export const deposits = mysqlTable("deposits", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
    paymentId: varchar("payment_id", { length: 255 }), // MercadoPago ID
    qrCode: text("qr_code"), // Copy/Paste code
    qrCodeBase64: text("qr_code_base64"), // QR Image
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Supplier Offers
export const supplierOffers = mysqlTable("supplier_offers", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    supplierId: varchar("supplier_id", { length: 255 }).notNull().references(() => users.id),
    itemName: varchar("item_name", { length: 100 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    categoryId: int("category_id").notNull().references(() => categories.id),
    serverId: int("server_id").notNull().references(() => servers.id),
    status: varchar("status", { length: 50 }).default("pending"),
    acceptedQuantity: int("accepted_quantity"),
    adminNotes: text("admin_notes"),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages
export const messages = mysqlTable("messages", {
    id: varchar("id", { length: 36 }).primaryKey().notNull(), // UUID
    transactionId: varchar("transaction_id", { length: 36 }).notNull().references(() => transactions.id),
    senderId: varchar("sender_id", { length: 255 }).notNull().references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    listings: many(listings),
    purchases: many(transactions, { relationName: "buyer" }),
    sales: many(transactions, { relationName: "seller" }),
    reviews: many(reviews, { relationName: "reviewer" }),
    receivedReviews: many(reviews, { relationName: "reviewee" }),
    withdrawals: many(withdrawals),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
    seller: one(users, {
        fields: [listings.sellerId],
        references: [users.id],
    }),
    category: one(categories, {
        fields: [listings.categoryId],
        references: [categories.id],
    }),
    server: one(servers, {
        fields: [listings.serverId],
        references: [servers.id],
    }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    listing: one(listings, {
        fields: [transactions.listingId],
        references: [listings.id],
    }),
    buyer: one(users, {
        fields: [transactions.buyerId],
        references: [users.id],
        relationName: "buyer",
    }),
    seller: one(users, {
        fields: [transactions.sellerId],
        references: [users.id],
        relationName: "seller",
    }),
    disputes: many(disputes),
    reviews: many(reviews),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
    transaction: one(transactions, {
        fields: [disputes.transactionId],
        references: [transactions.id],
    }),
    reporter: one(users, {
        fields: [disputes.reporterId],
        references: [users.id],
    }),
}));


export const reviewsRelations = relations(reviews, ({ one }) => ({
    transaction: one(transactions, {
        fields: [reviews.transactionId],
        references: [transactions.id],
    }),
    reviewer: one(users, {
        fields: [reviews.reviewerId],
        references: [users.id],
        relationName: "reviewer",
    }),
    reviewee: one(users, {
        fields: [reviews.revieweeId],
        references: [users.id],
        relationName: "reviewee",
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    transaction: one(transactions, {
        fields: [messages.transactionId],
        references: [transactions.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
}));

// Types
export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Server = typeof servers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type SupplierOffer = typeof supplierOffers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Account = typeof accounts.$inferSelect;
