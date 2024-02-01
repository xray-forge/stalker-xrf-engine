import { ServerItemObject } from "@/engine/lib/types";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife item server object.
 */
export class MockAlifeItem extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerItemObject {
    return new this(config) as unknown as ServerItemObject;
  }
}
