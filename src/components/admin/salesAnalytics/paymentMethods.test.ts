import type { SalesPaymentMethodsDto } from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { paymentMethodsCsv, refundLine } from "./paymentMethods";

const methods = (
  rows: SalesPaymentMethodsDto["methods"],
): SalesPaymentMethodsDto => ({
  sales_amount: rows.reduce((sum, row) => sum + row.sales_amount, 0),
  refunded_amount: rows.reduce((sum, row) => sum + row.refunded_amount, 0),
  methods: rows,
});

const CASH = {
  method: "cash",
  sales_amount: 25,
  sales_share: 0.25,
  payment_count: 2,
  refunded_amount: 10.5,
} as const;

describe("refundLine", () => {
  it("says what was paid back through the method, as an outflow", () => {
    expect(refundLine(CASH)).toBe("dont remboursé en espèces : −10,50 €");
    expect(refundLine({ ...CASH, method: "card", refunded_amount: 3 })).toBe(
      "dont remboursé en carte bancaire : −3,00 €",
    );
  });

  it("is absent when nothing was paid back", () => {
    expect(refundLine({ ...CASH, refunded_amount: 0 })).toBeNull();
  });
});

describe("paymentMethodsCsv", () => {
  it("has one row per method, with its label, then the totals", () => {
    const csv = paymentMethodsCsv(
      methods([
        { method: "giftcard", sales_amount: 40, sales_share: 0.4, payment_count: 1, refunded_amount: 0 },
        { method: "card", sales_amount: 35, sales_share: 0.35, payment_count: 2, refunded_amount: 0 },
        CASH,
        { method: "check", sales_amount: 0, sales_share: 0, payment_count: 0, refunded_amount: 15 },
      ]),
    );

    expect(csv.split("\r\n")).toEqual([
      "Mode de paiement,Encaissé sur les ventes (€),Part des ventes (%),Nombre de paiements,Remboursé (€)",
      "Avoir,40,40,1,0",
      "Carte bancaire,35,35,2,0",
      "Espèces,25,25,2,10.5",
      "Chèque,0,0,0,15",
      "Total,100,100,5,25.5",
    ]);
  });

  it("rounds the share to one decimal, and has a 0 % total when nothing was sold", () => {
    const thirds = paymentMethodsCsv(
      methods([
        { method: "card", sales_amount: 20, sales_share: 2 / 3, payment_count: 1, refunded_amount: 0 },
        { method: "cash", sales_amount: 10, sales_share: 1 / 3, payment_count: 1, refunded_amount: 0 },
      ]),
    );
    expect(thirds.split("\r\n").slice(1)).toEqual([
      "Carte bancaire,20,66.7,1,0",
      "Espèces,10,33.3,1,0",
      "Total,30,100,2,0",
    ]);

    const refundsOnly = paymentMethodsCsv(
      methods([{ ...CASH, sales_amount: 0, sales_share: 0, payment_count: 0 }]),
    );
    expect(refundsOnly.split("\r\n")[2]).toBe("Total,0,0,0,10.5");
  });
});
