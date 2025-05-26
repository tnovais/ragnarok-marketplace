import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertListingSchema, insertTransactionSchema, insertDisputeSchema, insertReviewSchema, insertWithdrawalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Metadata routes
  app.get('/api/servers', async (req, res) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Listing routes
  app.get('/api/listings', async (req, res) => {
    try {
      const {
        serverId,
        categoryId,
        minPrice,
        maxPrice,
        search,
        isOfficial,
        isPromoted
      } = req.query;

      const filters = {
        serverId: serverId ? parseInt(serverId as string) : undefined,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string,
        isOfficial: isOfficial === 'true' ? true : isOfficial === 'false' ? false : undefined,
        isPromoted: isPromoted === 'true' ? true : isPromoted === 'false' ? false : undefined,
      };

      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const listing = await storage.getListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = insertListingSchema.parse({
        ...req.body,
        sellerId: userId,
      });

      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/user/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Transaction routes
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId, paymentMethod = 'pix' } = req.body;

      // Get listing details
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.isSold) {
        return res.status(400).json({ message: "Item already sold" });
      }

      if (listing.sellerId === userId) {
        return res.status(400).json({ message: "Cannot buy your own item" });
      }

      // Calculate fees
      const price = parseFloat(listing.price);
      const feeRate = listing.isPromoted ? 0.06 : (price >= 200 ? 0.10 : 0.15);
      const fee = price * feeRate;
      const netAmount = price - fee;

      const transactionData = insertTransactionSchema.parse({
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        amount: price.toString(),
        fee: fee.toString(),
        netAmount: netAmount.toString(),
        paymentMethod,
        paymentId: `PIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Mock payment ID
        status: 'paid', // Mock successful payment
      });

      const transaction = await storage.createTransaction(transactionData);

      // Mark listing as sold
      await storage.updateListing(listingId, { isSold: true });

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transaction = await storage.getTransaction(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Check if user is part of this transaction
      if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.patch('/api/transactions/:id/confirm', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { evidence } = req.body;

      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates: any = {};
      
      if (transaction.buyerId === userId) {
        updates.buyerConfirmed = true;
        updates.buyerEvidence = evidence || [];
      } else {
        updates.sellerConfirmed = true;
        updates.sellerEvidence = evidence || [];
      }

      // If both parties confirmed, complete the transaction
      const otherPartyConfirmed = transaction.buyerId === userId 
        ? transaction.sellerConfirmed 
        : transaction.buyerConfirmed;

      if (otherPartyConfirmed) {
        updates.status = 'completed';
        updates.completedAt = new Date();
        
        // Add money to seller's wallet
        await storage.updateUserWallet(transaction.sellerId, transaction.netAmount);
      }

      const updatedTransaction = await storage.updateTransaction(req.params.id, updates);
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error confirming transaction:", error);
      res.status(500).json({ message: "Failed to confirm transaction" });
    }
  });

  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // Dispute routes
  app.post('/api/disputes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const disputeData = insertDisputeSchema.parse({
        ...req.body,
        reporterId: userId,
      });

      const dispute = await storage.createDispute(disputeData);
      res.status(201).json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dispute data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.get('/api/disputes', isAuthenticated, async (req: any, res) => {
    try {
      // This would typically be admin-only
      const disputes = await storage.getDisputes();
      res.json(disputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/listings/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getListingReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Withdrawal routes
  app.post('/api/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const withdrawalData = insertWithdrawalSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user has sufficient balance
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.walletBalance) < parseFloat(withdrawalData.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawal(withdrawalData);
      
      // Deduct from user wallet
      await storage.updateUserWallet(userId, `-${withdrawalData.amount}`);

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid withdrawal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create withdrawal" });
    }
  });

  app.get('/api/user/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const withdrawals = await storage.getUserWithdrawals(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching user withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch user withdrawals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
