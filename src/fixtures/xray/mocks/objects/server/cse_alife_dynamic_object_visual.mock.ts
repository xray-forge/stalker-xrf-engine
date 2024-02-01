import { ServerDynamicVisualObject } from "@/engine/lib/types";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife dynamic visual server object.
 */
export class MockAlifeDynamicObjectVisual extends MockAlifeDynamicObject {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerDynamicVisualObject {
    return new this(config) as unknown as ServerDynamicVisualObject;
  }
}
