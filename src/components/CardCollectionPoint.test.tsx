/**
 * Unit tests for CardCollectionPoint fixtures / contract.
 *
 * Behavior (render, clicks, callbacks) is covered by Storybook play functions
 * in CardCollectionPoint.stories.tsx — run with:
 *   npx vitest run --project storybook
 *
 * This file runs under the Vitest unit project (no browser / no MUI render):
 *   npx vitest run --project unit
 */

import { describe, expect, it } from "vitest";
import type { TaskScheduleRefDto } from "@recyclerie/api/responses/taskSchedule";
import type { CollectionPointModel } from "../interfaces/Models";
import { mockCollectionPoints } from "../stories/fixtures";

const schedule: TaskScheduleRefDto = {
  id: 5,
  name: "Collecte hebdomadaire",
  is_recurring: true,
  category: "point",
  scheduled_date: "2026-02-10T12:55:17.500Z",
  start_time: "2026-02-06T08:00:13.017Z",
  end_time: "2026-02-06T16:00:13.017Z",
  day_of_week: 2,
  recurrence_pattern: "weekly",
  collection_point_id: 1,
  store_id: null,
};

describe("CardCollectionPoint fixtures", () => {
  it("provides a base collection point with contact and an active schedule", () => {
    const point: CollectionPointModel = {
      ...mockCollectionPoints[0],
      TaskSchedules: [schedule],
    };

    expect(point.id).toBe(1);
    expect(point.name).toBe("Point collecte Centre");
    expect(point.is_active).toBe(true);
    expect(point.contact_phone).toBeTruthy();
    expect(point.contact_email).toBeTruthy();
    expect(point.TaskSchedules).toHaveLength(1);
    expect(point.TaskSchedules![0].is_recurring).toBe(true);
  });

  it("supports empty schedule list for the empty-state UI", () => {
    const point: CollectionPointModel = {
      ...mockCollectionPoints[0],
      TaskSchedules: [],
    };

    expect(point.TaskSchedules).toEqual([]);
  });

  it("supports inactive schedule rows", () => {
    const inactive: TaskScheduleRefDto = {
      ...schedule,
      id: 7,
      is_recurring: false,
    };

    expect(inactive.is_recurring).toBe(false);
  });

  it("supports points without phone or email", () => {
    const point: CollectionPointModel = {
      ...mockCollectionPoints[0],
      contact_phone: null,
      contact_email: null,
      TaskSchedules: [schedule],
    };

    expect(point.contact_phone).toBeNull();
    expect(point.contact_email).toBeNull();
  });
});
