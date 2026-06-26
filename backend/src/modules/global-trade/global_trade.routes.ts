import { Router } from 'express';
import globalTradeController from './global_trade.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Global Trade Routes — /api/global-trade
// ============================================================

/**
 * @route   GET /api/global-trade
 * @desc    List all active global trade listings (paginated, filterable)
 * @access  Public
 * @query   page, limit, search, country, category
 */
router.get('/', globalTradeController.listListings);

/**
 * @route   GET /api/global-trade/my
 * @desc    Get current user's global trade listings
 * @access  Private
 */
router.get('/my', authenticate, globalTradeController.getMyListings);

/**
 * @route   GET /api/global-trade/:id
 * @desc    Get a listing by ID
 * @access  Public
 */
router.get('/:id', globalTradeController.getListingById);

/**
 * @route   POST /api/global-trade
 * @desc    Create a new global trade listing
 * @access  Private
 * @body    { companyName, countryOfOrigin, productCategory, description, products, services, ... }
 */
router.post('/', authenticate, globalTradeController.createListing);

/**
 * @route   PATCH /api/global-trade/:id
 * @desc    Update a global trade listing (owner or admin)
 * @access  Private
 */
router.patch('/:id', authenticate, globalTradeController.updateListing);

/**
 * @route   PUT /api/global-trade/:id
 * @desc    Full update a global trade listing (alias)
 * @access  Private
 */
router.put('/:id', authenticate, globalTradeController.updateListing);

/**
 * @route   DELETE /api/global-trade/:id
 * @desc    Delete a global trade listing (owner or admin)
 * @access  Private
 */
router.delete('/:id', authenticate, globalTradeController.deleteListing);

export default router;
