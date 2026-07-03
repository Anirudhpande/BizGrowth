import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import db from '../../config/db';

/**
 * GET /api/recommendations
 *
 * Returns up to 6 marketplace listings that are relevant to the
 * authenticated user based on:
 *   1. Their own profile's industry
 *   2. The industries of listings they have previously created
 *   3. Recency (listings posted in the last 60 days rank higher)
 *
 * Falls back to the most-viewed recent listings if the user has no
 * industry signal yet.
 */
export async function getRecommendations(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.userId;

    // 1. Gather the user's industry signals from their profile + own listings
    const signalRes = await db.query(
      `SELECT DISTINCT industry FROM (
         SELECT industry FROM public.profiles   WHERE auth_user_id = $1 AND industry <> ''
         UNION ALL
         SELECT industry FROM public.listings   WHERE user_id = $1 AND industry <> ''
         UNION ALL
         SELECT industry FROM public.organizations WHERE user_id = $1 AND industry <> ''
       ) AS signals
       WHERE industry IS NOT NULL`,
      [userId]
    );

    const industries: string[] = signalRes.rows.map((r: { industry: string }) => r.industry);

    let listings: any[] = [];

    if (industries.length > 0) {
      // 2a. Industry-matched recommendations (exclude user's own listings)
      const matched = await db.query(
        `SELECT id, title, description, type, industry, tags, views, created_at, user_id
         FROM public.listings
         WHERE status = 'active'
           AND user_id <> $1
           AND industry = ANY($2::text[])
           AND created_at >= NOW() - INTERVAL '60 days'
         ORDER BY views DESC, created_at DESC
         LIMIT 6`,
        [userId, industries]
      );
      listings = matched.rows;
    }

    // 2b. If not enough industry matches, pad with most-viewed recent listings
    if (listings.length < 6) {
      const exclude = [userId, ...listings.map((l: any) => l.id)];
      const fallback = await db.query(
        `SELECT id, title, description, type, industry, tags, views, created_at, user_id
         FROM public.listings
         WHERE status = 'active'
           AND user_id <> $1
           AND id <> ALL($2::uuid[])
         ORDER BY views DESC, created_at DESC
         LIMIT $3`,
        [userId, exclude.length > 1 ? exclude.slice(1) : ['00000000-0000-0000-0000-000000000000'], 6 - listings.length]
      );
      listings = [...listings, ...fallback.rows];
    }

    res.status(200).json({
      success: true,
      industries,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
