export {
  mockCategories,
  mockCategoriesFlat,
  mockCollectionPoints,
} from "./categories";
export { mockEcoOrganisms, mockStores } from "./stores";

/** Storybook-friendly submit handler. */
export const noopSubmit = (data: unknown) => {
  console.log("[story submit]", data);
};
