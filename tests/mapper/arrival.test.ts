import { describe, expect, it } from "vitest";
import { arrivalPayloadFromForm } from "../../src/services/mapper/arrival";
import type { ArrivalFormOutput } from "../../src/services/schema/arrival";

const baseArrival = {
  category_id: 1,
  subcategory_id: "" as const,
  weight: 3,
  arrival_date: new Date("2026-01-15"),
  arrival_time: new Date("2026-01-15T10:00:00"),
  collection_point_id: 42 as number | "",
  source_details: "",
  notes: "",
};

describe("arrivalPayloadFromForm", () => {
  it("nulls collection_point_id when source_type is not point", () => {
    const payload = arrivalPayloadFromForm({
      ...baseArrival,
      source_type: "apport",
      collection_point_id: 42,
    } satisfies ArrivalFormOutput);
    expect(payload.collection_point_id).toBeNull();
  });

  it("keeps collection_point_id for point source", () => {
    const payload = arrivalPayloadFromForm({
      ...baseArrival,
      source_type: "point",
      collection_point_id: 42,
    } satisfies ArrivalFormOutput);
    expect(payload.collection_point_id).toBe(42);
  });
});
