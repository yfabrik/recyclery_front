export interface LabelFormData {
  description?: string;
  category_id?: string | number;
  subcategory_id?: string | number;
  weight?: string | number;
  price?: string | number;
  cost?: string | number;
  condition_state?: string;
  location?: string;
  autoPrint?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate label form data
 */
export const validateLabelForm = (formData: LabelFormData): ValidationResult => {
  const errors: string[] = [];

  if (!formData.category_id) {
    errors.push('La catégorie est obligatoire');
  }

  if (!formData.price || parseFloat(String(formData.price)) <= 0) {
    errors.push('Le prix est obligatoire et doit être supérieur à 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if form has required fields for creation
 */
export const hasRequiredFields = (formData: LabelFormData): boolean => {
  return !!(formData.category_id && formData.price);
};
