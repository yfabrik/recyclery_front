import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  buildSearchParams,
  parseFiltersFromParams,
  serializeFilterValue,
  stableSerializeFilters,
} from "./useUrlFilters";

const schema = z.object({
  name: z.string(),
  ids: z.array(z.coerce.number()),
  tags: z.array(z.string()),
});
type Filters = z.infer<typeof schema>;

const defaults: Filters = { name: "", ids: [], tags: [] };

describe("array filters in the URL", () => {
  it("serializes arrays: empty is null, otherwise stable and order-sensitive", () => {
    expect(serializeFilterValue([])).toBeNull();
    expect(serializeFilterValue([1, 2])).toBe(serializeFilterValue([1, 2]));
    expect(serializeFilterValue([1, 2])).not.toBe(serializeFilterValue([2, 1]));
    expect(stableSerializeFilters(defaults)).not.toBe(
      stableSerializeFilters({ ...defaults, tags: ["a"] }),
    );
  });

  it("omits empty arrays and writes one repeated param per item", () => {
    const params = buildSearchParams(
      { name: "", ids: [3, 5], tags: [] },
      defaults,
      undefined,
      false,
    );
    expect(params.toString()).toBe("ids=3&ids=5");
  });

  it("round-trips values containing commas", () => {
    const filters: Filters = { name: "x", ids: [1], tags: ["Meubles, deco", "Jouets"] };
    const params = buildSearchParams(filters, defaults, undefined, false);
    expect(parseFiltersFromParams(params, schema, defaults)).toEqual(filters);
  });

  it("falls back to the default array when the param is absent", () => {
    expect(parseFiltersFromParams(new URLSearchParams(""), schema, defaults)).toEqual(defaults);
  });

  it("falls back to defaults when an item fails validation", () => {
    expect(
      parseFiltersFromParams(new URLSearchParams("ids=abc"), schema, defaults),
    ).toEqual(defaults);
  });
});
