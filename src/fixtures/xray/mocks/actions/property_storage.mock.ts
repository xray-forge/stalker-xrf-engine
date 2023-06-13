import { property_storage } from "xray16";

import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockPropertyStorage extends MockLuabindClass {
  public static mock(): property_storage {
    return new MockPropertyStorage() as unknown as property_storage;
  }
}
