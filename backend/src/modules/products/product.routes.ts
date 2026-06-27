import { Router } from 'express';
import productController from './product.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Product Routes — /api/products
// ============================================================

/**
 * @route   GET /api/products
 * @desc    List all active product listings (paginated, filterable)
 * @access  Public
 * @query   page, limit, search, category, targetMarket
 */
router.get('/', productController.listProducts);

/**
 * @route   GET /api/products/my
 * @desc    Get current user's product listings
 * @access  Private
 */
router.get('/my', authenticate, productController.getMyProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a product listing by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product listing
 * @access  Private
 */
router.post('/', authenticate, productController.createProduct);

/**
 * @route   PATCH /api/products/:id
 * @desc    Update a product listing (owner or admin)
 * @access  Private
 */
router.patch('/:id', authenticate, productController.updateProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Full update a product listing (alias)
 * @access  Private
 */
router.put('/:id', authenticate, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product listing (owner or admin)
 * @access  Private
 */
router.delete('/:id', authenticate, productController.deleteProduct);

export default router;
