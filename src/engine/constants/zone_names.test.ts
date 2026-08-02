import { describe, expect, it } from "@jest/globals";

import { getJupB32ScannerPlacementZoneName, zoneNames } from "@/engine/constants/zone_names";

describe("zone name constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(zoneNames).forEach(([key, value]) => expect(key).toBe(value));
  });

  it("should build scanner placement zone names", () => {
    expect(getJupB32ScannerPlacementZoneName(5)).toBe("jup_b32_sr_scanner_place_5");
  });
});
