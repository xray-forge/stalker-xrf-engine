import { describe, expect, it } from "@jest/globals";

import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { register } from "@/engine/extensions/require_zones_visit/main";

describe("extensions_list utils", () => {
  it("should correctly change config of map display", () => {
    expect(mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT).toBe(false);

    register();

    expect(mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT).toBe(true);
  });
});
