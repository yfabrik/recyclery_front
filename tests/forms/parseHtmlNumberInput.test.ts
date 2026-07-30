import { describe, expect, it } from "vitest";
import { parseHtmlNumberInput } from "../../src/components/forms/parseHtmlNumberInput";

describe("parseHtmlNumberInput", () => {
  it('maps empty string to ""', () => {
    expect(parseHtmlNumberInput("")).toBe("");
  });

  it("maps numeric strings to numbers", () => {
    expect(parseHtmlNumberInput("12.5")).toBe(12.5);
    expect(parseHtmlNumberInput("0")).toBe(0);
  });
});
