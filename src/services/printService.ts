import JsBarcode from "jsbarcode";
import type { CashSession, LabeledItemModel, TransactionModel, UserModel } from "../interfaces/Models";

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
import type { CartItem, Schema as CartSchema } from "../components/forms/cartSchema";
const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce(
    (prev, current) => (prev += current.quantity * current.price),
    0,
  );
};
export const printReceipt = (
  transaction: TransactionModel,
  items: CartItem[],
  cashSession: CashSession,
  user: UserModel
) => {
  const printWindow = window.open("", "", "width=400,height=600");
  printWindow?.document.write(`
      <html>
        <head>
          <title>Ticket de caisse</title>
          <style>
            body { font-family: monospace; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${cashSession.Recyclery?.name}</h2>
            <p>Ticket N°: ${transaction.id}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <p>Caissier: ${user.username}</p>
          </div>
          
          <div class="line"></div>
          
          ${items.map(
    (item) => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>${item.name}</span>
              <span>${item.quantity} x ${item.price.toFixed(2)}€</span>
              <span class="right">${(item.quantity * item.price).toFixed(2)}€</span>
            </div>
          `,
  )
      .join("")}
          
          <div class="line"></div>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL:</span>
              <span>${getCartTotal(items).toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Payé:</span>
              <span>${transaction.payment_amount.toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Rendu:</span>
              <span>${transaction.change_amount.toFixed(2)}€</span>
            </div>
          </div>
          
          <div class="line"></div>
          <div style="text-align: center; margin-top: 20px;">
            <p>Merci de votre visite !</p>
          </div>
        </body>
      </html>
    `);


  printWindow?.document.close();
  printWindow?.print();
};

