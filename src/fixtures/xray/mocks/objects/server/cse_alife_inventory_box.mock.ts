import { ServerInventoryBox } from "@/engine/lib/types";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife inventory box server object.
 */
export class MockAlifeInventoryBox extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerInventoryBox {
    return new this(config) as unknown as ServerInventoryBox;
  }
}
