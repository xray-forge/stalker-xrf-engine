import { PropertyStorage } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockPropertyStorage extends MockLuabindClass {
  public static mock(): PropertyStorage {
    return new MockPropertyStorage() as unknown as PropertyStorage;
  }
}
