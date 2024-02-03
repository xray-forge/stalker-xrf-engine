import { ServerHangingLampObject } from "@/engine/lib/types";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife hanging lamp server object.
 */
export class MockAlifeHangingLamp extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerHangingLampObject {
    return new this(config) as unknown as ServerHangingLampObject;
  }
}
