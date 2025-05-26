import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  reputation: decimal("reputation", { precision: 3, scale: 2 }).default("5.00"),
  totalSales: integer("total_sales").default(0),
  totalPurchases: integer("total_purchases").default(0),
  isActive: boolean("is_active").default(true),
  isSupplier: boolean("is_supplier").default(false), // New: for suppliers who can sell to the site
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server listings for Ragnarok Online
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
});

// Item categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

// Marketplace listings
export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  serverId: integer("server_id").notNull().references(() => servers.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  screenshots: jsonb("screenshots").$type<string[]>().default([]),
  isPromoted: boolean("is_promoted").default(false),
  isOfficial: boolean("is_official").default(false),
  isActive: boolean("is_active").default(true),
  isSold: boolean("is_sold").default(false),
  promotedUntil: timestamp("promoted_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").notNull().references(() => listings.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, paid, delivered, completed, disputed, cancelled
  paymentMethod: varchar("payment_method", { length: 50 }).default("pix"),
  paymentId: varchar("payment_id"), // Mock payment ID
  buyerEvidence: jsonb("buyer_evidence").$type<string[]>().default([]),
  sellerEvidence: jsonb("seller_evidence").$type<string[]>().default([]),
  buyerConfirmed: boolean("buyer_confirmed").default(false),
  sellerConfirmed: boolean("seller_confirmed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Disputes
export const disputes = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence").$type<string[]>().default([]),
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, investigating, resolved
  resolution: text("resolution"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests
export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankAccount: varchar("bank_account").notNull(),
  pixKey: varchar("pix_key").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier offers (for selling directly to the site)
export const supplierOffers = pgTable("supplier_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  serverId: integer("server_id").notNull().references(() => servers.id),
  status: varchar("status").default("pending"), // pending, accepted, rejected
  acceptedQuantity: integer("accepted_quantity"),
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Server = typeof servers.$inferSelect;
export type Category = typeof categories.$inferSelect;

// Supplier offer schemas and types
export const insertSupplierOfferSchema = createInsertSchema(supplierOffers).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type InsertSupplierOffer = z.infer<typeof insertSupplierOfferSchema>;
export type SupplierOffer = typeof supplierOffers.$inferSelect;
