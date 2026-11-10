import { describe, expect, it } from "vitest";
import { countLabel, formatCount, formatShortDate, frDateFormat, toPercent, utcDate } from "./format";

describe("dates", () => {
  it("formats a calendar date in French, whatever the process time zone", () => {
    expect(formatShortDate("2024-02-29")).toBe("29/02/2024");
    expect(frDateFormat({ month: "long", year: "numeric" }).format(utcDate("2026-11-01"))).toBe(
      "novembre 2026",
    );
  });
});

describe("counts", () => {
  it("formats a count French style", () => {
    expect(formatCount(1234)).toBe(new Intl.NumberFormat("fr-FR").format(1234));
  });

  it("puts the word in the plural from 2, either way from 0", () => {
    expect(countLabel(0, "vente")).toBe("0 vente");
    expect(countLabel(1, "vente")).toBe("1 vente");
    expect(countLabel(3, "vente")).toBe("3 ventes");
    expect(countLabel(-2, "objet")).toBe(`${formatCount(-2)} objets`);
    expect(countLabel(2, "carte", "cartes")).toBe("2 cartes");
  });
});

describe("toPercent", () => {
  it("turns a ratio into a percentage with the given decimals", () => {
    expect(toPercent(0.23756, 1)).toBe(23.8);
    expect(toPercent(0.23756, 2)).toBe(23.76);
    expect(toPercent(1 / 3, 1)).toBe(33.3);
    expect(toPercent(-0.05, 1)).toBe(-5);
  });
});
