import { Request, Response } from 'express';
import Product from './product.model';

const productController = {
  /**
   * @route   GET /api/products
   * @desc    List all active product listings (paginated, filterable)
   * @access  Public
   */
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, category, targetMarket } = req.query;
      const result = await Product.list({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
        search: search as string,
        category: category as string,
        targetMarket: targetMarket as string,
      });

      const totalPages = Math.ceil(result.total / (limit ? parseInt(limit as string) : 12));

      res.status(200).json({
        success: true,
        data: result.products,
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
   * @route   GET /api/products/my
   * @desc    Get current user's product listings
   * @access  Private
   */
  async getMyProducts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const products = await Product.findByUserId(userId);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   GET /api/products/:id
   * @desc    Get a single product listing by ID
   * @access  Public
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findById(req.params.id as string);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      await Product.incrementViews(req.params.id as string);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   POST /api/products
   * @desc    Create a new product listing
   * @access  Private
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { name, price, category, targetMarket } = req.body;
      if (!name || price === undefined || !category || !targetMarket) {
        res.status(400).json({
          success: false,
          message: 'Product name, price, category, and target market are required.',
        });
        return;
      }

      const product = await Product.create(userId, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   PATCH /api/products/:id
   * @desc    Update a product listing (owner or admin)
   * @access  Private
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const existing = await Product.findById(req.params.id as string);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      const updated = await Product.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },

  /**
   * @route   DELETE /api/products/:id
   * @desc    Delete a product listing (owner or admin)
   * @access  Private
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const existing = await Product.findById(req.params.id as string);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      if (existing.userId !== userId && userRole !== 'admin') {
        res.status(403).json({ success: false, message: 'Forbidden: not the owner' });
        return;
      }

      await Product.delete(req.params.id as string);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  },
};

export default productController;
