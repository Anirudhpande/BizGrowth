import { Review, IReview } from './reviews.model';

export class ReviewsService {
  /**
   * Create a new review
   */
  async createReview(reviewData: Partial<IReview>): Promise<IReview> {
    try {
      const review = new Review(reviewData);
      return await review.save();
    } catch (error) {
      throw new Error(`Failed to create review: ${error}`);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(reviewId);
  }

  /**
   * Get all reviews for a consultant
   */
  async getConsultantReviews(
    consultantId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    const reviews = await Review.find({ consultantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ consultantId });

    return { reviews, total };
  }

  /**
   * Get all reviews by a client
   */
  async getClientReviews(
    clientId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ reviews: IReview[]; total: number }> {
    const reviews = await Review.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ clientId });

    return { reviews, total };
  }

  /**
   * Get average rating for a consultant
   */
  async getConsultantAverageRating(consultantId: string): Promise<number> {
    const result = await Review.aggregate([
      { $match: { consultantId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  }

  /**
   * Get rating distribution for a consultant
   */
  async getRatingDistribution(
    consultantId: string
  ): Promise<{ [key: number]: number }> {
    const result = await Review.aggregate([
      { $match: { consultantId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }

    result.forEach((item) => {
      distribution[item._id] = item.count;
    });

    return distribution;
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    const result = await Review.findByIdAndDelete(reviewId);
    return !!result;
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );
  }

  /**
   * Check if review exists for booking
   */
  async reviewExistsForBooking(bookingId: string): Promise<boolean> {
    const review = await Review.findOne({ bookingId });
    return !!review;
  }
}