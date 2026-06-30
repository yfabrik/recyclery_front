import { fn } from "storybook/test";

export {
  mockCategories,
  mockCategoriesFlat,
  mockCollectionPoints,
} from "./categories";
export { mockEcoOrganisms, mockStores } from "./stores";

/**
 * Storybook submit handler. Implemented as a spy so submitted form data is
 * logged to the Actions panel. Returns the payload for easy inspection.
 */
export const noopSubmit = fn((data: unknown) => data).mockName("onSubmit");
