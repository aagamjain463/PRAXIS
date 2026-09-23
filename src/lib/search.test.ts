import { describe, expect, it } from "vitest";
import { searchTerms } from "./search";

describe("searchTerms", () => {
  it("keeps useful concepts and removes question filler", () => {
    expect(searchTerms("What have I learned about customer research?")) .toBe("customer research");
  });
  it("deduplicates terms", () => expect(searchTerms("pricing pricing from books")).toBe("pricing books"));
});
