import { beforeEach, describe, expect, it } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getSmartTerrainNameCaption } from "@/engine/core/objects/smart_terrain/utils/smart_terrain_generic_utils";
import { resetRegistry } from "@/fixtures/engine";

describe("getSmartTerrainNameCaption util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it(" should correctly generate captions", () => {
    const first: SmartTerrain = new SmartTerrain("test_init");
    const second: SmartTerrain = new SmartTerrain("test_init");

    expect(getSmartTerrainNameCaption(first)).toBe(`st_${first.name()}_name`);
    expect(getSmartTerrainNameCaption(second)).toBe(`st_${second.name()}_name`);
  });
});
