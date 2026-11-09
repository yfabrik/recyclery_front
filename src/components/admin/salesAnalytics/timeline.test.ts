import type {
  SalesAnalyticsDto,
  SalesTimelineBucketDto,
  SalesTimelineDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { bucketLabel, bucketTitle, isTimelineEmpty, timelinePoints } from "./timeline";

// Intl puts thin spaces (U+2009) around the en dash of a range.
const plain = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");
const range = (date_from: string, date_to: string) => ({ date_from, date_to });

describe("bucketLabel", () => {
  it("labels a day with its weekday and day of month", () => {
    expect(bucketLabel(range("2025-11-03", "2025-11-03"), "day")).toBe("lun. 3");
  });

  it("labels a week with its real dates, a partial one included", () => {
    expect(plain(bucketLabel(range("2026-11-02", "2026-11-08"), "week"))).toBe("2–8 nov.");
    expect(plain(bucketLabel(range("2026-09-28", "2026-10-04"), "week"))).toBe(
      "28 sept. – 4 oct.",
    );
    expect(plain(bucketLabel(range("2026-11-30", "2026-11-30"), "week"))).toBe("30 nov.");
  });

  it("labels a whole month with its month and year, a partial one with its real dates", () => {
    expect(bucketLabel(range("2026-11-01", "2026-11-30"), "month")).toBe("nov. 2026");
    expect(plain(bucketLabel(range("2026-09-27", "2026-09-30"), "month"))).toBe("27–30 sept.");
  });
});

describe("bucketTitle", () => {
  it("gives the bucket's dates with the year, for the tooltip", () => {
    expect(bucketTitle(range("2024-02-01", "2024-02-01"), "day")).toBe("jeu. 1 févr. 2024");
    expect(plain(bucketTitle(range("2023-12-28", "2024-01-03"), "week"))).toBe(
      "28 déc. 2023 – 3 janv. 2024",
    );
    expect(bucketTitle(range("2024-02-01", "2024-02-29"), "month")).toBe("février 2024");
    expect(plain(bucketTitle(range("2023-08-20", "2023-08-31"), "month"))).toBe(
      "20–31 août 2023",
    );
  });
});

const bucket = (
  date: string,
  net_revenue = 0,
  sales_count = 0,
  refunded_amount = 0,
): SalesTimelineBucketDto => ({
  date_from: date,
  date_to: date,
  net_revenue,
  gross_revenue: net_revenue + refunded_amount,
  refunded_amount,
  sales_count,
});

const timeline = (
  current: (SalesTimelineBucketDto | null)[],
  comparison: (SalesTimelineBucketDto | null)[] | null,
): SalesAnalyticsDto<SalesTimelineDto> => ({
  ranges: {
    current: range("2024-02-27", "2024-02-29"),
    comparison: comparison && range("2023-02-27", "2023-02-28"),
  },
  current: { step: "day", buckets: current },
  comparison: comparison && { step: "day", buckets: comparison },
});

describe("timelinePoints", () => {
  it("pairs each bucket with the comparison bucket at the same position", () => {
    const points = timelinePoints(
      timeline(
        [bucket("2024-02-27", 120, 3), bucket("2024-02-28"), bucket("2024-02-29", 25, 1)],
        [bucket("2023-02-27", 80, 2), bucket("2023-02-28", 40, 1), null],
      ),
    );

    expect(points).toEqual([
      {
        label: "mar. 27",
        title: "mar. 27 févr. 2024",
        net: 120,
        salesCount: 3,
        comparison: { title: "lun. 27 févr. 2023", net: 80, salesCount: 2 },
      },
      {
        label: "mer. 28",
        title: "mer. 28 févr. 2024",
        net: 0,
        salesCount: 0,
        comparison: { title: "mar. 28 févr. 2023", net: 40, salesCount: 1 },
      },
      // 29 Feb has no day at its position in 2023.
      { label: "jeu. 29", title: "jeu. 29 févr. 2024", net: 25, salesCount: 1, comparison: null },
    ]);
  });

  it("has no comparison on any point when the comparison is off", () => {
    const points = timelinePoints(timeline([bucket("2024-02-27", 120, 3)], null));

    expect(points.map((p) => p.comparison)).toEqual([null]);
  });
});

describe("isTimelineEmpty", () => {
  it("is empty when neither range has a Sale or a Refund", () => {
    expect(isTimelineEmpty(timeline([bucket("2024-02-27")], [bucket("2023-02-27")]))).toBe(true);
    expect(isTimelineEmpty(timeline([bucket("2024-02-27")], null))).toBe(true);
  });

  it("is not empty with a Refund only, or with figures in the comparison only", () => {
    expect(isTimelineEmpty(timeline([bucket("2024-02-27", -10, 0, 10)], null))).toBe(false);
    expect(isTimelineEmpty(timeline([bucket("2024-02-27")], [bucket("2023-02-27", 40, 1)]))).toBe(
      false,
    );
  });
});
