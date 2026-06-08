import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';

const reviewsService = new ReviewsService();

export class ReviewsController {
  /**
   * POST /api/reviews
   * Create a new review
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, consultantId, clientId, rating, title, comment } = req.body;

      // Validate required fields
      if (!bookingId || !consultantId || !clientId || !rating || !comment) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      // Check if review already exists for this booking
      const exists = await reviewsService.reviewExistsForBooking(bookingId);
      if (exists) {
        res.status(409).json({ error: 'Review already exists for this booking' });
        return;
      }

      const review = await reviewsService.createReview({
        bookingId,
        consultantId,
        clientId,
        rating,
        title,
        comment,
      });

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to create review: ${error}` });
    }
  }

  /**
   * GET /api/reviews/:reviewId
   * Get review by ID
   */
  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const review = await reviewsService.getReviewById(reviewId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch review: ${error}` });
    }
  }

  /**
   * GET /api/reviews/consultant/:consultantId
   * Get all reviews for a consultant
   */
  async getConsultantReviews(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const { reviews, total } = await reviewsService.getConsultantReviews(
        consultantId,
        limit,
        skip
      );

      res.json({
        reviews,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch reviews: ${error}` });
    }
  }

  /**
   * GET /api/reviews/client/:clientId
   * Get all reviews by a client
   */
  async getClientReviews(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const { reviews, total } = await reviewsService.getClientReviews(
        clientId,
        limit,
        skip
      );

      res.json({
        reviews,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch reviews: ${error}` });
    }
  }

  /**
   * GET /api/reviews/consultant/:consultantId/stats
   * Get consultant review statistics
   */
  async getConsultantStats(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId } = req.params;

      const averageRating = await reviewsService.getConsultantAverageRating(consultantId);
      const distribution = await reviewsService.getRatingDistribution(consultantId);
      const { total } = await reviewsService.getConsultantReviews(consultantId, 1, 0);

      res.json({
        averageRating,
        totalReviews: total,
        distribution,
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch stats: ${error}` });
    }
  }

  /**
   * PATCH /api/reviews/:reviewId
   * Update review
   */
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;

      const review = await reviewsService.updateReview(reviewId, updateData);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to update review: ${error}` });
    }
  }

  /**
   * DELETE /api/reviews/:reviewId
   * Delete review
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const deleted = await reviewsService.deleteReview(reviewId);

      if (!deleted) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete review: ${error}` });
    }
  }

  /**
   * POST /api/reviews/:reviewId/helpful
   * Mark review as helpful
   */
  async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const review = await reviewsService.markHelpful(reviewId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: `Failed to mark review as helpful: ${error}` });
    }
  }
}