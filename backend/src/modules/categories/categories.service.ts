import db from '../../config/db';
import { ICategory } from './categories.model';
import { IConsultantCategory } from './consultant-categories.model';

const CATEGORIES_TABLE = 'categories';
const CONSULTANT_CATEGORIES_TABLE = 'consultant_categories';

export class CategoriesService {
  /**
   * Create a new category
   */
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      const columns = Object.keys(categoryData).join(', ');
      const placeholders = Object.keys(categoryData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(categoryData);

      const res = await db.query(
        `INSERT INTO ${CATEGORIES_TABLE} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return res.rows[0];
    } catch (error) {
      throw new Error(`Failed to create category: ${error}`);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    try {
      const res = await db.query(`SELECT * FROM ${CATEGORIES_TABLE} WHERE id = $1`, [categoryId]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch category: ${error}`);
      return null;
    }
  }

  /**
   * Get category by name
   */
  async getCategoryByName(name: string): Promise<ICategory | null> {
    try {
      const res = await db.query(`SELECT * FROM ${CATEGORIES_TABLE} WHERE name = $1`, [name]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch category: ${error}`);
      return null;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(
    limit: number = 50,
    skip: number = 0
  ): Promise<{ categories: ICategory[]; total: number }> {
    try {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${CATEGORIES_TABLE}`);
      const total = parseInt(countRes.rows[0].count, 10);

      const res = await db.query(
        `SELECT * FROM ${CATEGORIES_TABLE} ORDER BY consultant_count DESC LIMIT $1 OFFSET $2`,
        [limit, skip]
      );

      return { categories: res.rows, total };
    } catch (error) {
      console.error(`Failed to fetch categories: ${error}`);
      return { categories: [], total: 0 };
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    try {
      const setClauses = Object.keys(updateData)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');
      const values = [categoryId, ...Object.values(updateData)];

      const res = await db.query(
        `UPDATE ${CATEGORIES_TABLE} SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        values
      );

      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to update category: ${error}`);
      return null;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM ${CONSULTANT_CATEGORIES_TABLE} WHERE category_id = $1`, [categoryId]);
      await client.query(`DELETE FROM ${CATEGORIES_TABLE} WHERE id = $1`, [categoryId]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to delete category: ${error}`);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Add consultant to category
   */
  async addConsultantToCategory(
    consultantId: string,
    categoryId: string
  ): Promise<IConsultantCategory> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const checkRes = await client.query(
        `SELECT * FROM ${CONSULTANT_CATEGORIES_TABLE} WHERE consultant_id = $1 AND category_id = $2`,
        [consultantId, categoryId]
      );

      if (checkRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return checkRes.rows[0];
      }

      const insertRes = await client.query(
        `INSERT INTO ${CONSULTANT_CATEGORIES_TABLE} (consultant_id, category_id) VALUES ($1, $2) RETURNING *`,
        [consultantId, categoryId]
      );

      await client.query(
        `UPDATE ${CATEGORIES_TABLE} SET consultant_count = consultant_count + 1 WHERE id = $1`,
        [categoryId]
      );

      await client.query('COMMIT');
      return insertRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to add consultant to category: ${error}`);
    } finally {
      client.release();
    }
  }

  /**
   * Remove consultant from category
   */
  async removeConsultantFromCategory(
    consultantId: string,
    categoryId: string
  ): Promise<boolean> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        `DELETE FROM ${CONSULTANT_CATEGORIES_TABLE} WHERE consultant_id = $1 AND category_id = $2 RETURNING *`,
        [consultantId, categoryId]
      );

      if (res.rows.length > 0) {
        await client.query(
          `UPDATE ${CATEGORIES_TABLE} SET consultant_count = consultant_count - 1 WHERE id = $1 AND consultant_count > 0`,
          [categoryId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to remove consultant from category: ${error}`);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Get all categories for a consultant
   */
  async getConsultantCategories(consultantId: string): Promise<ICategory[]> {
    try {
      const res = await db.query(
        `SELECT c.* FROM ${CATEGORIES_TABLE} c
         INNER JOIN ${CONSULTANT_CATEGORIES_TABLE} cc ON c.id = cc.category_id
         WHERE cc.consultant_id = $1`,
        [consultantId]
      );
      return res.rows;
    } catch (error) {
      console.error(`Failed to fetch consultant categories: ${error}`);
      return [];
    }
  }

  /**
   * Get all consultants in a category
   */
  async getConsultantsInCategory(
    categoryId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ consultants: string[]; total: number }> {
    try {
      const countRes = await db.query(
        `SELECT COUNT(*) FROM ${CONSULTANT_CATEGORIES_TABLE} WHERE category_id = $1`,
        [categoryId]
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const res = await db.query(
        `SELECT consultant_id FROM ${CONSULTANT_CATEGORIES_TABLE} WHERE category_id = $1 LIMIT $2 OFFSET $3`,
        [categoryId, limit, skip]
      );

      const consultants = res.rows.map(row => row.consultant_id);
      return { consultants, total };
    } catch (error) {
      console.error(`Failed to fetch consultants in category: ${error}`);
      return { consultants: [], total: 0 };
    }
  }

  /**
   * Search categories by name
   */
  async searchCategories(searchTerm: string): Promise<ICategory[]> {
    try {
      const res = await db.query(
        `SELECT * FROM ${CATEGORIES_TABLE} WHERE name ILIKE $1 ORDER BY consultant_count DESC`,
        [`%${searchTerm}%`]
      );
      return res.rows;
    } catch (error) {
      console.error(`Failed to search categories: ${error}`);
      return [];
    }
  }

  /**
   * Bulk assign consultant to multiple categories
   */
  async assignConsultantToCategories(
    consultantId: string,
    categoryIds: string[]
  ): Promise<IConsultantCategory[]> {
    try {
      const results: IConsultantCategory[] = [];
      for (const categoryId of categoryIds) {
        const result = await this.addConsultantToCategory(consultantId, categoryId);
        results.push(result);
      }
      return results;
    } catch (error) {
      throw new Error(`Failed to assign consultant to categories: ${error}`);
    }
  }

  /**
   * Get trending categories
   */
  async getTrendingCategories(limit: number = 10): Promise<ICategory[]> {
    try {
      const res = await db.query(
        `SELECT * FROM ${CATEGORIES_TABLE} ORDER BY consultant_count DESC LIMIT $1`,
        [limit]
      );
      return res.rows;
    } catch (error) {
      console.error(`Failed to fetch trending categories: ${error}`);
      return [];
    }
  }
}
