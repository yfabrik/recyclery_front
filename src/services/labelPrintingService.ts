import JsBarcode from 'jsbarcode';

export interface LabelItem {
  id?: number;
  barcode: string;
  name?: string;
  description?: string;
  category_name?: string;
  subcategory_name?: string;
  price: number | string;
  weight?: number | string;
  condition_state?: string;
  location?: string;
}

export interface ConditionOption {
  value: string;
  label: string;
  color: 'success' | 'primary' | 'warning' | 'error';
}

/**
 * Generate a barcode image as data URL
 */
export const generateBarcode = (barcode: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, barcode, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true
  });
  return canvas.toDataURL();
};

/**
 * Print a label for an item
 */
export const printLabel = (
  item: LabelItem,
  conditionOptions: ConditionOption[]
): void => {
  const barcodeImage = generateBarcode(item.barcode);
  const conditionLabel = conditionOptions.find(
    c => c.value === item.condition_state
  )?.label || 'Non spécifié';

  const printWindow = window.open('', '', 'width=400,height=600');
  if (!printWindow) {
    console.error('Impossible d\'ouvrir la fenêtre d\'impression');
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Étiquette - ${item.name || item.description || 'Article'}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            text-align: center;
          }
          .label {
            border: 2px solid #000;
            padding: 15px;
            max-width: 300px;
            margin: 0 auto;
          }
          .name { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 10px;
          }
          .category { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 10px;
          }
          .price { 
            font-size: 24px; 
            font-weight: bold; 
            color: #d32f2f; 
            margin: 15px 0;
          }
          .weight { 
            font-size: 14px; 
            margin-bottom: 10px;
          }
          .barcode { 
            margin: 15px 0;
          }
          .condition { 
            font-size: 12px; 
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="name">${item.name || item.description || 'Article'}</div>
          <div class="category">${item.category_name || ''}${item.subcategory_name ? ' > ' + item.subcategory_name : ''}</div>
          <div class="price">${parseFloat(String(item.price)).toFixed(2)} €</div>
          ${item.weight ? `<div class="weight">Poids: ${item.weight} kg</div>` : ''}
          <div class="barcode">
            <img src="${barcodeImage}" alt="Code-barres" />
          </div>
          <div class="condition">État: ${conditionLabel}</div>
          ${item.location ? `<div class="condition">Emplacement: ${item.location}</div>` : ''}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};
