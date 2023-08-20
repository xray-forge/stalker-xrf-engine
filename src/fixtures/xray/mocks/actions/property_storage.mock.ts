import { PropertyStorage } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock property storage instance.
 * Contains properties and corresponding actions for graph.
 */
export class MockPropertyStorage extends MockLuabindClass {
  public static mock(): PropertyStorage {
    return new MockPropertyStorage() as unknown as PropertyStorage;
  }
}
