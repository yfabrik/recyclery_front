import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchCategories as fetchCategoriesAPI } from './api/categories';
import {
  getLabeledItems,
  createLabeledItem,
  updateLabeledItem,
  deleteLabeledItem,
  sellItem
} from './api/labeledItems';
import { organizeCategories } from './categoryService';
import { validateLabelForm } from './labelValidationService';
import { calculateLabelStatistics } from './labelStatisticsService';
import type { Category } from './categoryService';
import type { LabelFormData } from './labelValidationService';

export interface LabeledItem {
  id: number;
  barcode: string;
  description?: string;
  category_id?: number;
  subcategory_id?: number;
  weight?: number | string;
  price: number | string;
  cost?: number | string;
  condition_state?: string;
  location?: string;
  status: 'available' | 'reserved' | 'sold';
  category_name?: string;
  subcategory_name?: string;
  name?: string;
  [key: string]: any;
}

export interface LabelFilters {
  status?: string;
  category_id?: string | number;
  search?: string;
}

export const useLabels = () => {
  const [items, setItems] = useState<LabeledItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch labeled items with filters
   */
  const fetchItems = async (filters: LabelFilters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.category_id) params.append('category_id', String(filters.category_id));
      if (filters.search) params.append('search', filters.search);

      const response = await getLabeledItems(Object.fromEntries(params));
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      toast.error('Erreur lors du chargement des articles');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch and organize categories
   */
  const fetchCategories = async () => {
    try {
      const response = await fetchCategoriesAPI();
      const allCategories = response.data.categories || [];
      const organizedCategories = organizeCategories(allCategories);
      setCategories(organizedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
      throw error;
    }
  };

  /**
   * Create a new labeled item
   */
  const createItem = async (formData: LabelFormData) => {
    const validation = validateLabelForm(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await createLabeledItem(formData);
      toast.success('Article créé avec succès');
      return response.data.item;
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création');
      throw error;
    }
  };

  /**
   * Update an existing labeled item
   */
  const updateItem = async (id: number, formData: LabelFormData) => {
    const validation = validateLabelForm(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      throw new Error(validation.errors.join(', '));
    }

    try {
      const response = await updateLabeledItem(id, formData);
      toast.success('Article mis à jour avec succès');
      return response.data.item;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  /**
   * Delete a labeled item
   */
  const deleteItem = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      await deleteLabeledItem(id);
      toast.success('Article supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  /**
   * Mark an item as sold
   */
  const markAsSold = async (id: number) => {
    if (!window.confirm('Marquer cet article comme vendu ?')) {
      return;
    }

    try {
      await sellItem(id);
      toast.success('Article marqué comme vendu');
      return true;
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast.error('Erreur lors de la vente');
      throw error;
    }
  };

  /**
   * Get statistics for labeled items
   */
  const getStatistics = () => {
    return calculateLabelStatistics(items);
  };

  return {
    items,
    categories,
    loading,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
    markAsSold,
    getStatistics,
    setItems,
    setCategories
  };
};
