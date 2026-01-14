# Refactoring Guide: Extracting Logic to Services

This guide demonstrates how to extract business logic from React components into reusable services, using `Labels.jsx` as an example.

## 📁 Service Structure

The refactoring creates the following service files:

```
src/services/
├── api/                          # API layer (already exists)
│   ├── labeledItems.ts          # HTTP calls for labeled items
│   └── categories.ts            # HTTP calls for categories
│
├── labelPrintingService.ts      # ✅ NEW: Barcode & label printing logic
├── labelStatisticsService.ts    # ✅ NEW: Statistics calculations
├── categoryService.ts           # ✅ NEW: Category organization utilities
├── labelValidationService.ts   # ✅ NEW: Form validation logic
└── useLabels.ts                 # ✅ NEW: Custom hook combining all services
```

## 🔄 What Was Extracted

### 1. **Label Printing Service** (`labelPrintingService.ts`)

**Before (in component):**
```javascript
const generateBarcode = (barcode) => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, barcode, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true
  });
  return canvas.toDataURL();
};

const printLabel = (item) => {
  const barcodeImage = generateBarcode(item.barcode);
  // ... 60+ lines of HTML generation
};
```

**After (in service):**
```javascript
import { printLabel } from '../services/labelPrintingService';

// In component:
const handlePrint = (item) => {
  printLabel(item, conditionOptions);
};
```

**Benefits:**
- ✅ Reusable across components
- ✅ Testable in isolation
- ✅ Easier to maintain and update

---

### 2. **Statistics Service** (`labelStatisticsService.ts`)

**Before (in component):**
```javascript
// Inline calculations in JSX
<StatCardNoIcon 
  title='Articles disponibles' 
  value={items.filter(item => item.status === 'available').length} 
/>
<StatCardNoIcon 
  title='Valeur totale stock' 
  value={` ${items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)} €`} 
/>
```

**After (in service):**
```javascript
import { getStatistics, formatTotalValue } from '../services/useLabels';

const statistics = getStatistics();

<StatCardNoIcon 
  title='Articles disponibles' 
  value={statistics.available} 
/>
<StatCardNoIcon 
  title='Valeur totale stock' 
  value={formatTotalValue(statistics.totalValue)} 
/>
```

**Benefits:**
- ✅ Centralized calculation logic
- ✅ Consistent formatting
- ✅ Easy to add new statistics

---

### 3. **Category Organization Service** (`categoryService.ts`)

**Before (in component):**
```javascript
const fetchCategories = async () => {
  const response = await fcat();
  const allCategories = response.data.categories || [];
  const mainCategories = allCategories.filter(cat => !cat.parent_id);
  const subcategories = allCategories.filter(cat => cat.parent_id);
  const organizedCategories = mainCategories.map(category => ({
    ...category,
    subcategories: subcategories.filter(sub => sub.parent_id === category.id)
  }));
  setCategories(organizedCategories);
};
```

**After (in service):**
```javascript
import { organizeCategories } from '../services/categoryService';

const fetchCategories = async () => {
  const response = await fetchCategoriesAPI();
  const organizedCategories = organizeCategories(response.data.categories);
  setCategories(organizedCategories);
};
```

**Benefits:**
- ✅ Reusable across multiple components
- ✅ Single source of truth for category organization
- ✅ Easier to test and modify

---

### 4. **Validation Service** (`labelValidationService.ts`)

**Before (in component):**
```javascript
const handleSave = async () => {
  if (!formData.category_id || !formData.price) {
    toast.error('Veuillez remplir tous les champs obligatoires');
    return;
  }
  // ... rest of logic
};
```

**After (in service):**
```javascript
import { validateLabelForm } from '../services/labelValidationService';

// Service handles validation
const createItem = async (formData) => {
  const validation = validateLabelForm(formData);
  if (!validation.isValid) {
    validation.errors.forEach(error => toast.error(error));
    throw new Error(validation.errors.join(', '));
  }
  // ... API call
};
```

