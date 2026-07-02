import db from '../../config/db';
import {
  IOrganization,
  OrganizationRow,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  PaginationQuery
} from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

/**
 * Maps a database snake_case row to a camelCase application object.
 */
export function mapRowToOrganization(row: OrganizationRow): IOrganization {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    industry: row.industry || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    linkedinUrl: row.linkedin_url || '',
    logoUrl: row.logo_url || '',
    size: row.size || '',
    foundedYear: row.founded_year || null,
    city: row.city || '',
    state: row.state || '',
    country: row.country || '',
    userId: row.user_id || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// Organizations Model — Data Access Layer
// ============================================================

class OrganizationsModel {
  /**
   * Find an organization by ID. Returns null if not found.
   */
  async findById(id: string): Promise<IOrganization | null> {
    const queryText = `SELECT * FROM public.organizations WHERE id = $1 LIMIT 1`;
    try {
      const { rows } = await db.query(queryText, [id]);
      if (rows.length === 0) return null;
      return mapRowToOrganization(rows[0] as OrganizationRow);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * Find all organizations owned by a specific user.
   */
  async findByUserId(userId: string): Promise<IOrganization[]> {
    const queryText = `SELECT * FROM public.organizations WHERE user_id = $1 ORDER BY name ASC`;
    try {
      const { rows } = await db.query(queryText, [userId]);
      return rows.map((row) => mapRowToOrganization(row as OrganizationRow));
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * Create a new organization.
   */
  async create(
    userId: string,
    input: CreateOrganizationInput
  ): Promise<IOrganization> {
    const queryText = `
      INSERT INTO public.organizations (
        name, description, industry, email, phone, website, linkedin_url, logo_url, size, founded_year, city, state, country, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    try {
      const { rows } = await db.query(queryText, [
        input.name,
        input.description || '',
        input.industry || '',
        input.email || '',
        input.phone || '',
        input.website || '',
        input.linkedinUrl || '',
        input.logoUrl || '',
        input.size || '',
        input.foundedYear || null,
        input.city || '',
        input.state || '',
        input.country || '',
        userId,
      ]);
      return mapRowToOrganization(rows[0] as OrganizationRow);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * Update an organization's details.
   */
  async update(
    id: string,
    input: UpdateOrganizationInput
  ): Promise<IOrganization> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIdx++}`);
      params.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIdx++}`);
      params.push(input.description);
    }
    if (input.industry !== undefined) {
      updates.push(`industry = $${paramIdx++}`);
      params.push(input.industry);
    }
    if (input.email !== undefined) {
      updates.push(`email = $${paramIdx++}`);
      params.push(input.email);
    }
    if (input.phone !== undefined) {
      updates.push(`phone = $${paramIdx++}`);
      params.push(input.phone);
    }
    if (input.website !== undefined) {
      updates.push(`website = $${paramIdx++}`);
      params.push(input.website);
    }
    if (input.linkedinUrl !== undefined) {
      updates.push(`linkedin_url = $${paramIdx++}`);
      params.push(input.linkedinUrl);
    }
    if (input.logoUrl !== undefined) {
      updates.push(`logo_url = $${paramIdx++}`);
      params.push(input.logoUrl);
    }
    if (input.size !== undefined) {
      updates.push(`size = $${paramIdx++}`);
      params.push(input.size);
    }
    if (input.foundedYear !== undefined) {
      updates.push(`founded_year = $${paramIdx++}`);
      params.push(input.foundedYear);
    }
    if (input.city !== undefined) {
      updates.push(`city = $${paramIdx++}`);
      params.push(input.city);
    }
    if (input.state !== undefined) {
      updates.push(`state = $${paramIdx++}`);
      params.push(input.state);
    }
    if (input.country !== undefined) {
      updates.push(`country = $${paramIdx++}`);
      params.push(input.country);
    }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    const queryText = `
      UPDATE public.organizations 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIdx}
      RETURNING *
    `;
    try {
      const { rows } = await db.query(queryText, params);
      if (rows.length === 0) {
        throw Object.assign(new Error('Organization not found'), { statusCode: 404 });
      }
      return mapRowToOrganization(rows[0] as OrganizationRow);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * Delete an organization by ID.
   */
  async delete(id: string): Promise<void> {
    const queryText = `DELETE FROM public.organizations WHERE id = $1`;
    try {
      await db.query(queryText, [id]);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * List organizations with pagination, search, and filtering.
   */
  async list(query: PaginationQuery): Promise<{
    organizations: IOrganization[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;
    
    const sortBy = query.sortBy === 'name' ? 'name' : 'created_at';
    const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (query.industry) {
      conditions.push(`industry ILIKE $${paramIdx++}`);
      params.push(`%${query.industry}%`);
    }

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      conditions.push(`(name ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
      params.push(searchPattern);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      // 1. Get total count
      const countQuery = `SELECT COUNT(*) FROM public.organizations ${whereClause}`;
      const countRes = await db.query(countQuery, params);
      const total = parseInt(countRes.rows[0].count, 10);

      // 2. Get data
      const dataParams = [...params];
      const dataQuery = `
        SELECT * FROM public.organizations
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;
      dataParams.push(limit, offset);
      const { rows } = await db.query(dataQuery, dataParams);

      const organizations = rows.map((row) =>
        mapRowToOrganization(row as OrganizationRow)
      );

      return {
        organizations,
        total,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

// ============================================================
// Singleton Export
// ============================================================

const Organizations = new OrganizationsModel();
export default Organizations;
