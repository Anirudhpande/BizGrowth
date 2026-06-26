import { Router } from 'express';
import indiaTradeController from './india_trade.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// India Trade Routes — /api/india-trade
// ============================================================

/**
 * @route   GET /api/india-trade
 * @desc    List all active India trade listings (paginated, filterable)
 * @access  Public
 * @query   page, limit, search, state, category, targetMarket
 */
router.get('/', indiaTradeController.listListings);

/**
 * @route   GET /api/india-trade/my
 * @desc    Get current user's India trade listings
 * @access  Private
 */
router.get('/my', authenticate, indiaTradeController.getMyListings);

/**
 * @route   GET /api/india-trade/:id
 * @desc    Get a listing by ID
 * @access  Public
 */
router.get('/:id', indiaTradeController.getListingById);

/**
 * @route   POST /api/india-trade
 * @desc    Create a new India trade listing
 * @access  Private
 * @body    { companyName, indianState, city, productCategory, description, products, services, ... }
 */
router.post('/', authenticate, indiaTradeController.createListing);

/**
 * @route   PATCH /api/india-trade/:id
 * @desc    Update an India trade listing (owner or admin)
 * @access  Private
 */
router.patch('/:id', authenticate, indiaTradeController.updateListing);

/**
 * @route   PUT /api/india-trade/:id
 * @desc    Full update an India trade listing (alias)
 * @access  Private
 */
router.put('/:id', authenticate, indiaTradeController.updateListing);

/**
 * @route   DELETE /api/india-trade/:id
 * @desc    Delete an India trade listing (owner or admin)
 * @access  Private
 */
router.delete('/:id', authenticate, indiaTradeController.deleteListing);

export default router;
