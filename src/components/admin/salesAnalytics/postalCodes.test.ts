import { describe, expect, it } from "vitest";
import { postalCodeShare, postalCodesCsv } from "./postalCodes";

describe("postalCodeShare", () => {
  it("is the share of Sales that have a postal code", () => {
    expect(postalCodeShare({ sales_with_postal_code: 5, sales_count: 8 })).toBe(0.625);
    expect(postalCodeShare({ sales_with_postal_code: 0, sales_count: 3 })).toBe(0);
  });

  it("is null when there is no Sale", () => {
    expect(postalCodeShare({ sales_with_postal_code: 0, sales_count: 0 })).toBeNull();
  });
});

describe("postalCodesCsv", () => {
  it("has one row per listed postal code, amounts with a dot decimal", () => {
    const csv = postalCodesCsv({
      postal_codes: [
        { postal_code: "39000", net_revenue: 35.5, sales_count: 3, average_basket: 17.25 },
        { postal_code: "39570", net_revenue: 25, sales_count: 1, average_basket: 30 },
      ],
      sales_with_postal_code: 4,
      sales_count: 6,
    });

    expect(csv).toBe(
      "Code postal,CA net (€),Ventes,Panier moyen (€)\r\n" +
        "39000,35.5,3,17.25\r\n" +
        "39570,25,1,30",
    );
  });
});
