import {
  users,
  listings,
  transactions,
  disputes,
  reviews,
  withdrawals,
  servers,
  categories,
  type User,
  type UpsertUser,
  type Listing,
  type InsertListing,
  type Transaction,
  type InsertTransaction,
  type Dispute,
  type InsertDispute,
  type Review,
  type InsertReview,
  type Withdrawal,
  type InsertWithdrawal,
  type Server,
  type Category,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Listing operations
  createListing(listing: InsertListing): Promise<Listing>;
  getListings(filters?: {
    serverId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isOfficial?: boolean;
    isPromoted?: boolean;
  }): Promise<(Listing & { seller: User; server: Server; category: Category })[]>;
  getListing(id: string): Promise<(Listing & { seller: User; server: Server; category: Category }) | undefined>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  getUserListings(userId: string): Promise<(Listing & { server: Server; category: Category })[]>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<(Transaction & { listing: Listing; buyer: User; seller: User }) | undefined>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<(Transaction & { listing: Listing; buyer: User; seller: User })[]>;

  // Dispute operations
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDisputes(): Promise<(Dispute & { transaction: Transaction; reporter: User })[]>;
  updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getListingReviews(listingId: string): Promise<(Review & { reviewer: User })[]>;

  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getUserWithdrawals(userId: string): Promise<Withdrawal[]>;
  updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal>;

  // Metadata operations
  getServers(): Promise<Server[]>;
  getCategories(): Promise<Category[]>;
  
  // Update user wallet
  updateUserWallet(userId: string, amount: string): Promise<User>;
  
  // Supplier operations (sell directly to site)
  createSupplierOffer(offer: {
    supplierId: string;
    itemName: string;
    quantity: number;
    unitPrice: string;
    description: string;
    categoryId: number;
    serverId: number;
  }): Promise<any>;
  getSupplierOffers(): Promise<any[]>;
  acceptSupplierOffer(offerId: string, acceptedQuantity: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Listing operations
  async createListing(listing: InsertListing): Promise<Listing> {
    const listingData = {
      ...listing,
      screenshots: Array.isArray(listing.screenshots) ? listing.screenshots : []
    };
    const [newListing] = await db
      .insert(listings)
      .values(listingData)
      .returning();
    return newListing;
  }

  async getListings(filters?: {
    serverId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isOfficial?: boolean;
    isPromoted?: boolean;
  }): Promise<(Listing & { seller: User; server: Server; category: Category })[]> {
    const conditions = [eq(listings.isActive, true), eq(listings.isSold, false)];

    if (filters?.serverId) {
      conditions.push(eq(listings.serverId, filters.serverId));
    }
    if (filters?.categoryId) {
      conditions.push(eq(listings.categoryId, filters.categoryId));
    }
    if (filters?.minPrice) {
      conditions.push(gte(listings.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(listings.price, filters.maxPrice.toString()));
    }
    if (filters?.search) {
      conditions.push(
        sql`${listings.title} ILIKE ${'%' + filters.search + '%'} OR ${listings.itemName} ILIKE ${'%' + filters.search + '%'}`
      );
    }
    if (filters?.isOfficial !== undefined) {
      conditions.push(eq(listings.isOfficial, filters.isOfficial));
    }
    if (filters?.isPromoted !== undefined) {
      conditions.push(eq(listings.isPromoted, filters.isPromoted));
    }

    const result = await db
      .select()
      .from(listings)
      .innerJoin(users, eq(listings.sellerId, users.id))
      .innerJoin(servers, eq(listings.serverId, servers.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(listings.isPromoted), desc(listings.createdAt));
    
    return result.map(row => ({
      ...row.listings,
      seller: row.users,
      server: row.servers,
      category: row.categories,
    }));
  }

  async getListing(id: string): Promise<(Listing & { seller: User; server: Server; category: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(listings)
      .innerJoin(users, eq(listings.sellerId, users.id))
      .innerJoin(servers, eq(listings.serverId, servers.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(listings.id, id));

    if (!result) return undefined;

    return {
      ...result.listings,
      seller: result.users,
      server: result.servers,
      category: result.categories,
    };
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async getUserListings(userId: string): Promise<(Listing & { server: Server; category: Category })[]> {
    const result = await db
      .select()
      .from(listings)
      .innerJoin(servers, eq(listings.serverId, servers.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(listings.sellerId, userId))
      .orderBy(desc(listings.createdAt));

    return result.map(row => ({
      ...row.listings,
      server: row.servers,
      category: row.categories,
    }));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values([transaction])
      .returning();
    return newTransaction;
  }

  async getTransaction(id: string): Promise<(Transaction & { listing: Listing; buyer: User; seller: User }) | undefined> {
    const [result] = await db
      .select()
      .from(transactions)
      .innerJoin(listings, eq(transactions.listingId, listings.id))
      .innerJoin(users, eq(transactions.buyerId, users.id))
      .innerJoin(users, eq(transactions.sellerId, users.id))
      .where(eq(transactions.id, id));

    if (!result) return undefined;

    return {
      ...result.transactions,
      listing: result.listings,
      buyer: result.users,
      seller: result.users,
    };
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<(Transaction & { listing: Listing; buyer: User; seller: User })[]> {
    const result = await db
      .select()
      .from(transactions)
      .innerJoin(listings, eq(transactions.listingId, listings.id))
      .innerJoin(users, eq(transactions.buyerId, users.id))
      .innerJoin(users, eq(transactions.sellerId, users.id))
      .where(sql`${transactions.buyerId} = ${userId} OR ${transactions.sellerId} = ${userId}`)
      .orderBy(desc(transactions.createdAt));

    return result.map(row => ({
      ...row.transactions,
      listing: row.listings,
      buyer: row.users,
      seller: row.users,
    }));
  }

  // Dispute operations
  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db
      .insert(disputes)
      .values(dispute)
      .returning();
    return newDispute;
  }

  async getDisputes(): Promise<(Dispute & { transaction: Transaction; reporter: User })[]> {
    const result = await db
      .select()
      .from(disputes)
      .innerJoin(transactions, eq(disputes.transactionId, transactions.id))
      .innerJoin(users, eq(disputes.reporterId, users.id))
      .orderBy(desc(disputes.createdAt));

    return result.map(row => ({
      ...row.disputes,
      transaction: row.transactions,
      reporter: row.users,
    }));
  }

  async updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute> {
    const [dispute] = await db
      .update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return dispute;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getListingReviews(listingId: string): Promise<(Review & { reviewer: User })[]> {
    const result = await db
      .select()
      .from(reviews)
      .innerJoin(transactions, eq(reviews.transactionId, transactions.id))
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(transactions.listingId, listingId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row.reviews,
      reviewer: row.users,
    }));
  }

  // Withdrawal operations
  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values(withdrawal)
      .returning();
    return newWithdrawal;
  }

  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt));
  }

  async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal> {
    const [withdrawal] = await db
      .update(withdrawals)
      .set(updates)
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal;
  }

  // Metadata operations
  async getServers(): Promise<Server[]> {
    return await db
      .select()
      .from(servers)
      .where(eq(servers.isActive, true));
  }

  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true));
  }

  // Update user wallet
  async updateUserWallet(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        walletBalance: sql`${users.walletBalance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
