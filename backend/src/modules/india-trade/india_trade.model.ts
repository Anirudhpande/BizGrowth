import db from '../../config/db';

// ============================================================
// Interfaces
// ============================================================

export interface IIndiaTradeListing {
  id: string;
  companyName: string;
  indianState: string;
  city: string;
  productCategory: string;
  description: string;
  products: string[];
  services: string[];
  targetGlobalMarkets: string[];
  priceRange: string;
  currency: string;
  exportCertifications: string[];
  gstNumber: string;
  iecCode: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  status: string;
  userId: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIndiaTradeInput {
  companyName: string;
  indianState: string;
  city: string;
  productCategory: string;
  description: string;
  products?: string[];
  services?: string[];
  targetGlobalMarkets?: string[];
  priceRange?: string;
  currency?: string;
  exportCertifications?: string[];
  gstNumber?: string;
  iecCode?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateIndiaTradeInput {
  companyName?: string;
  indianState?: string;
  city?: string;
  productCategory?: string;
  description?: string;
  products?: string[];
  services?: string[];
  targetGlobalMarkets?: string[];
  priceRange?: string;
  currency?: string;
  exportCertifications?: string[];
  gstNumber?: string;
  iecCode?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
}

export interface IndiaTradeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  category?: string;
  targetMarket?: string;
}

// ============================================================
// Row ↔ Application Mapping
// ============================================================

function mapRowToListing(row: any): IIndiaTradeListing {
  return {
    id: row.id,
    companyName: row.company_name,
    indianState: row.indian_state || '',
    city: row.city || '',
    productCategory: row.product_category || '',
    description: row.description || '',
    products: row.products || [],
    services: row.services || [],
    targetGlobalMarkets: row.target_global_markets || [],
    priceRange: row.price_range || '',
    currency: row.currency || 'INR',
    exportCertifications: row.export_certifications || [],
    gstNumber: row.gst_number || '',
    iecCode: row.iec_code || '',
    website: row.website || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    isVerified: row.is_verified || false,
    status: row.status || 'active',
    userId: row.user_id,
    views: row.views || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// India Trade Model — Data Access Layer
// ============================================================

class IndiaTradeModel {
  /**
   * Ensure the table exists (soft migration).
   */
  async ensureTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.india_trade_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        indian_state VARCHAR(100) NOT NULL,
        city VARCHAR(100),
        product_category VARCHAR(100) NOT NULL,
        description TEXT,
        products TEXT[] DEFAULT '{}',
        services TEXT[] DEFAULT '{}',
        target_global_markets TEXT[] DEFAULT '{}',
        price_range VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'INR',
        export_certifications TEXT[] DEFAULT '{}',
        gst_number VARCHAR(20),
        iec_code VARCHAR(20),
        website VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active',
        user_id UUID NOT NULL,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  async findById(id: string): Promise<IIndiaTradeListing | null> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT * FROM public.india_trade_listings WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToListing(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async findByUserId(userId: string): Promise<IIndiaTradeListing[]> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT * FROM public.india_trade_listings WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map(mapRowToListing);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async create(userId: string, input: CreateIndiaTradeInput): Promise<IIndiaTradeListing> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `INSERT INTO public.india_trade_listings
          (company_name, indian_state, city, product_category, description, products, services,
           target_global_markets, price_range, currency, export_certifications, gst_number, iec_code,
           website, contact_email, contact_phone, user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [
          input.companyName,
          input.indianState,
          input.city || '',
          input.productCategory,
          input.description || '',
          input.products || [],
          input.services || [],
          input.targetGlobalMarkets || [],
          input.priceRange || '',
          input.currency || 'INR',
          input.exportCertifications || [],
          input.gstNumber || '',
          input.iecCode || '',
          input.website || '',
          input.contactEmail || '',
          input.contactPhone || '',
          userId,
        ]
      );
      return mapRowToListing(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateIndiaTradeInput): Promise<IIndiaTradeListing> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.companyName !== undefined) { updates.push(`company_name = $${idx++}`); params.push(input.companyName); }
    if (input.indianState !== undefined) { updates.push(`indian_state = $${idx++}`); params.push(input.indianState); }
    if (input.city !== undefined) { updates.push(`city = $${idx++}`); params.push(input.city); }
    if (input.productCategory !== undefined) { updates.push(`product_category = $${idx++}`); params.push(input.productCategory); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.products !== undefined) { updates.push(`products = $${idx++}`); params.push(input.products); }
    if (input.services !== undefined) { updates.push(`services = $${idx++}`); params.push(input.services); }
    if (input.targetGlobalMarkets !== undefined) { updates.push(`target_global_markets = $${idx++}`); params.push(input.targetGlobalMarkets); }
    if (input.priceRange !== undefined) { updates.push(`price_range = $${idx++}`); params.push(input.priceRange); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.exportCertifications !== undefined) { updates.push(`export_certifications = $${idx++}`); params.push(input.exportCertifications); }
    if (input.gstNumber !== undefined) { updates.push(`gst_number = $${idx++}`); params.push(input.gstNumber); }
    if (input.iecCode !== undefined) { updates.push(`iec_code = $${idx++}`); params.push(input.iecCode); }
    if (input.website !== undefined) { updates.push(`website = $${idx++}`); params.push(input.website); }
    if (input.contactEmail !== undefined) { updates.push(`contact_email = $${idx++}`); params.push(input.contactEmail); }
    if (input.contactPhone !== undefined) { updates.push(`contact_phone = $${idx++}`); params.push(input.contactPhone); }
    if (input.status !== undefined) { updates.push(`status = $${idx++}`); params.push(input.status); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.india_trade_listings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
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
      await db.query(`DELETE FROM public.india_trade_listings WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await db.query(`UPDATE public.india_trade_listings SET views = views + 1 WHERE id = $1`, [id]);
    } catch {
      // non-critical
    }
  }

  async list(query: IndiaTradeListQuery): Promise<{ listings: IIndiaTradeListing[]; total: number }> {
    try {
      await this.ensureTable();
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 12));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`status = 'active'`];
      const params: any[] = [];
      let idx = 1;

      if (query.state) {
        conditions.push(`indian_state ILIKE $${idx++}`);
        params.push(`%${query.state}%`);
      }
      if (query.category) {
        conditions.push(`product_category ILIKE $${idx++}`);
        params.push(`%${query.category}%`);
      }
      if (query.targetMarket) {
        conditions.push(`$${idx++} ILIKE ANY(SELECT '%' || unnest(target_global_markets) || '%')`);
        params.push(query.targetMarket);
      }
      if (query.search) {
        conditions.push(`(company_name ILIKE $${idx} OR description ILIKE $${idx} OR product_category ILIKE $${idx} OR city ILIKE $${idx})`);
        params.push(`%${query.search}%`);
        idx++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.india_trade_listings ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.india_trade_listings ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return { listings: rows.map(mapRowToListing), total };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const IndiaTrade = new IndiaTradeModel();
export default IndiaTrade;
