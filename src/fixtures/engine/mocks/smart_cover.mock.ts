import { jest } from "@jest/globals";

import { SmartCover } from "@/engine/core/objects/smart_cover";
import { TName, TSection } from "@/engine/lib/types";

/**
 * Mock smart cover server object.
 */
export function mockSmartCover(name: TName = "test_smart_cover", section: TSection = "test_smart_cover"): SmartCover {
  const cover: SmartCover = new SmartCover(section);

  jest.spyOn(cover, "name").mockImplementation(() => name);

  return cover;
}
