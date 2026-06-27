import db from '../../config/db';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  targetMarket: string; // 'domestic', 'global', 'both'
  imageUrl: string;
  stock: number;
  status: string; // 'active', 'inactive', 'sold_out'
  userId: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerCompany?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
  targetMarket: string;
  imageUrl?: string;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  targetMarket?: string;
  imageUrl?: string;
  stock?: number;
  status?: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  targetMarket?: string;
}

function mapRowToProduct(row: any): IProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: row.price ? parseFloat(row.price) : 0,
    currency: row.currency || 'INR',
    category: row.category || '',
    targetMarket: row.target_market || 'both',
    imageUrl: row.image_url || '',
    stock: row.stock !== undefined ? parseInt(row.stock, 10) : 1,
    status: row.status || 'active',
    userId: row.user_id,
    views: row.views || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    sellerName: row.seller_name,
    sellerEmail: row.seller_email,
    sellerPhone: row.seller_phone,
    sellerCompany: row.seller_company,
  };
}

class ProductModel {
  async ensureTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.product_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        category VARCHAR(100) NOT NULL,
        target_market VARCHAR(20) DEFAULT 'both',
        image_url TEXT,
        stock INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active',
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  async findById(id: string): Promise<IProduct | null> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT p.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone, u.company as seller_company
         FROM public.product_listings p
         LEFT JOIN public.users u ON p.user_id = u.id
         WHERE p.id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToProduct(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async findByUserId(userId: string): Promise<IProduct[]> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `SELECT * FROM public.product_listings WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map(mapRowToProduct);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async create(userId: string, input: CreateProductInput): Promise<IProduct> {
    try {
      await this.ensureTable();
      const { rows } = await db.query(
        `INSERT INTO public.product_listings
          (name, description, price, currency, category, target_market, image_url, stock, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          input.name,
          input.description || '',
          input.price,
          input.currency || 'INR',
          input.category,
          input.targetMarket || 'both',
          input.imageUrl || '',
          input.stock !== undefined ? input.stock : 1,
          userId,
        ]
      );
      return mapRowToProduct(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateProductInput): Promise<IProduct> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.name !== undefined) { updates.push(`name = $${idx++}`); params.push(input.name); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.price !== undefined) { updates.push(`price = $${idx++}`); params.push(input.price); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.category !== undefined) { updates.push(`category = $${idx++}`); params.push(input.category); }
    if (input.targetMarket !== undefined) { updates.push(`target_market = $${idx++}`); params.push(input.targetMarket); }
    if (input.imageUrl !== undefined) { updates.push(`image_url = $${idx++}`); params.push(input.imageUrl); }
    if (input.stock !== undefined) { updates.push(`stock = $${idx++}`); params.push(input.stock); }
    if (input.status !== undefined) { updates.push(`status = $${idx++}`); params.push(input.status); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.product_listings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      return mapRowToProduct(rows[0]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.query(`DELETE FROM public.product_listings WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await db.query(`UPDATE public.product_listings SET views = views + 1 WHERE id = $1`, [id]);
    } catch {
      // non-critical
    }
  }

  async list(query: ProductListQuery): Promise<{ products: IProduct[]; total: number }> {
    try {
      await this.ensureTable();
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 12));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`status = 'active'`];
      const params: any[] = [];
      let idx = 1;

      if (query.category) {
        conditions.push(`category ILIKE $${idx++}`);
        params.push(`%${query.category}%`);
      }
      if (query.targetMarket) {
        conditions.push(`target_market = $${idx++}`);
        params.push(query.targetMarket);
      }
      if (query.search) {
        conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx} OR category ILIKE $${idx})`);
        params.push(`%${query.search}%`);
        idx++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.product_listings ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.product_listings ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return { products: rows.map(mapRowToProduct), total };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Product = new ProductModel();
export default Product;
