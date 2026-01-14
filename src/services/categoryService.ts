export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  subcategories?: Category[];
  [key: string]: any;
}

/**
 * Organize categories with their subcategories
 * Separates main categories from subcategories and nests them
 */
export const organizeCategories = (allCategories: Category[]): Category[] => {
  const mainCategories = allCategories.filter(cat => !cat.parent_id);
  const subcategories = allCategories.filter(cat => cat.parent_id);

  return mainCategories.map(category => ({
    ...category,
    subcategories: subcategories.filter(sub => sub.parent_id === category.id)
  }));
};

/**
 * Get subcategories for a specific category
 */
export const getSubcategoriesForCategory = (
  categories: Category[],
  categoryId: number | string
): Category[] => {
  const category = categories.find(cat => cat.id === Number(categoryId));
  return category?.subcategories || [];
};
