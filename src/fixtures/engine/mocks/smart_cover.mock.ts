import { jest } from "@jest/globals";

import { SmartCover } from "@/engine/core/objects/smart_cover/SmartCover";
import { TName, TSection } from "@/engine/lib/types";

/**
 * Smart cover mocked server object.
 */
export class MockSmartCover extends SmartCover {
  public static mock(name: TName = "test_smart_cover", section: TSection = "test_smart_cover"): SmartCover {
    const cover: SmartCover = new SmartCover(section);

    jest.spyOn(cover, "name").mockImplementation(() => name);

    return cover;
  }
}