**Benefits:**
- ✅ Consistent validation rules
- ✅ Better error messages
- ✅ Easy to extend validation rules

---

### 5. **Custom Hook** (`useLabels.ts`)

**Before (in component):**
```javascript
// Multiple separate functions:
const fetchItems = async () => { /* ... */ };
const fetchCategories = async () => { /* ... */ };
const handleSave = async () => { /* ... */ };
const handleDelete = async (id) => { /* ... */ };
const handleSell = async (id) => { /* ... */ };
// ... state management
```

**After (in service):**
```javascript
import { useLabels } from '../services/useLabels';

const {
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
} = useLabels();
```

**Benefits:**
- ✅ All related logic in one place
- ✅ Reusable across components
- ✅ Cleaner component code
- ✅ Easier to test

---

## 📊 Comparison: Before vs After

### Component Size
- **Before:** ~757 lines
- **After:** ~400-500 lines (estimated)
- **Reduction:** ~35-40% less code in component

### Testability
- **Before:** Hard to test business logic (requires rendering component)
- **After:** Services can be unit tested independently

### Reusability
- **Before:** Logic tied to one component
- **After:** Services can be used in multiple components

### Maintainability
- **Before:** Changes require modifying component
- **After:** Changes isolated to specific services

---

## 🚀 Migration Steps

1. **Create service files** (already done)
   - `labelPrintingService.ts`
   - `labelStatisticsService.ts`
   - `categoryService.ts`
   - `labelValidationService.ts`
   - `useLabels.ts`

2. **Update component imports**
   ```javascript
   // Remove direct API imports
   // import { createLabeledItem, ... } from '../services/api/labeledItems';
   
   // Add service imports
   import { useLabels } from '../services/useLabels';
   import { printLabel } from '../services/labelPrintingService';
   ```

3. **Replace inline logic with service calls**
   - Replace `fetchItems` with `useLabels().fetchItems`
   - Replace `generateBarcode`/`printLabel` with `printLabel` from service
   - Replace statistics calculations with `getStatistics()`

4. **Test thoroughly**
   - Test each service independently
   - Test component integration
   - Verify all functionality works as before

---

## 🎯 Best Practices

### Service Organization
- **API Services** (`api/`): Pure HTTP calls, no business logic
- **Business Services** (`services/`): Business logic, calculations, transformations
- **Custom Hooks** (`use*.ts`): Combine services with React state management

### Service Responsibilities
- ✅ Single Responsibility Principle
- ✅ Pure functions when possible
- ✅ Clear, descriptive function names
- ✅ TypeScript types for better IDE support

### Component Responsibilities
- ✅ UI rendering
- ✅ User interactions
- ✅ Local UI state (dialogs, forms, etc.)
- ❌ Business logic
- ❌ Data transformations
- ❌ API error handling (handled in services)

---

## 📝 Example: Using Services in Other Components

```javascript
// In PointOfSale.jsx or any other component
import { useLabels } from '../services/useLabels';
import { printLabel } from '../services/labelPrintingService';

const MyComponent = () => {
  const { items, fetchItems, markAsSold } = useLabels();
  
  const handleSell = async (id) => {
    await markAsSold(id);
    fetchItems();
  };
  
  // ... rest of component
};
```

---

## ✅ Benefits Summary

1. **Separation of Concerns**: UI logic separated from business logic
2. **Reusability**: Services can be used across multiple components
3. **Testability**: Services can be unit tested independently
4. **Maintainability**: Changes isolated to specific services
5. **Readability**: Components focus on UI, services handle logic
6. **Type Safety**: TypeScript types improve developer experience

---

## 🔍 Next Steps

1. Review the created service files
2. Gradually migrate `Labels.jsx` to use the services
3. Test thoroughly after migration
4. Apply the same pattern to other components (PointOfSale, Planning, etc.)
