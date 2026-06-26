import { Request, Response } from 'express';
import GlobalTrade from './global_trade.model';

// ============================================================
// Global Trade Controller — /api/global-trade
// ============================================================

const globalTradeController = {
  /**
   * @route   GET /api/global-trade
   * @desc    List all active global trade listings (paginated, filterable)
   * @access  Public
   */
  async listListings(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, country, category } = req.query;
      const result = await GlobalTrade.list({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
        search: search as string,
        country: country as string,
        category: category as string,
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
   * @route   GET /api/global-trade/my
   * @desc    Get current user's global trade listings
   * @access  Private
   */
  async getMyListings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const listings = await GlobalTrade.findByUserId(userId);
      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   GET /api/global-trade/:id
   * @desc    Get a single global trade listing by ID
   * @access  Public
   */
  async getListingById(req: Request, res: Response): Promise<void> {
    try {
      const listing = await GlobalTrade.findById(req.params.id);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      await GlobalTrade.incrementViews(req.params.id);
      res.status(200).json({ success: true, data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   POST /api/global-trade
   * @desc    Create a new global trade listing
   * @access  Private
   */
  async createListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { companyName, countryOfOrigin, productCategory, description } = req.body;
      if (!companyName || !countryOfOrigin || !productCategory || !description) {
        res.status(400).json({
          success: false,
          message: 'Company name, country of origin, product category, and description are required.',
        });
        return;
      }

      const listing = await GlobalTrade.create(userId, req.body);
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   PATCH /api/global-trade/:id
   * @desc    Update a global trade listing (owner or admin)
   * @access  Private
   */
  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const existing = await GlobalTrade.findById(req.params.id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      const updated = await GlobalTrade.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   DELETE /api/global-trade/:id
   * @desc    Delete a global trade listing (owner or admin)
   * @access  Private
   */
  async deleteListing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const existing = await GlobalTrade.findById(req.params.id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      await GlobalTrade.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },
};

export default globalTradeController;
