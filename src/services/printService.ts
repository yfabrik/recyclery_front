import JsBarcode from "jsbarcode";
import type { LabeledItemModel } from "../interfaces/Models";

const generateBarcode = (barcode: string) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14
    });
    return canvas.toDataURL();
};

export const printLabel = (item: LabeledItemModel) => {
    const barcodeImage = generateBarcode(item.barcode);

    const printWindow = window.open('', '', 'width=400,height=200');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Étiquette - ${item.barcode}</title>
          <style>
            @page {
              size: 60mm 40mm;
              margin: 0;
              padding: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 2mm;
              width: 60mm;
              height: 40mm;
              overflow: hidden;
            }
            .label {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }
            .barcode { 
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 1mm;
              padding: 0 1mm;
            }
            .barcode img {
              height: auto;
              object-fit: contain;
            }
            .info-row {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8px;
              margin-top: 0.5mm;
            }
            .price { 
              font-size: 10px; 
              font-weight: bold; 
              color: #d32f2f;
            }
            .weight { 
              font-size: 8px;
            }
            .category { 
              width: 100%;
              text-align: center;
              font-size: 7px; 
              color: #666;
              margin-top: 0.3mm;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="barcode">
              <img src="${barcodeImage}" alt="Code-barres" />
            </div>
            <div class="info-row">
              <div class="price">${item.price.toFixed(2)} €</div>
              ${item.weight ? `<div class="weight">${item.weight} kg</div>` : '<div></div>'}
            </div>
            <div class="category">${item.category.name || ''}${item.subcategory?.name ? ' > ' + (item?.subcategory?.name) : ''}</div>
          </div>
        </body>
      </html>
    `);

    printWindow?.document.close();
    // Wait a bit for the image to load before printing
    setTimeout(() => {
        printWindow?.print();
    }, 250);
};