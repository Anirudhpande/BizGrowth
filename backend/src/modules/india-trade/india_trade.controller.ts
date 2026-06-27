import { Request, Response } from 'express';
import IndiaTrade from './india_trade.model';

// ============================================================
// India Trade Controller — /api/india-trade
// ============================================================

const indiaTradeController = {
  /**
   * @route   GET /api/india-trade
   * @desc    List all active India trade listings (paginated, filterable)
   * @access  Public
   */
  async listListings(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, state, category, targetMarket } = req.query;
      const result = await IndiaTrade.list({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
        search: search as string,
        state: state as string,
        category: category as string,
        targetMarket: targetMarket as string,
      });

      const totalPages = Math.ceil(result.total / (limit ? parseInt(limit as string) : 12));

      res.status(200).json({
        success: true,
        data: result.listings,
        pagination: {
          total: result.total,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 12,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   GET /api/india-trade/my
   * @desc    Get current user's India trade listings
   * @access  Private
   */
  async getMyListings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const listings = await IndiaTrade.findByUserId(userId);
      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   GET /api/india-trade/:id
   * @desc    Get a single India trade listing by ID
   * @access  Public
   */
  async getListingById(req: Request, res: Response): Promise<void> {
    try {
      const listing = await IndiaTrade.findById(req.params.id as string);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      await IndiaTrade.incrementViews(req.params.id as string);
      res.status(200).json({ success: true, data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   POST /api/india-trade
   * @desc    Create a new India trade listing
   * @access  Private
   */
  async createListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { companyName, indianState, productCategory, description } = req.body;
      if (!companyName || !indianState || !productCategory || !description) {
        res.status(400).json({
          success: false,
          message: 'Company name, Indian state, product category, and description are required.',
        });
        return;
      }

      const listing = await IndiaTrade.create(userId, req.body);
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   PATCH /api/india-trade/:id
   * @desc    Update an India trade listing (owner or admin)
   * @access  Private
   */
  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const existing = await IndiaTrade.findById(req.params.id as string);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      const updated = await IndiaTrade.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   DELETE /api/india-trade/:id
   * @desc    Delete an India trade listing (owner or admin)
   * @access  Private
   */
  async deleteListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const existing = await IndiaTrade.findById(req.params.id as string);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      await IndiaTrade.delete(req.params.id as string);
      res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },
};

export default indiaTradeController;
