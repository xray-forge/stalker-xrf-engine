import { describe, expect, it } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";

describe("smart_terrain_generic_utils module", () => {
  it("getSmartTerrainNameCaption should correctly generate captions", () => {
    const first: SmartTerrain = new SmartTerrain("test_init");
    const second: SmartTerrain = new SmartTerrain("test_init");

    expect(getSmartTerrainNameCaption(first)).toBe(`st_${first.name()}_name`);
    expect(getSmartTerrainNameCaption(second)).toBe(`st_${second.name()}_name`);
  });
});
