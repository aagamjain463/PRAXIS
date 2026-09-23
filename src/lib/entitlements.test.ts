import { describe, expect, it } from "vitest";
import { entitlementFor } from "./entitlements";

describe("entitlementFor", () => {
  it("defaults unknown plans to free", () => expect(entitlementFor("unknown")).toEqual(entitlementFor("free")));
  it("keeps Pro limits explicit", () => expect(entitlementFor("pro").semanticSearch).toBe(true));
});
