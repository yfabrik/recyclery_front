import { fn } from "storybook/test";

export {
  mockCategories,
  mockCategoriesFlat,
  mockCollectionPoints,
} from "./categories";
export { mockEcoOrganisms, mockStores } from "./stores";
export {
  buildCartForm,
  floatThreeLinesCart,
  fractionalGlobalPromo10Form,
  fractionalGlobalPromoCart,
  globalPromo33Form,
  globalPromoCart,
  linePromoCart,
  makeCartItem,
  makeSellTransaction,
  multiPayForm,
  packLineCart,
} from "./posCart";

/**
 * Storybook submit handler. Implemented as a spy so submitted form data is
 * logged to the Actions panel. Returns the payload for easy inspection.
 */
export const noopSubmit = fn((data: unknown) => data).mockName("onSubmit");
