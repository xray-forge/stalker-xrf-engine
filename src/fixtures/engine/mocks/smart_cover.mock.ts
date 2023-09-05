import { jest } from "@jest/globals";

import { SmartCover } from "@/engine/core/objects/server/smart_cover";
import { TName, TSection } from "@/engine/lib/types";

/**
 * Mock smart cover server object.
 */
export function mockSmartCover(name: TName = "test_smart_cover", section: TSection = "test_smart_cover"): SmartCover {
  const smartTerrain: SmartCover = new SmartCover(section);

  jest.spyOn(smartTerrain, "name").mockImplementation(() => name);

  return smartTerrain;
}
