import type { PropertyStorage } from "xray16/alias";
import { MockLuabindClass } from "xray16/mocks";

/**
 * Mock property storage instance.
 * Contains properties and corresponding actions for graph.
 */
export class MockPropertyStorage extends MockLuabindClass {
  public static mock(): PropertyStorage {
    return new MockPropertyStorage() as unknown as PropertyStorage;
  }
}
