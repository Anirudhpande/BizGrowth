import db from '../../config/db';

// ============================================================
// Interfaces
// ============================================================

export interface IGlobalTradeListing {
  id: string;
  companyName: string;
  countryOfOrigin: string;
  productCategory: string;
  description: string;
  products: string[];
  services: string[];
  targetIndianMarkets: string[];
  priceRange: string;
  currency: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  certifications: string[];
  isVerified: boolean;
  status: string;
  userId: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGlobalTradeInput {
  companyName: string;
  countryOfOrigin: string;
  productCategory: string;
  description: string;
  products?: string[];
  services?: string[];
  targetIndianMarkets?: string[];
  priceRange?: string;
  currency?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  certifications?: string[];
}

export interface UpdateGlobalTradeInput {
  companyName?: string;
  countryOfOrigin?: string;
  productCategory?: string;
  description?: string;
  products?: string[];
  services?: string[];
  targetIndianMarkets?: string[];
  priceRange?: string;
  currency?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  certifications?: string[];
  status?: string;
}

export interface GlobalTradeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  category?: string;
}

// ============================================================
// Row ↔ Application Mapping
// ============================================================

function mapRowToListing(row: any): IGlobalTradeListing {
  return {
    id: row.id,
    companyName: row.company_name,
    countryOfOrigin: row.country_of_origin || '',
    productCategory: row.product_category || '',
    description: row.description || '',
    products: row.products || [],
    services: row.services || [],
    targetIndianMarkets: row.target_indian_markets || [],
    priceRange: row.price_range || '',
    currency: row.currency || 'USD',
    website: row.website || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    certifications: row.certifications || [],
    isVerified: row.is_verified || false,
    status: row.status || 'active',
    userId: row.user_id,
    views: row.views || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// Global Trade Model — Data Access Layer
// ============================================================

class GlobalTradeModel {
  /**
   * Ensure the table exists (soft migration).
   */
  async ensureTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.global_trade_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        country_of_origin VARCHAR(100) NOT NULL,
        product_category VARCHAR(100) NOT NULL,
        description TEXT,
        products TEXT[] DEFAULT '{}',
        services TEXT[] DEFAULT '{}',
        target_indian_markets TEXT[] DEFAULT '{}',
        price_range VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'USD',
        website VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        certifications TEXT[] DEFAULT '{}',
        is_verified BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active',
        user_id UUID NOT NULL,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  async findById(id: string): Promise<IGlobalTradeListing | null> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT * FROM public.global_trade_listings WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToListing(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async findByUserId(userId: string): Promise<IGlobalTradeListing[]> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT * FROM public.global_trade_listings WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map(mapRowToListing);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async create(userId: string, input: CreateGlobalTradeInput): Promise<IGlobalTradeListing> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `INSERT INTO public.global_trade_listings
          (company_name, country_of_origin, product_category, description, products, services,
           target_indian_markets, price_range, currency, website, contact_email, contact_phone,
           certifications, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          input.companyName,
          input.countryOfOrigin,
          input.productCategory,
          input.description || '',
          input.products || [],
          input.services || [],
          input.targetIndianMarkets || [],
          input.priceRange || '',
          input.currency || 'USD',
          input.website || '',
          input.contactEmail || '',
          input.contactPhone || '',
          input.certifications || [],
          userId,
        ]
      );
      return mapRowToListing(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateGlobalTradeInput): Promise<IGlobalTradeListing> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.companyName !== undefined) { updates.push(`company_name = $${idx++}`); params.push(input.companyName); }
    if (input.countryOfOrigin !== undefined) { updates.push(`country_of_origin = $${idx++}`); params.push(input.countryOfOrigin); }
    if (input.productCategory !== undefined) { updates.push(`product_category = $${idx++}`); params.push(input.productCategory); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.products !== undefined) { updates.push(`products = $${idx++}`); params.push(input.products); }
    if (input.services !== undefined) { updates.push(`services = $${idx++}`); params.push(input.services); }
    if (input.targetIndianMarkets !== undefined) { updates.push(`target_indian_markets = $${idx++}`); params.push(input.targetIndianMarkets); }
    if (input.priceRange !== undefined) { updates.push(`price_range = $${idx++}`); params.push(input.priceRange); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.website !== undefined) { updates.push(`website = $${idx++}`); params.push(input.website); }
    if (input.contactEmail !== undefined) { updates.push(`contact_email = $${idx++}`); params.push(input.contactEmail); }
    if (input.contactPhone !== undefined) { updates.push(`contact_phone = $${idx++}`); params.push(input.contactPhone); }
    if (input.certifications !== undefined) { updates.push(`certifications = $${idx++}`); params.push(input.certifications); }
    if (input.status !== undefined) { updates.push(`status = $${idx++}`); params.push(input.status); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.global_trade_listings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) throw Object.assign(new Error('Listing not found'), { statusCode: 404 });
      return mapRowToListing(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.query(`DELETE FROM public.global_trade_listings WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await db.query(`UPDATE public.global_trade_listings SET views = views + 1 WHERE id = $1`, [id]);
    } catch {
      // non-critical
    }
  }

  async list(query: GlobalTradeListQuery): Promise<{ listings: IGlobalTradeListing[]; total: number }> {
    try {
      await this.ensureTable();
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 12));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`status = 'active'`];
      const params: any[] = [];
      let idx = 1;

      if (query.country) {
        conditions.push(`country_of_origin ILIKE $${idx++}`);
        params.push(`%${query.country}%`);
      }
      if (query.category) {
        conditions.push(`product_category ILIKE $${idx++}`);
        params.push(`%${query.category}%`);
      }
      if (query.search) {
        conditions.push(`(company_name ILIKE $${idx} OR description ILIKE $${idx} OR product_category ILIKE $${idx})`);
        params.push(`%${query.search}%`);
        idx++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.global_trade_listings ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.global_trade_listings ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return { listings: rows.map(mapRowToListing), total };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const GlobalTrade = new GlobalTradeModel();
export default GlobalTrade;
