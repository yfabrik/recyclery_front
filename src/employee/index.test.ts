import { describe, expect, it } from "vitest";
import { employeeColor, employeeInitials, employeeName } from "./index";

describe("employeeName", () => {
  it("joins prenom and nom in that order", () => {
    expect(employeeName({ id: 1, prenom: "Marie", nom: "Dupont" })).toBe("Marie Dupont");
  });

  it("ignores an extraneous fullName field", () => {
    const employee = { id: 1, prenom: "Marie", nom: "Dupont", fullName: "Mme Dupont" };
    expect(employeeName(employee)).toBe("Marie Dupont");
  });
});

describe("employeeInitials", () => {
  it("takes the first letter of prenom and nom, uppercased", () => {
    expect(employeeInitials({ id: 1, prenom: "marie", nom: "dupont" })).toBe("MD");
  });

  it("only uses the first letter of a hyphenated name", () => {
    expect(employeeInitials({ id: 1, prenom: "Jean-Paul", nom: "Dupont-Martin" })).toBe("JD");
  });

  it("uses '?' for an empty prenom", () => {
    expect(employeeInitials({ id: 1, prenom: "", nom: "Dupont" })).toBe("?D");
  });

  it("uses '?' for an empty nom", () => {
    expect(employeeInitials({ id: 1, prenom: "Marie", nom: "" })).toBe("M?");
  });

  it("uses '??' when both fields are empty", () => {
    expect(employeeInitials({ id: 1, prenom: "", nom: "" })).toBe("??");
  });
});

describe("employeeColor", () => {
  it("is stable for a given id", () => {
    const employee = { id: 3, prenom: "Marie", nom: "Dupont" };
    expect(employeeColor(employee)).toBe(employeeColor(employee));
  });

  it("differs between distinct ids within the palette", () => {
    expect(employeeColor({ id: 0, prenom: "A", nom: "B" })).not.toBe(
      employeeColor({ id: 1, prenom: "A", nom: "B" }),
    );
  });

  it("wraps around the palette for ids beyond its length", () => {
    const first = employeeColor({ id: 0, prenom: "A", nom: "B" });
    const wrapped = employeeColor({ id: 8, prenom: "A", nom: "B" });
    expect(wrapped).toBe(first);
    expect(employeeColor({ id: 8, prenom: "A", nom: "B" })).toBe(
      employeeColor({ id: 16, prenom: "A", nom: "B" }),
    );
  });
});
