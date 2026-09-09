import { describe, expect, it } from "vitest";
import { parseListingSearch } from "../../../shared/listingSearch";

describe("parseListingSearch", () => {
  it.each([
    ["ev", 1],
    ["araba", 2],
    ["car", 2],
    ["telefon", 3],
    ["ev eşyası", 4],
  ])("maps %s to category %s", (search, categoryId) => {
    expect(parseListingSearch(search)).toEqual({ categoryId });
  });

  it("keeps non-category terms for text matching", () => {
    expect(parseListingSearch("ev Kadıköy")).toEqual({
      categoryId: 1,
      textSearch: "Kadıköy",
    });
  });

  it("leaves a regular text search unchanged", () => {
    expect(parseListingSearch("deniz manzaralı")).toEqual({
      textSearch: "deniz manzaralı",
    });
  });
});
