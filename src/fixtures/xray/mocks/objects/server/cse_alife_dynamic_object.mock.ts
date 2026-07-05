import { ServerDynamicObject } from "xray16/alias";

import { IMockAlifeObjectConfig, MockAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock dynamic alife server object.
 */
export class MockAlifeDynamicObject extends MockAlifeObject {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerDynamicObject {
    return new this(config) as unknown as ServerDynamicObject;
  }
}
