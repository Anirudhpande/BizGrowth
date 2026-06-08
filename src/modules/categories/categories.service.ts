import { Category, ICategory } from './categories.model';
import { ConsultantCategory, IConsultantCategory } from './consultant-categories.model';

export class CategoriesService {
  /**
   * Create a new category
   */
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      const category = new Category(categoryData);
      return await category.save();
    } catch (error) {
      throw new Error(`Failed to create category: ${error}`);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    return await Category.findById(categoryId);
  }

  /**
   * Get category by name
   */
  async getCategoryByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({ name });
  }

  /**
   * Get all categories
   */
  async getAllCategories(
    limit: number = 50,
    skip: number = 0
  ): Promise<{ categories: ICategory[]; total: number }> {
    const categories = await Category.find()
      .sort({ consultantCount: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Category.countDocuments();

    return { categories, total };
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    // Remove all consultant-category mappings
    await ConsultantCategory.deleteMany({ categoryId });
    // Delete the category
    const result = await Category.findByIdAndDelete(categoryId);
    return !!result;
  }

  /**
   * Add consultant to category
   */
  async addConsultantToCategory(
    consultantId: string,
    categoryId: string
  ): Promise<IConsultantCategory> {
    try {
      // Check if consultant-category pair already exists
      const existing = await ConsultantCategory.findOne({
        consultantId,
        categoryId,
      });

      if (existing) {
        return existing;
      }

      const mapping = new ConsultantCategory({
        consultantId,
        categoryId,
      });

      // Increment consultant count in category
      await Category.findByIdAndUpdate(
        categoryId,
        { $inc: { consultantCount: 1 } },
        { new: true }
      );

      return await mapping.save();
    } catch (error) {
      throw new Error(`Failed to add consultant to category: ${error}`);
    }
  }

  /**
   * Remove consultant from category
   */
  async removeConsultantFromCategory(
    consultantId: string,
    categoryId: string
  ): Promise<boolean> {
    const result = await ConsultantCategory.deleteOne({
      consultantId,
      categoryId,
    });

    if (result.deletedCount > 0) {
      // Decrement consultant count in category
      await Category.findByIdAndUpdate(
        categoryId,
        { $inc: { consultantCount: -1 } },
        { new: true }
      );
      return true;
    }

    return false;
  }

  /**
   * Get all categories for a consultant
   */
  async getConsultantCategories(consultantId: string): Promise<ICategory[]> {
    const mappings = await ConsultantCategory.find({ consultantId });
    const categoryIds = mappings.map((m) => m.categoryId);
    return await Category.find({ _id: { $in: categoryIds } });
  }

  /**
   * Get all consultants in a category
   */
  async getConsultantsInCategory(
    categoryId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ consultants: string[]; total: number }> {
    const mappings = await ConsultantCategory.find({ categoryId })
      .limit(limit)
      .skip(skip);

    const consultants = mappings.map((m) => m.consultantId);
    const total = await ConsultantCategory.countDocuments({ categoryId });

    return { consultants, total };
  }

  /**
   * Search categories by name
   */
  async searchCategories(searchTerm: string): Promise<ICategory[]> {
    return await Category.find({
      name: { $regex: searchTerm, $options: 'i' },
    }).sort({ consultantCount: -1 });
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
    return await Category.find()
      .sort({ consultantCount: -1 })
      .limit(limit);
  }
}