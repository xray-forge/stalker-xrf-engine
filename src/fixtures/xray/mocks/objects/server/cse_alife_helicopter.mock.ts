import { ServerHelicopterObject } from "@/engine/lib/types";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock helicopter server object.
 */
export class MockAlifeHelicopter extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerHelicopterObject {
    return new this(config) as unknown as ServerHelicopterObject;
  }
}
