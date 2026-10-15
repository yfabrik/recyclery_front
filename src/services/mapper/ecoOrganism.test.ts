import { describe, expect, it } from "vitest";
import type { EcoOrgFilterFormValues } from "../schema/ecoOrganism";
import { toEcoOrgQuartersQuery } from "./ecoOrganism";

const base: EcoOrgFilterFormValues = {
  eco_organism_id: 9,
  metric_source: "quarterOut",
  quarter: "2026-T3",
  month_year: null,
  source_type: "point",
  collection_point_id: "",
  category: "Meubles",
};

describe("toEcoOrgQuartersQuery", () => {
  it("sends nothing without a collection point, whatever the client-side filters", () => {
    expect(toEcoOrgQuartersQuery(base)).toEqual({});
  });

  it("maps collection_point_id to point and drops client-side filters", () => {
    expect(toEcoOrgQuartersQuery({ ...base, collection_point_id: 5 })).toEqual({
      point: 5,
    });
  });
});
