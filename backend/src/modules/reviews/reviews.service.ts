import db from '../../config/db';
import { IReview } from './reviews.model';

const REVIEWS_TABLE = 'reviews';

export class ReviewsService {
  /**
   * Create a new review
   */
  async createReview(reviewData: Partial<IReview>): Promise<IReview> {
    try {
      const columns = Object.keys(reviewData).join(', ');
      const placeholders = Object.keys(reviewData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(reviewData);

      const res = await db.query(
        `INSERT INTO ${REVIEWS_TABLE} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return res.rows[0];
    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<IReview | null> {
    try {
      const res = await db.query(`SELECT * FROM ${REVIEWS_TABLE} WHERE id = $1`, [reviewId]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch review: ${error}`);
      return null;
    }
  }

  /**
   * Get all reviews for a consultant
   */
  async getConsultantReviews(
    consultantId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${REVIEWS_TABLE} WHERE consultant_id = $1`, [consultantId]);
      const total = parseInt(countRes.rows[0].count, 10);

      const res = await db.query(
        `SELECT * FROM ${REVIEWS_TABLE} WHERE consultant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [consultantId, limit, skip]
      );
      
      return { reviews: res.rows, total };
    } catch (error) {
      console.error(`Failed to fetch reviews: ${error}`);
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Get all reviews by a client
   */
  async getClientReviews(
    clientId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${REVIEWS_TABLE} WHERE client_id = $1`, [clientId]);
      const total = parseInt(countRes.rows[0].count, 10);

      const res = await db.query(
        `SELECT * FROM ${REVIEWS_TABLE} WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [clientId, limit, skip]
      );
      
      return { reviews: res.rows, total };
    } catch (error) {
      console.error(`Failed to fetch reviews: ${error}`);
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Get average rating for a consultant
   */
  async getConsultantAverageRating(consultantId: string): Promise<number> {
    try {
      const res = await db.query(
        `SELECT AVG(rating) as average_rating FROM ${REVIEWS_TABLE} WHERE consultant_id = $1`,
        [consultantId]
      );
      
      if (!res.rows[0].average_rating) return 0;
      return Math.round(parseFloat(res.rows[0].average_rating) * 10) / 10;
    } catch (error) {
      console.error(`Failed to fetch average rating: ${error}`);
      return 0;
    }
  }

  /**
   * Get rating distribution for a consultant
   */
  async getRatingDistribution(
    consultantId: string
  ): Promise<{ [key: number]: number }> {
    try {
      const res = await db.query(
        `SELECT rating FROM ${REVIEWS_TABLE} WHERE consultant_id = $1`,
        [consultantId]
      );

      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      res.rows.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating]++;
        }
      });

      return distribution;
    } catch (error) {
      console.error(`Failed to fetch rating distribution: ${error}`);
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null> {
    try {
      const setClauses = Object.keys(updateData)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');
      const values = [reviewId, ...Object.values(updateData)];

      const res = await db.query(
        `UPDATE ${REVIEWS_TABLE} SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        values
      );

      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to update review: ${error}`);
      return null;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      await db.query(`DELETE FROM ${REVIEWS_TABLE} WHERE id = $1`, [reviewId]);
      return true;
    } catch (error) {
      console.error(`Failed to delete review: ${error}`);
      return false;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<IReview | null> {
    try {
      const res = await db.query(
        `UPDATE ${REVIEWS_TABLE} SET helpful = COALESCE(helpful, 0) + 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [reviewId]
      );

      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to mark review as helpful: ${error}`);
      return null;
    }
  }

  /**
   * Check if review exists for booking
   */
  async reviewExistsForBooking(bookingId: string): Promise<boolean> {
    try {
      const res = await db.query(
        `SELECT id FROM ${REVIEWS_TABLE} WHERE booking_id = $1 LIMIT 1`,
        [bookingId]
      );
      return res.rows.length > 0;
    } catch (error) {
      return false;
    }
  }
}
