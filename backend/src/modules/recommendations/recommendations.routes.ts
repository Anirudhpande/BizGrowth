import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getRecommendations } from './recommendations.controller';

const router = Router();

/**
 * @route  GET /api/recommendations
 * @desc   Get AI-powered B2B opportunity recommendations for the logged-in user
 * @access Private
 */
router.get('/', authenticate, getRecommendations);

export default router;
