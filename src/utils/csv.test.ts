import { describe, expect, it } from "vitest";
import { escapeCsvCell, rowsToCsv } from "./csv";

describe("escapeCsvCell", () => {
  it("escapes commas and quotes", () => {
    expect(escapeCsvCell('Jean, "Paul"')).toBe('"Jean, ""Paul"""');
  });

  it("quotes multiline values", () => {
    expect(escapeCsvCell("ligne1\nligne2")).toBe('"ligne1\nligne2"');
  });

  it("keeps empty values as empty cell", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });
});

describe("rowsToCsv", () => {
  it("builds csv with headers and escaped values", () => {
    const csv = rowsToCsv(
      [
        { name: "Alice", notes: 'Aime "les" livres', city: "Paris, FR" },
        { name: "Bob", notes: "Deux\nlignes", city: "Lyon" },
      ],
      [
        { header: "Nom", key: "name" },
        { header: "Notes", key: "notes" },
        { header: "Ville", key: "city" },
      ],
    );

    expect(csv).toBe(
      'Nom,Notes,Ville\r\nAlice,"Aime ""les"" livres","Paris, FR"\r\nBob,"Deux\nlignes",Lyon',
    );
  });

  it("supports empty row list", () => {
    const csv = rowsToCsv([], [
      { header: "Nom", key: "name" },
      { header: "Montant", key: "amount" },
    ]);
    expect(csv).toBe("Nom,Montant");
  });

  it("supports formatters and french characters", () => {
    const csv = rowsToCsv(
      [{ value: 12.5, org: "Éco-organisme" }],
      [
        { header: "Organisme", key: "org" },
        {
          header: "Poids",
          key: "value",
          format: (value) => `${value} kg`,
        },
      ],
    );

    expect(csv).toBe("Organisme,Poids\r\nÉco-organisme,12.5 kg");
  });
});
