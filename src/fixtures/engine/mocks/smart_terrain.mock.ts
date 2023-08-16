import { jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { TName, TSection } from "@/engine/lib/types";

/**
 * Mock smart terrain server object.
 */
export function mockSmartTerrain(name: TName = "test_smart", section: TSection = "test_smart_section"): SmartTerrain {
  const smartTerrain: SmartTerrain = new SmartTerrain(section);

  smartTerrain.ini = smartTerrain.spawn_ini();
  jest.spyOn(smartTerrain, "name").mockImplementation(() => name);

  return smartTerrain;
}
